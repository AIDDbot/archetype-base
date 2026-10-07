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
