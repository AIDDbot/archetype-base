export interface ActionLogger {
  action(name: string, path: string): void;
}
