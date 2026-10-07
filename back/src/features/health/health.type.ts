export interface Health {
  status: "ok";
  runs: number;
  uptime: number;
}
export interface RunRepository {
  recordRun(): void;
  countRuns(): number;
}
