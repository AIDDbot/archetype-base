import type { Health, HealthState } from "./health.type.ts";

export function createHealthStore(client: { read(): Promise<Health | undefined> }) {
  let state: HealthState = { status: "loading" };
  return {
    get state() {
      return state;
    },
    async load() {
      const health = await client.read();
      state = health ? { status: "loaded", health } : { status: "unavailable" };
      return state;
    },
  };
}
