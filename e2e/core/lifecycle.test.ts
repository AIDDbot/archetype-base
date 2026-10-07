import assert from "node:assert/strict";
import test from "node:test";
import { stopSuite } from "./lifecycle.ts";

void test("suite teardown stops every owned project", async () => {
  const stopped: string[] = [];
  const projects = ["back", "front"].map((url) => ({
    url,
    stop: async () => {
      stopped.push(url);
    },
  }));
  await stopSuite({ projects });
  assert.deepEqual(stopped.sort(), ["back", "front"]);
});
