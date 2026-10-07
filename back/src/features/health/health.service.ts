import type { Health, RunRepository } from "./health.type.ts";

export function createHealthService(repository: RunRepository) {
  repository.recordRun();
  const started = performance.now();
  return {
    read(): Health {
      return {
        status: "ok",
        runs: repository.countRuns(),
        uptime: (performance.now() - started) / 1000,
      };
    },
  };
}
