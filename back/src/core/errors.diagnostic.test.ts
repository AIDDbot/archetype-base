import assert from "node:assert/strict";
import test from "node:test";
import { describeFailure } from "./errors.diagnostic.ts";

void test("diagnostics distinguish messages and causes without enumerating attached secrets", () => {
  const error = new Error("Safe operation failed", { cause: new Error("Safe database cause") });
  Object.assign(error, {
    password: "secret-password",
    token: "secret-token",
    formValue: "private-form-value",
  });
  assert.equal(
    describeFailure(error),
    "Error: Safe operation failed <- caused by Error: Safe database cause",
  );
  assert.notEqual(describeFailure(new Error("Different safe failure")), describeFailure(error));
});
void test("cyclic cause chain terminates without an arbitrary depth limit", () => {
  const error = new Error("Safe cyclic failure");
  error.cause = error;
  assert.equal(describeFailure(error), "Error: Safe cyclic failure");
});
