import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { projectDirectory, readSettings } from "./settings.ts";

void test("settings preserve configured values and project-relative paths from another directory", () => {
  const previous = process.cwd();
  process.chdir(tmpdir());
  try {
    const defaults = readSettings({});
    assert.equal(defaults.sessionTtlHours, 24);
    assert.equal(defaults.bodyLimitKb, 100);
    assert.equal(defaults.logLevel, "info");
    assert.equal(defaults.host, "0.0.0.0");
    assert.deepEqual(defaults.corsOrigins, ["*"]);
    assert.equal(defaults.databasePath, resolve(projectDirectory, "./data/app.sqlite"));
    assert.equal(defaults.logDirectory, resolve(projectDirectory, "./logs"));
    const configured = readSettings({
      PORT: "65535",
      HOST: "127.0.0.1",
      SESSION_TTL_HOURS: "720",
      BODY_LIMIT_KB: "1",
      LOG_LEVEL: "debug",
      LOG_DIR: "./custom-logs",
      DATABASE_URL: "./custom-data/app.sqlite",
      CORS_ORIGIN: " https://first.example , https://second.example ",
    });
    assert.equal(configured.port, 65535);
    assert.equal(configured.sessionTtlHours, 720);
    assert.equal(configured.bodyLimitKb, 1);
    assert.equal(configured.logLevel, "debug");
    assert.equal(configured.host, "127.0.0.1");
    assert.deepEqual(configured.corsOrigins, ["https://first.example", "https://second.example"]);
    assert.equal(configured.databasePath, resolve(projectDirectory, "./custom-data/app.sqlite"));
    assert.equal(configured.logDirectory, resolve(projectDirectory, "./custom-logs"));
  } finally {
    process.chdir(previous);
  }
});
void test("invalid numeric and log settings preserve named startup failures", () => {
  for (const value of ["0", "721", "1.5", "invalid", ""])
    assert.throws(() => readSettings({ SESSION_TTL_HOURS: value }), /SESSION_TTL_HOURS/);
  for (const value of ["0", "1.5", "invalid", ""])
    assert.throws(() => readSettings({ BODY_LIMIT_KB: value }), /BODY_LIMIT_KB/);
  assert.throws(
    () => readSettings({ LOG_LEVEL: "invalid" }),
    /LOG_LEVEL must be debug, info, warn or error/,
  );
});
