import assert from "node:assert/strict";
import test from "node:test";
import type { Server } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { registerShutdown } from "./shutdown.ts";

void test("timeout and late close use one finalizer and keep failure", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const listeners = process.listeners("message");
  const previousCode = process.exitCode;
  let closes = 0;
  let forced = 0;
  let closeCallback: ((error?: Error) => void) | undefined;
  const server = {
    close(callback: typeof closeCallback) {
      closeCallback = callback;
    },
    closeAllConnections() {
      forced++;
    },
  } as unknown as Server;
  registerShutdown(server, {
    database: {
      close() {
        closes++;
      },
    } as DatabaseSync,
    logger: { write() {}, flush: async () => {} },
  });
  const stop = process.listeners("message").find((listener) => !listeners.includes(listener))!;
  stop.call(process, "shutdown", undefined);
  context.mock.timers.tick(5000);
  assert.equal(forced, 1);
  assert.equal(closes, 1);
  assert.equal(process.exitCode, 1);
  closeCallback?.();
  await Promise.resolve();
  assert.equal(closes, 1);
  assert.equal(process.exitCode, 1);
  process.removeListener("message", stop);
  process.exitCode = previousCode;
});
