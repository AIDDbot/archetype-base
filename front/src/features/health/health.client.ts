import type { HttpClient } from "../../shared/http.type.ts";
import type { Health } from "./health.type.ts";

export function createHealthClient(http: HttpClient) {
  return {
    async read(): Promise<Health | undefined> {
      try {
        return (await (await http.request("/api/health")).json()) as Health;
      } catch {
        return undefined;
      }
    },
  };
}
