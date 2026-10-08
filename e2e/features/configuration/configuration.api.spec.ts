import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test, expect } from "../../shared/fixtures.ts";
import { freePort } from "../../shared/projects/port.find.ts";
import { startProject } from "../../shared/projects/process.start.ts";
import { runProject, withTemporaryDirectory } from "../../shared/projects/project.run.ts";

test("back listens on supplied port", { tag: "@S0001-R01" }, async ({ backDirectory }) => {
  await runProject({ kind: "back", directory: backDirectory }, async (instance) => {
    expect((await fetch(instance.url)).status).toBe(404);
  });
});
test(
  "back listens on default port with wildcard CORS",
  { tag: ["@S0001-R02", "@S0001-R07"] },
  async ({ backUrl, request }) => {
    expect(new URL(backUrl).port).toBe("3000");
    const response = await request.get(backUrl);
    expect(response.status()).toBe(404);
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
  },
);
test(
  "front serves document on supplied port and configured runtime URL",
  { tag: ["@S0001-R03", "@S0001-R08"] },
  async ({ frontDirectory }) => {
    const apiBaseUrl = `https://api-${crypto.randomUUID()}.example`;
    const settings = {
      kind: "front",
      directory: frontDirectory,
      environment: { API_BASE_URL: apiBaseUrl },
    } as const;
    await runProject(settings, async (instance) => {
      expect(await (await fetch(instance.url)).text()).toContain("/src/app.main.ts");
      const response = await fetch(`${instance.url}/runtime-config.json`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ apiBaseUrl });
    });
  },
);
test(
  "front serves document on default port",
  { tag: "@S0001-R04" },
  async ({ frontUrl, request }) => {
    expect(new URL(frontUrl).port).toBe("4000");
    const response = await request.get(frontUrl);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("/src/app.main.ts");
  },
);
test(
  "both projects reject invalid ports",
  { tag: "@S0001-R05" },
  async ({ backDirectory, frontDirectory }) => {
    for (const kind of ["back", "front"] as const) {
      for (const PORT of ["0", "65536", "3.5", "abc"]) {
        const instance = await startProject({
          kind,
          directory: kind === "back" ? backDirectory : frontDirectory,
          port: await freePort(),
          environment: { PORT },
        });
        try {
          expect(await instance.exited).not.toBe(0);
          expect(instance.output).toContain("PORT");
        } finally {
          await instance.stop();
        }
      }
    }
  },
);
test(
  "back reflects origins in its configured list",
  { tag: "@S0001-R06" },
  async ({ backDirectory }) => {
    const origin = `https://${crypto.randomUUID()}.example`;
    const settings = {
      kind: "back",
      directory: backDirectory,
      environment: { CORS_ORIGIN: `https://other.example,${origin}` },
    } as const;
    await runProject(settings, async (instance) => {
      const response = await fetch(instance.url, { headers: { Origin: origin } });
      expect(response.headers.get("access-control-allow-origin")).toBe(origin);
    });
  },
);
test(
  "migrations persist once across restarts",
  { tag: "@S0001-R09" },
  async ({ backDirectory }) => {
    await withTemporaryDirectory("aidd-migrations-", async (directory) => {
      const path = join(directory, "database.sqlite");
      const settings = {
        kind: "back",
        directory: backDirectory,
        environment: { DATABASE_URL: path },
      } as const;
      for (let run = 0; run < 2; run++) await runProject(settings, async () => {});
      const database = new DatabaseSync(path);
      const rows = database
        .prepare("SELECT version, appliedAt FROM schema_versions ORDER BY version")
        .all();
      expect(rows.length).toBeGreaterThan(0);
      expect(new Set(rows.map((row) => row.version)).size).toBe(rows.length);
      for (const row of rows) expect(Number.isNaN(Date.parse(String(row.appliedAt)))).toBe(false);
      database.close();
    });
  },
);
test("unknown database version stops startup", { tag: "@S0001-R10" }, async ({ backDirectory }) => {
  await withTemporaryDirectory("aidd-unknown-", async (directory) => {
    const path = join(directory, "database.sqlite");
    const unknown = `9999-${crypto.randomUUID()}.sql`;
    const database = new DatabaseSync(path);
    database.exec(
      "CREATE TABLE schema_versions(version TEXT PRIMARY KEY, appliedAt TEXT NOT NULL)",
    );
    database
      .prepare("INSERT INTO schema_versions VALUES (?, ?)")
      .run(unknown, new Date().toISOString());
    database.close();
    const instance = await startProject({
      kind: "back",
      directory: backDirectory,
      port: await freePort(),
      environment: { DATABASE_URL: path },
    });
    try {
      expect(await instance.exited).not.toBe(0);
      expect(instance.output).toContain(unknown);
    } finally {
      await instance.stop();
    }
  });
});
