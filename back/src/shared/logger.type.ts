export type LogLevel = "debug" | "info" | "warn" | "error";
export interface Logger {
  write(level: LogLevel, message: string): void;
  flush(): Promise<void>;
}
