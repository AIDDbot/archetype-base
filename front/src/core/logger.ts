import type { ActionLogger } from "../shared/logger.type.ts";

export function createActionLogger(): ActionLogger {
  return {
    action(name, path) {
      console.info(`${name.replace(/[\r\n]/g, " ")} ${path.split("?")[0]}`);
    },
  };
}
