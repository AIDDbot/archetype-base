import { composeApplication } from "./app.compose.ts";
import { readSettings } from "./core/settings.ts";
import { openDatabase } from "./core/database.ts";
import { registerShutdown } from "./core/shutdown.ts";

import { createLogger } from "./core/logger.ts";
try {
  const settings = readSettings();
  const logger = createLogger({ directory: settings.logDirectory, level: settings.logLevel });
  const database = openDatabase(settings.databasePath);
  const application = composeApplication({
    corsOrigins: settings.corsOrigins,
    database,
    sessionTtlHours: settings.sessionTtlHours,
    logger,
    bodyLimitKb: settings.bodyLimitKb,
  });
  const server = application.listen(settings.port, settings.host, () => {
    const host =
      settings.host === "0.0.0.0" || settings.host === "::"
        ? "localhost"
        : settings.host.includes(":")
          ? `[${settings.host}]`
          : settings.host;
    console.log(`Listening on http://${host}:${settings.port}`);
  });
  registerShutdown(server, { database, logger });
  server.on("error", (error) => {
    console.error(error.message);
    database.close();
    process.exitCode = 1;
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
