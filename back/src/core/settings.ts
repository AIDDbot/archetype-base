import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { parseInteger } from "../shared/numbers.parse.ts";
import { readSetting } from "../shared/settings.read.ts";
import type { LogLevel } from "../shared/logger.type.ts";

export const projectDirectory = fileURLToPath(new URL("../../", import.meta.url));
function readProjectPath(input: { value: string | undefined; fallback: string }) {
  return readSetting({ ...input, parse: (value) => resolve(projectDirectory, value) });
}
function readCorsOrigins(value: string | undefined) {
  return (value ?? "*").split(",").map((origin) => origin.trim());
}
function readSessionTtl(value: string | undefined) {
  return readSetting({
    value,
    fallback: "24",
    parse: (text) =>
      parseInteger({ value: text, field: "SESSION_TTL_HOURS", minimum: 1, maximum: 720 }),
  });
}
function readBodyLimit(value: string | undefined) {
  return readSetting({
    value,
    fallback: "100",
    parse: (text) =>
      parseInteger({
        value: text,
        field: "BODY_LIMIT_KB",
        minimum: 1,
        maximum: Number.MAX_SAFE_INTEGER,
      }),
  });
}
export function readSettings(environment = process.env) {
  const port = readSetting({
    value: environment.PORT,
    fallback: "3000",
    parse: (value) => parseInteger({ value, field: "PORT", minimum: 1, maximum: 65535 }),
  });
  return {
    port,
    sessionTtlHours: readSessionTtl(environment.SESSION_TTL_HOURS),
    logDirectory: readProjectPath({ value: environment.LOG_DIR, fallback: "./logs" }),
    logLevel: readLogLevel(environment.LOG_LEVEL ?? "info"),
    bodyLimitKb: readBodyLimit(environment.BODY_LIMIT_KB),
    host: environment.HOST ?? "0.0.0.0",
    databasePath: readProjectPath({
      value: environment.DATABASE_URL,
      fallback: "./data/app.sqlite",
    }),
    corsOrigins: readCorsOrigins(environment.CORS_ORIGIN),
  };
}
function readLogLevel(value: string): LogLevel {
  if (value === "debug" || value === "info" || value === "warn" || value === "error") return value;
  throw new Error("LOG_LEVEL must be debug, info, warn or error");
}
