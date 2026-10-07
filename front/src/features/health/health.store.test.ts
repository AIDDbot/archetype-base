import assert from "node:assert/strict";
import test from "node:test";
import { createHealthStore } from "./health.store.ts";

void test("health store progresses from loading to loaded or unavailable", async () => {
  const health = { status: "ok" as const, runs: 3, uptime: 2 };
  const available = createHealthStore({ read: async () => health });
  assert.equal(available.state.status, "loading");
  assert.deepEqual(await available.load(), { status: "loaded", health });
  const unavailable = createHealthStore({ read: async () => undefined });
  assert.deepEqual(await unavailable.load(), { status: "unavailable" });
});
