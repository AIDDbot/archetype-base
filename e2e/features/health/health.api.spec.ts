import { test, expect } from "../../shared/fixtures.ts";
import { startProject, waitForProject } from "../../shared/projects/process.start.ts";
import { freePort } from "../../shared/projects/port.find.ts";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface Health {
  status: string;
  runs: number;
  uptime: number;
}
test(
  "health has only status runs and increasing uptime",
  { tag: ["@S0004-R01", "@S0004-R03"] },
  async ({ request, backUrl }) => {
    const response = await request.get(`${backUrl}/api/health`);
    expect(response.status()).toBe(200);
    const first = (await response.json()) as Health;
    expect(first).toEqual({ status: "ok", runs: expect.any(Number), uptime: expect.any(Number) });
    expect(Number.isInteger(first.runs)).toBe(true);
    expect(first.runs).toBeGreaterThanOrEqual(1);
    expect(first.uptime).toBeGreaterThan(0);
    const second = (await (await request.get(`${backUrl}/api/health`)).json()) as Health;
    expect(second.uptime).toBeGreaterThan(first.uptime);
  },
);
test(
  "restart increments persisted startup count",
  { tag: "@S0004-R02" },
  async ({ backDirectory }) => {
    const directory = await mkdtemp(join(tmpdir(), "health-runs-"));
    const counts: number[] = [];
    try {
      for (let run = 0; run < 2; run++) {
        const port = await freePort();
        const instance = await startProject({
          kind: "back",
          directory: backDirectory,
          port,
          environment: { PORT: String(port), DATABASE_URL: join(directory, "database.sqlite") },
        });
        try {
          await waitForProject(instance, 15000);
          counts.push(((await (await fetch(`${instance.url}/api/health`)).json()) as Health).runs);
        } finally {
          await instance.stop();
        }
      }
      expect(counts[1]).toBeGreaterThan(counts[0]!);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
