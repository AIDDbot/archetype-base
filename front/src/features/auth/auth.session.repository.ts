import type { SessionPersistence } from "./auth.persistence.type.ts";

export function createSessionPersistence(): SessionPersistence {
  return {
    readToken() {
      return localStorage.getItem("session-token");
    },
    writeToken(token) {
      localStorage.setItem("session-token", token);
    },
    clearToken() {
      localStorage.removeItem("session-token");
    },
  };
}
