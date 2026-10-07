export interface Health {
  status: "ok";
  runs: number;
  uptime: number;
}
export type HealthState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "loaded"; health: Health };
