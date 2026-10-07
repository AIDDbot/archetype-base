import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Logger, LogLevel } from "../shared/logger.type.ts";

const levels: readonly LogLevel[] = ["debug", "info", "warn", "error"];
function timestamp(date: Date) {
  const pad = (number: number, length = 2) => String(number).padStart(length, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
  return { day, time };
}
export function createLogger(settings: { directory: string; level: LogLevel }): Logger {
  let queue = Promise.resolve();
  let hasReportedFailure = false;
  return {
    write(level, message) {
      if (levels.indexOf(level) < levels.indexOf(settings.level)) return;
      const { day, time } = timestamp(new Date());
      const line = `${time} back ${level.toUpperCase()} ${message.replace(/[\r\n]+/g, " | ")}\n`;
      if (level === "warn" || level === "error") process.stderr.write(line);
      queue = queue
        .then(async () => {
          await mkdir(settings.directory, { recursive: true });
          await appendFile(join(settings.directory, `${day}.log`), line);
        })
        .catch(() => {
          if (!hasReportedFailure) process.stderr.write("Log file write failed\n");
          hasReportedFailure = true;
        });
    },
    flush: () => queue,
  };
}
