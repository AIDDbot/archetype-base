import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { projectDirectory } from "./settings.ts";

const VERSIONS = "SELECT version FROM schema_versions ORDER BY version";
const RECORD_VERSION = "INSERT INTO schema_versions(version, appliedAt) VALUES (?, ?)";
export function migrateDatabase(database: DatabaseSync) {
  const directory = join(projectDirectory, "migrations");
  const files = readdirSync(directory)
    .filter((file) => /^\d{4}-.+\.sql$/.test(file))
    .sort();
  database.exec(
    "CREATE TABLE IF NOT EXISTS schema_versions (version TEXT PRIMARY KEY, appliedAt TEXT NOT NULL)",
  );
  const versions = database
    .prepare(VERSIONS)
    .all()
    .map((row) => String(row.version));
  const unknown = versions.find((version) => !files.includes(version));
  if (unknown) throw new Error(`Unknown database schema version ${unknown}`);
  for (const file of files) {
    if (versions.includes(file)) continue;
    applyMigration(database, { file, directory });
  }
}
function applyMigration(database: DatabaseSync, migration: { file: string; directory: string }) {
  database.exec("BEGIN");
  try {
    database.exec(readFileSync(join(migration.directory, migration.file), "utf8"));
    database.prepare(RECORD_VERSION).run(migration.file, new Date().toISOString());
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
export function openDatabase(path: string) {
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  migrateDatabase(database);
  return database;
}
