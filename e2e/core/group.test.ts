import assert from "node:assert/strict";
import test from "node:test";
import { stopProcessGroup } from "../shared/projects/group.stop.ts";

void test("owned group cleanup awaits liveness boundary and tolerates an ended group", async () => {
  let probes = 0;
  let waits = 0;
  await stopProcessGroup(123, {
    signal(group, signal) {
      assert.equal(group, -123);
      if (signal !== 0) return;
      probes++;
      if (probes > 2) {
        const error = new Error("ended") as NodeJS.ErrnoException;
        error.code = "ESRCH";
        throw error;
      }
    },
    wait: async () => {
      waits++;
    },
    now: () => 0,
  });
  assert.equal(waits, 2);
});
void test("owned group cleanup reports survivors past its existing timeout", async () => {
  let time = 0;
  await assert.rejects(
    stopProcessGroup(123, {
      signal() {},
      wait: async (milliseconds) => {
        time += milliseconds;
      },
      now: () => time,
    }),
    /did not terminate/,
  );
});
