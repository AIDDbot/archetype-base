import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLogger } from "./logger.ts";

void test("logger filters levels and flushes single plain-text lines", async () => {
  const directory = await mkdtemp(join(tmpdir(), "logger-"));
  const logger = createLogger({ directory, level: "warn" });
  logger.write("info", "hidden");
  logger.write("warn", "first\nsecond");
  await logger.flush();
  const files = await readdir(directory);
  const text = await readFile(join(directory, files[0]!), "utf8");
  assert.match(text, /^\d{2}:\d{2}:\d{2}\.\d{3} back WARN first \| second\n$/);
  assert.equal(text.includes("hidden"), false);
  await rm(directory, { recursive: true, force: true });
});
