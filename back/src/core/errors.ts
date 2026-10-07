import type { ErrorRequestHandler } from "express";
import { ExpectedError } from "../shared/error.type.ts";
import type { Logger } from "../shared/logger.type.ts";

import { describeFailure } from "./errors.diagnostic.ts";
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  // oxlint-disable-next-line eslint/max-params -- Express identifies error middleware by its four declared parameters.
  return (error: unknown, _request, response, _next) => {
    if (error instanceof ExpectedError) {
      response.status(error.details.status).json({
        error: error.message,
        ...(error.details.fields ? { fields: error.details.fields } : {}),
      });
      return;
    }
    const failure = error as { type?: string };
    if (failure.type === "entity.parse.failed") {
      response.status(400).json({ error: "Invalid JSON" });
      return;
    }
    if (failure.type === "entity.too.large") {
      response.status(413).json({ error: "Request body too large" });
      return;
    }
    const cause = describeFailure(error);
    logger.write("error", "Unexpected request failure: " + cause);
    response.status(500).json({ error: "Internal server error" });
  };
}
