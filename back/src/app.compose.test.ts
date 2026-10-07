import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { composeApplication } from "./app.compose.ts";
import { migrateDatabase } from "./core/database.ts";

void test("composition registers independent applications without listening", () => {
  const database = new DatabaseSync(":memory:");
  migrateDatabase(database);
  const first = composeApplication({ database });
  const second = composeApplication({ database });
  assert.notEqual(first, second);
  assert.equal(typeof first.listen, "function");
  database.close();
});
