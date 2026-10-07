import assert from "node:assert/strict";
import test from "node:test";
import { formatFact, isEndAligned, listMessage, missingValue } from "./record.format.ts";

void test("a missing fact shows a dash, never undefined, null or an empty value", () => {
  assert.equal(formatFact("text", undefined), missingValue);
  assert.equal(formatFact("text", "  "), missingValue);
  assert.equal(formatFact("list", []), missingValue);
  assert.equal(formatFact("number", undefined), missingValue);
});
void test("facts keep their kind when they show", () => {
  assert.equal(formatFact("list", ["Vite", "Pico CSS"]), "Vite, Pico CSS");
  assert.match(formatFact("number", 1234), /^1\D?234$/);
  assert.match(formatFact("duration", 65), /\d/);
});
void test("numbers, dates and durations align to the end of a table cell", () => {
  assert.equal(isEndAligned("number"), true);
  assert.equal(isEndAligned("date"), true);
  assert.equal(isEndAligned("duration"), true);
  assert.equal(isEndAligned("text"), false);
  assert.equal(isEndAligned("list"), false);
});
void test("an empty list shows its empty message in the place of the table", () => {
  assert.equal(listMessage(0, "No projects"), "No projects");
  assert.equal(listMessage(2, "No projects"), undefined);
});
