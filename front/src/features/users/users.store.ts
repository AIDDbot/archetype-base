import type { HttpClient } from "../../shared/http.type.ts";
import { createAccountClient } from "./users.client.ts";
import type { AccountState, UserId } from "./users.type.ts";

export function createAccountStore(client: { read(id: UserId): Promise<AccountState> }) {
  let state: AccountState = { status: "loading" };
  return {
    get state() {
      return state;
    },
    async load(id: UserId) {
      state = await client.read(id);
      return state;
    },
  };
}
export function loadAccount(http: HttpClient, id: UserId) {
  return createAccountStore(createAccountClient(http)).load(id);
}
