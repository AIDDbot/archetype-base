import assert from "node:assert/strict";
import test from "node:test";
import { readAccount } from "./users.service.ts";

void test("account exposes only own public details and hides other identifiers", () => {
  const user = { id: "own", name: "Name", email: "email", role: "user", createdAt: "date" };
  assert.deepEqual(readAccount({ id: "own", user }), {
    name: "Name",
    email: "email",
    createdAt: "date",
  });
  assert.throws(() => readAccount({ id: "other", user }), /Not found/);
});
