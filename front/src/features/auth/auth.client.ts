import type { HttpClient } from "../../shared/http.type.ts";
import type { AuthSession, PublicUser } from "./auth.type.ts";

export function createAuthClient(http: HttpClient) {
  return {
    async submit(operation: "register" | "login", values: Record<string, string>) {
      return (await (
        await http.request(`/api/auth/${operation}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
      ).json()) as PublicUser | AuthSession;
    },
    async me() {
      return (await (await http.request("/api/auth/me")).json()) as PublicUser;
    },
  };
}
