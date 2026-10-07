import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { parseInteger } from "../shared/numbers.parse.ts";

export function readSuiteSettings() {
  const directory = fileURLToPath(new URL("../", import.meta.url));
  const timeout = parseInteger({
    value: process.env.E2E_STARTUP_TIMEOUT_MS ?? "15000",
    field: "E2E_STARTUP_TIMEOUT_MS",
    minimum: 1,
    maximum: Number.MAX_SAFE_INTEGER,
  });
  const projects = (["back", "front"] as const).map((kind) => {
    const prefix = kind.toUpperCase();
    const suppliedPort = process.env[`${prefix}_PORT`];
    const port = parseInteger({
      value: suppliedPort ?? (kind === "back" ? "3000" : "4000"),
      field: `${prefix}_PORT`,
      minimum: 1,
      maximum: 65535,
    });
    return {
      kind,
      port,
      directory: resolve(directory, process.env[`${prefix}_DIRECTORY`] ?? `../${kind}`),
      command: process.env[`${prefix}_START`] ?? "npm run start",
      environment: suppliedPort === undefined ? {} : { PORT: suppliedPort },
    };
  });
  return { projects, timeout };
}
