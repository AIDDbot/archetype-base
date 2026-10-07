import type { HttpClient } from "../../shared/http.type.ts";
import { ExpectedError } from "../../shared/error.type.ts";
import type { Account, AccountState, UserId } from "./users.type.ts";

export function createAccountClient(http: HttpClient) {
  return {
    async read(id: UserId): Promise<AccountState> {
      try {
        return {
          status: "loaded",
          account: (await (
            await http.request("/api/users/" + encodeURIComponent(id.value))
          ).json()) as Account,
        };
      } catch (error) {
        return {
          status:
            error instanceof ExpectedError && error.details.status === 404
              ? "not-found"
              : "unavailable",
        };
      }
    },
  };
}
