import { test, expect } from "../../shared/fixtures.ts";
import { expectError } from "../../shared/error.check.ts";
import { freePort } from "../../shared/projects/port.find.ts";
import { startProject } from "../../shared/projects/process.start.ts";
import { runProject, withTemporaryDirectory } from "../../shared/projects/project.run.ts";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

test(
  "request logs have local columns, severity and no sensitive values",
  { tag: ["@S0002-R01", "@S0002-R02"] },
  async ({ backDirectory }) => {
    await withTemporaryDirectory("monitoring-", async (directory) => {
      const identifier = crypto.randomUUID();
      const settings = {
        kind: "back",
        directory: backDirectory,
        environment: { LOG_DIR: directory },
      } as const;
      await runProject(settings, async (instance) => {
        await fetch(`${instance.url}/api/missing`, { headers: { "X-Request-Id": identifier } });
        await fetch(instance.url, { method: "OPTIONS" });
      });
      const files = await readdir(directory);
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/^\d{4}-\d{2}-\d{2}\.log$/);
      const lines = (await readFile(join(directory, files[0]!), "utf8")).trim().split("\n");
      expect(
        lines.some((line) =>
          /^\d{2}:\d{2}:\d{2}\.\d{3} back WARN GET \/api\/missing 404 \d+(\.\d+)?ms$/.test(line),
        ),
      ).toBe(true);
      expect(lines.some((line) => line.includes(" INFO OPTIONS / 204 "))).toBe(true);
      expect(lines.join("\n")).not.toContain(identifier);
    });
  },
);
test(
  "warn threshold excludes successful requests",
  { tag: "@S0002-R03" },
  async ({ backDirectory }) => {
    await withTemporaryDirectory("threshold-", async (directory) => {
      const settings = {
        kind: "back",
        directory: backDirectory,
        environment: { LOG_DIR: directory, LOG_LEVEL: "warn" },
      } as const;
      await runProject(settings, async (instance) => {
        await fetch(instance.url, { method: "OPTIONS" });
      });
      const files = await readdir(directory);
      const text = (
        await Promise.all(files.map((file) => readFile(join(directory, file), "utf8")))
      ).join("");
      expect(text).not.toContain("INFO");
      expect(text).not.toContain("OPTIONS");
    });
  },
);
test("unknown API has uniform 404 error", { tag: "@S0002-R04" }, async ({ backUrl, request }) => {
  const response = await request.get(`${backUrl}/api/${crypto.randomUUID()}`);
  expect(response.status()).toBe(404);
  expectError(await response.json(), "Not found");
});
test("invalid JSON has uniform 400 error", { tag: "@S0002-R05" }, async ({ backUrl, request }) => {
  const response = await request.post(`${backUrl}/api/missing`, {
    headers: { "Content-Type": "application/json" },
    data: "{bad secret-value",
  });
  expect(response.status()).toBe(400);
  expectError(await response.json());
  expect(await response.text()).not.toContain("secret-value");
});
test(
  "request ID is preserved or generated and security headers apply",
  { tag: ["@S0002-R06", "@S0002-R07", "@S0002-R08"] },
  async ({ backUrl, request }) => {
    const identifier = crypto.randomUUID();
    const response = await request.get(backUrl, { headers: { "X-Request-Id": identifier } });
    expect(response.headers()["x-request-id"]).toBe(identifier);
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["x-frame-options"]).toBe("DENY");
    expect(response.headers()["referrer-policy"]).toBe("no-referrer");
    const first = await request.get(backUrl);
    const second = await request.get(backUrl);
    expect(first.headers()["x-request-id"]).toMatch(/^[a-zA-Z0-9-]+$/);
    expect(first.headers()["x-request-id"]).not.toBe(second.headers()["x-request-id"]);
  },
);
test(
  "oversized body has uniform 413 error",
  { tag: "@S0002-R09" },
  async ({ backUrl, request }) => {
    const response = await request.post(`${backUrl}/api/missing`, {
      data: { value: "x".repeat(101 * 1024) },
    });
    expect(response.status()).toBe(413);
    expectError(await response.json());
  },
);
for (const kind of ["back", "front"] as const) {
  test(
    `${kind} prints confirmed openable listening URL`,
    { tag: kind === "back" ? "@S0002-R10" : "@S0002-R11" },
    async ({ backDirectory, frontDirectory }) => {
      const directory = kind === "back" ? backDirectory : frontDirectory;
      await runProject({ kind, directory }, async (instance) => {
        expect(instance.output).toContain(`Listening on ${instance.url}`);
        expect((await fetch(instance.url)).status).toBe(kind === "back" ? 404 : 200);
      });
    },
  );
}
test(
  "failed server startup prints no listening line",
  { tag: "@S0002-R12" },
  async ({ backDirectory }) => {
    const instance = await startProject({
      kind: "back",
      directory: backDirectory,
      port: await freePort(),
      environment: { PORT: "invalid" },
    });
    try {
      expect(await instance.exited).not.toBe(0);
      expect(instance.output).not.toContain("Listening on");
    } finally {
      await instance.stop();
    }
  },
);
