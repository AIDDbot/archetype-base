CREATE TABLE IF NOT EXISTS schema_versions (
  version TEXT PRIMARY KEY,
  appliedAt TEXT NOT NULL
);
