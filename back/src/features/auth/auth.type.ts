import type { Email } from "../../shared/email.value.ts";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: "user";
  createdAt: string;
}
export interface StoredUser {
  user: PublicUser;
  passwordHash: string;
}
export interface AuthRepository {
  find(email: Email): StoredUser | undefined;
  insert(user: StoredUser): void;
  createSession(session: {
    tokenHash: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
  }): void;
  removeSession(tokenHash: string): void;
  resolve(tokenHash: string): PublicUser | undefined;
}
export interface Credentials {
  email: Email;
  password: string;
}
export interface Registration extends Credentials {
  name: string;
}
