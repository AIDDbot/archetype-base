import type { PublicUser } from "./auth.type.ts";

export function currentUser(value: unknown): PublicUser {
  return value as PublicUser;
}
export type { PublicUser } from "./auth.type.ts";
