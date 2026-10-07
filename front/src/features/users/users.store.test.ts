import assert from "node:assert/strict";
import test from "node:test";
import { createAccountStore } from "./users.store.ts";

void test("account state retains declared loaded or unavailable result", async () => {
  const store = createAccountStore({ read: async () => ({ status: "not-found" }) });
  assert.equal(store.state.status, "loading");
  assert.deepEqual(await store.load({ value: "missing" }), { status: "not-found" });
});
