import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import express from "express";
import request from "supertest";
import { completeServer } from "../../core/server.ts";
import { migrateDatabase } from "../../core/database.ts";
import { mountRegistrations } from "../../core/session.ts";
import { createAuthRepository } from "./auth.repository.ts";
import { createAuthService } from "./auth.service.ts";
import { Email } from "../../shared/email.value.ts";
import { tokenHash } from "./auth.password.service.ts";

void test("credentials are salted and only token hash is stored; expired session is invalid", async () => {
  const database = new DatabaseSync(":memory:");
  migrateDatabase(database);
  const auth = createAuthService({
    repository: createAuthRepository(database),
    sessionTtlHours: 24,
  });
  const email = new Email("UNIT@example.test");
  await auth.register({ email, name: "Unit", password: "password" });
  const logged = await auth.login({ email, password: "password" });
  const row = database.prepare("SELECT * FROM sessions").get()!;
  assert.equal(row.tokenHash, tokenHash(logged.token));
  assert.equal(Object.values(row).includes(logged.token), false);
  assert.ok(auth.resolve(logged.token));
  database.exec("UPDATE sessions SET expiresAt = '2000-01-01T00:00:00.000Z'");
  assert.equal(auth.resolve(logged.token), undefined);
  assert.match(
    String(database.prepare("SELECT passwordHash FROM users").get()?.passwordHash),
    /^scrypt\$131072\$8\$1\$/,
  );
  await assert.rejects(
    auth.login({ email: new Email("unknown@example.test"), password: "wrong" }),
    /Invalid credentials/,
  );
  database.close();
});
void test("registration is protected unless marked public", async () => {
  const application = express();
  mountRegistrations(application, {
    resolve: () => undefined,
    registrations: [
      {
        basePath: "/api/test",
        register(router) {
          router.get("/", (_request, response) => {
            response.json({ ok: true });
          });
        },
      },
    ],
  });
  completeServer(application);
  const response = await request(application).get("/api/test");
  assert.equal(response.status, 401);
});
