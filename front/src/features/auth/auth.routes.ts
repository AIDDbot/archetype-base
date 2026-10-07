import type { PageServices, SessionPlatform } from "../../shared/page.type.ts";
import { ExpectedError } from "../../shared/error.type.ts";
import { createAuthClient } from "./auth.client.ts";
import { restoreUser, readUser, clearSession, initializeSessionStore } from "./auth.store.ts";

import { createSessionPersistence } from "./auth.session.repository.ts";
export async function initializeAuth(services: PageServices): Promise<SessionPlatform> {
  const persistence = createSessionPersistence();
  initializeSessionStore({
    persistence,
    notify() {
      window.dispatchEvent(new Event("session-changed"));
    },
  });
  if (persistence.readToken()) {
    try {
      restoreUser(await createAuthClient(services.http).me());
    } catch {
      clearSession();
    }
  }
  async function logout() {
    services.logger.action("logout", location.pathname);
    try {
      await services.http.request("/api/auth/logout", { method: "POST" });
    } catch (error) {
      if (!(error instanceof ExpectedError) || error.details.status !== 401) throw error;
    }
    clearSession();
    services.navigation.navigate("/");
  }
  return {
    read: readUser,
    subscribe(update) {
      window.addEventListener("session-changed", update);
    },
    links() {
      const user = readUser();
      return user ? [{ path: `/users/${user.id}`, label: user.name, access: "session" }] : [];
    },
    controls() {
      return readUser() ? [{ label: "Logout", run: logout }] : [];
    },
  };
}
