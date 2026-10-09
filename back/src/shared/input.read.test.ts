import { test } from "node:test";
import assert from "node:assert/strict";
import { ExpectedError } from "./error.type.ts";
import { integerIn, oneOf, readFields, text } from "./input.read.ts";

const rules = { name: text, seats: integerIn(1, 9), range: oneOf(["Earth", "Moon"] as const) };

void test("readFields returns the typed values of a valid input", () => {
  const values = readFields({ name: " Ares ", seats: 4, range: "Moon" }, rules);
  assert.deepEqual(values, { name: "Ares", seats: 4, range: "Moon" });
});
void test("readFields collects the error of each invalid field", () => {
  assert.throws(
    () => readFields({ seats: 10, range: "Mars" }, rules),
    (error: unknown) =>
      error instanceof ExpectedError &&
      error.details.status === 400 &&
      Object.keys(error.details.fields ?? {}).join() === "name,seats,range",
  );
});
