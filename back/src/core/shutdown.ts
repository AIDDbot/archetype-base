import type { Server } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import type { Logger } from "../shared/logger.type.ts";

export function registerShutdown(
  server: Server,
  resources: { database: DatabaseSync; logger: Logger },
) {
  let isStopping = false;
  let isFinalized = false;
  let hasTimedOut = false;
  function finalize(exitCode: number) {
    if (isFinalized) return;
    isFinalized = true;
    resources.database.close();
    process.exitCode = hasTimedOut ? 1 : exitCode;
    process.disconnect?.();
  }
  function stop() {
    if (isStopping) return;
    isStopping = true;
    const deadline = setTimeout(() => {
      hasTimedOut = true;
      server.closeAllConnections();
      finalize(1);
    }, 5000);
    server.close((error) => {
      if (isFinalized) return;
      void resources.logger.flush().then(() => {
        clearTimeout(deadline);
        finalize(error ? 1 : 0);
      });
    });
  }
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  process.on("message", (message) => {
    if (message === "shutdown") stop();
  });
}
