import { test, expect } from "../../shared/fixtures.ts";
import { runProject, withTemporaryDirectory } from "../../shared/projects/project.run.ts";
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
    await withTemporaryDirectory("health-runs-", async (directory) => {
      const settings = {
        kind: "back",
        directory: backDirectory,
        environment: { DATABASE_URL: join(directory, "database.sqlite") },
      } as const;
      const readRuns = async (instance: { url: string }) =>
        ((await (await fetch(`${instance.url}/api/health`)).json()) as Health).runs;
      const first = await runProject(settings, readRuns);
      const second = await runProject(settings, readRuns);
      expect(second).toBeGreaterThan(first);
    });
  },
);
