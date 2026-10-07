import assert from "node:assert/strict";
import test from "node:test";
import { readAuthInput } from "./auth.controller.ts";
import { ExpectedError } from "../../shared/error.type.ts";

void test("auth input aggregates every field error for register and login", () => {
  for (const isRegister of [true, false]) {
    assert.throws(
      () => readAuthInput({ email: 3, name: " ", password: "" }, isRegister),
      (error: unknown) => {
        assert.ok(error instanceof ExpectedError);
        assert.equal(error.details.status, 400);
        assert.deepEqual(
          error.details.fields,
          isRegister
            ? {
                email: "email is required",
                name: "name is required",
                password: "password is required",
              }
            : { email: "email is required", password: "password is required" },
        );
        return true;
      },
    );
  }
});
void test("auth modes normalize identity while preserving original password", () => {
  const input = { email: " USER@EXAMPLE.TEST ", name: " Name ", password: " secret " };
  const registered = readAuthInput(input, true);
  const login = readAuthInput(input, false);
  assert.equal(registered.email.value, "user@example.test");
  assert.equal(registered.name, "Name");
  assert.equal(registered.password, " secret ");
  assert.equal(login.email.value, registered.email.value);
  assert.equal(login.name, "");
  assert.equal(login.password, input.password);
});
