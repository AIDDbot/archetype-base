export interface Account {
  name: string;
  email: string;
  createdAt: string;
}
export type AccountState =
  | { status: "loading" }
  | { status: "loaded"; account: Account }
  | { status: "not-found" | "unavailable" };
export interface UserId {
  value: string;
}
