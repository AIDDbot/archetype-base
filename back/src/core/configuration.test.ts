import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { migrateDatabase } from "./database.ts";
import { readSettings } from "./settings.ts";

void test("settings reject invalid PORT instead of using its default", () => {
  for (const PORT of ["0", "65536", "3.5", "abc", ""])
    assert.throws(() => readSettings({ PORT }), /PORT/);
  assert.equal(readSettings({}).port, 3000);
});
void test("migrations are recorded once and unknown versions fail", () => {
  const database = new DatabaseSync(":memory:");
  migrateDatabase(database);
  migrateDatabase(database);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM schema_versions").get()?.count, 3);
  database
    .prepare("INSERT INTO schema_versions VALUES (?, ?)")
    .run("9999-unknown.sql", new Date().toISOString());
  assert.throws(() => migrateDatabase(database), /9999-unknown.sql/);
  database.close();
});
