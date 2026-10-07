import assert from "node:assert/strict";
import test from "node:test";
import { createSubmission, createSessionStore } from "./auth.store.ts";

void test("submission state prevents overlapping requests and permits retry", () => {
  const submission = createSubmission();
  assert.equal(submission.begin(), true);
  assert.equal(submission.begin(), false);
  assert.equal(submission.isSending, true);
  submission.finish();
  assert.equal(submission.begin(), true);
});

void test("session logic uses fake persistence and notifications without browser globals", () => {
  const writes: string[] = [];
  let removed = 0;
  let notifications = 0;
  const persistence = {
    readToken: () => null,
    writeToken(token: string) {
      writes.push(token);
    },
    clearToken() {
      removed++;
    },
  };
  const store = createSessionStore({
    persistence,
    notify() {
      notifications++;
    },
  });
  const user = {
    id: "user-id",
    email: "user@example.test",
    name: "User",
    role: "user" as const,
    createdAt: "2026-10-06T00:00:00.000Z",
  };
  assert.equal(store.readUser(), undefined);
  store.setSession({ token: "opaque-token", user });
  assert.deepEqual(writes, ["opaque-token"]);
  assert.equal(store.readUser(), user);
  assert.equal(notifications, 1);
  store.clearSession();
  assert.equal(removed, 1);
  assert.equal(store.readUser(), undefined);
  assert.equal(notifications, 2);
  store.restoreUser(user);
  assert.equal(store.readUser(), user);
  assert.deepEqual(writes, ["opaque-token"]);
  assert.equal(notifications, 3);
});
