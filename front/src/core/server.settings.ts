import { parseInteger } from "../shared/numbers.parse.ts";
import { readSetting } from "../shared/settings.read.ts";

export function readServerSettings(environment = process.env) {
  return {
    port: readSetting({
      value: environment.PORT,
      fallback: "4000",
      parse: (value) => parseInteger({ value, field: "PORT", minimum: 1, maximum: 65535 }),
    }),
    apiBaseUrl: environment.API_BASE_URL ?? "http://localhost:3000",
  };
}
