import { createServer, completeServer } from "./core/server.ts";
import { registerFeatures } from "./features/features.manifest.ts";
import type { Database } from "./shared/database/database.type.ts";
import type { Logger } from "./shared/logger.type.ts";

export function composeApplication(options: {
  corsOrigins?: readonly string[];
  database: Database;
  sessionTtlHours?: number;
  logger?: Logger;
  bodyLimitKb?: number;
}) {
  const application = createServer({
    ...(options.corsOrigins ? { origins: options.corsOrigins } : {}),
    ...(options.logger ? { logger: options.logger } : {}),
    ...(options.bodyLimitKb ? { bodyLimitKb: options.bodyLimitKb } : {}),
  });
  mountRegistrations(
    application,
    registerFeatures({
      database: options.database,
      sessionTtlHours: options.sessionTtlHours ?? 24,
    }),
  );
  completeServer(application, options.logger);
  return application;
}

import { mountRegistrations } from "./core/session.ts";
