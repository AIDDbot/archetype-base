import type { Database } from "../../shared/database/database.type.ts";
import type { AuthRepository, PublicUser } from "./auth.type.ts";

const FIND = "SELECT * FROM users WHERE email = ?";
const INSERT = "INSERT INTO users(id,email,name,role,passwordHash,createdAt) VALUES (?,?,?,?,?,?)";
const SESSION = "INSERT INTO sessions(tokenHash,userId,createdAt,expiresAt) VALUES (?,?,?,?)";
const DELETE_SESSION = "DELETE FROM sessions WHERE tokenHash = ?";
const RESOLVE =
  "SELECT users.* FROM sessions JOIN users ON users.id = sessions.userId WHERE sessions.tokenHash = ? AND sessions.expiresAt > ?";
function publicUser(row: Record<string, unknown>): PublicUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: "user",
    createdAt: String(row.createdAt),
  };
}
export function createAuthRepository(database: Database): AuthRepository {
  return {
    find(email) {
      const row = database.prepare(FIND).get(email.value);
      return row ? { user: publicUser(row), passwordHash: String(row.passwordHash) } : undefined;
    },
    insert(stored) {
      const user = stored.user;
      database
        .prepare(INSERT)
        .run(user.id, user.email, user.name, user.role, stored.passwordHash, user.createdAt);
    },
    createSession(session) {
      database
        .prepare(SESSION)
        .run(session.tokenHash, session.userId, session.createdAt, session.expiresAt);
    },
    removeSession(hash) {
      database.prepare(DELETE_SESSION).run(hash);
    },
    resolve(hash) {
      const row = database.prepare(RESOLVE).get(hash, new Date().toISOString());
      return row ? publicUser(row) : undefined;
    },
  };
}
