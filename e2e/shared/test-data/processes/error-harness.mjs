import { createServer, completeServer } from "../../../../back/src/core/server.ts";
import { createLogger } from "../../../../back/src/core/logger.ts";

const logger = createLogger({ directory: process.env.LOG_DIR, level: "info" });
const application = createServer({ logger });
application.post("/api/failure/:kind", (request) => {
  const error = new Error(
    request.params.kind === "first"
      ? "Safe first failure\ncontinued detail"
      : "Safe second failure",
    {
      cause: new Error(
        request.params.kind === "first" ? "Safe storage cause" : "Safe connection cause",
      ),
    },
  );
  Object.assign(error, {
    password: process.env.SECRET_PASSWORD,
    token: process.env.SECRET_TOKEN,
    formValue: process.env.SECRET_FORM,
  });
  throw error;
});
completeServer(application, logger);
const server = application.listen(Number(process.env.PORT));
process.on("message", (message) => {
  if (message === "shutdown")
    server.close(async () => {
      await logger.flush();
      process.disconnect?.();
    });
});
