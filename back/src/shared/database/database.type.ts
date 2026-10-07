import type { DatabaseSync } from "node:sqlite";

export type Database = Pick<DatabaseSync, "prepare" | "exec">;
