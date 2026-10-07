import assert from "node:assert/strict";
import test from "node:test";
import { createHealthService } from "./health.service.ts";

void test("health records startup and reads count through its repository", () => {
  let runs = 4;
  const service = createHealthService({
    recordRun() {
      runs++;
    },
    countRuns() {
      return runs;
    },
  });
  const health = service.read();
  assert.equal(health.status, "ok");
  assert.equal(health.runs, 5);
  assert.ok(health.uptime > 0);
  assert.ok(service.read().uptime > health.uptime);
});
