import express from "express";
import { randomUUID } from "node:crypto";
import type { Logger } from "../shared/logger.type.ts";
import { createErrorHandler } from "./errors.ts";

const silent: Logger = { write() {}, flush: async () => {} };
export interface ServerSettings {
  origins?: readonly string[];
  bodyLimitKb?: number;
  logger?: Logger;
}
export function createServer(settings: ServerSettings = {}) {
  const application = express();
  const logger = settings.logger ?? silent;
  const origins = settings.origins ?? ["*"];
  // oxlint-disable-next-line eslint/max-params -- Express request middleware requires request, response and continuation.
  application.use((request, response, next) => {
    const started = performance.now();
    const supplied = request.get("X-Request-Id") ?? "";
    response.set("X-Request-Id", /^[a-zA-Z0-9-]{1,128}$/.test(supplied) ? supplied : randomUUID());
    response.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    });
    response.on("finish", () => {
      const level =
        response.statusCode >= 500 ? "error" : response.statusCode >= 400 ? "warn" : "info";
      logger.write(
        level,
        `${request.method} ${request.path} ${response.statusCode} ${(performance.now() - started).toFixed(1)}ms`,
      );
    });
    const origin = request.get("Origin");
    if (origins.includes("*")) response.set("Access-Control-Allow-Origin", "*");
    if (origin && origins.includes(origin)) response.set("Access-Control-Allow-Origin", origin);
    if (request.method === "OPTIONS") {
      response.set({
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      });
      response.sendStatus(204);
      return;
    }
    next();
  });
  application.use(express.json({ limit: `${settings.bodyLimitKb ?? 100}kb` }));
  return application;
}
export function completeServer(application: ReturnType<typeof express>, logger: Logger = silent) {
  application.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });
  application.use(createErrorHandler(logger));
}
