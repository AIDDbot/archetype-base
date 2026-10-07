import type { Database } from "../../shared/database/database.type.ts";
import type { RunRepository } from "./health.type.ts";

const INSERT_RUN = "INSERT INTO runs(started_at) VALUES (?)";
const COUNT_RUNS = "SELECT COUNT(*) AS count FROM runs";
export function createRunRepository(database: Database): RunRepository {
  return {
    recordRun() {
      database.prepare(INSERT_RUN).run(new Date().toISOString());
    },
    countRuns() {
      return Number(database.prepare(COUNT_RUNS).get()?.count);
    },
  };
}
