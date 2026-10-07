import { ExpectedError } from "../../shared/error.type.ts";
import { currentUser } from "../auth/auth.api.ts";

export function readAccount(input: { id: string; user: unknown }) {
  const user = currentUser(input.user);
  if (input.id !== user.id) throw new ExpectedError({ status: 404, message: "Not found" });
  return { name: user.name, email: user.email, createdAt: user.createdAt };
}
