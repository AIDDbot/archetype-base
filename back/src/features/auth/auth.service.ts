import { randomUUID } from "node:crypto";
import { ExpectedError } from "../../shared/error.type.ts";
import type { AuthRepository, Credentials, Registration, PublicUser } from "./auth.type.ts";
import {
  hashPassword,
  verifyPassword,
  dummyPasswordHash,
  tokenHash,
  newToken,
} from "./auth.password.service.ts";

export function createAuthService(options: {
  repository: AuthRepository;
  sessionTtlHours: number;
}) {
  const repository = options.repository;
  return {
    async register(input: Registration): Promise<PublicUser> {
      if (repository.find(input.email))
        throw new ExpectedError({ status: 409, message: "Email already registered" });
      const passwordHash = await hashPassword(input.password);
      if (repository.find(input.email))
        throw new ExpectedError({ status: 409, message: "Email already registered" });
      const user: PublicUser = {
        id: randomUUID(),
        email: input.email.value,
        name: input.name,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      repository.insert({ user, passwordHash });
      return user;
    },
    async login(input: Credentials) {
      const stored = repository.find(input.email);
      const isValid = await verifyPassword({
        password: input.password,
        hash: stored?.passwordHash ?? dummyPasswordHash,
      });
      if (!stored || !isValid)
        throw new ExpectedError({ status: 401, message: "Invalid credentials" });
      const token = newToken();
      repository.createSession({
        tokenHash: tokenHash(token),
        userId: stored.user.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + options.sessionTtlHours * 3600000).toISOString(),
      });
      return { token, user: stored.user };
    },
    logout(token: string) {
      repository.removeSession(tokenHash(token));
    },
    resolve(token: string) {
      return repository.resolve(tokenHash(token));
    },
  };
}
