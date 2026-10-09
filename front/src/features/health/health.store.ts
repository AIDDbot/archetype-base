import type { HttpClient } from "../../shared/http.type.ts";
import { createHealthClient } from "./health.client.ts";
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
export function loadHealth(http: HttpClient) {
  return createHealthStore(createHealthClient(http)).load();
}
