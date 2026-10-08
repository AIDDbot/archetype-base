# Relational database schema — back

Source of truth inspected: `back/migrations/0001-schema-versions.sql`, `0002-runs.sql`, `0003-auth.sql`, and `back/src/core/database.ts`.
SQLite PRAGMA inspection confirms the columns, indexes, and foreign keys.

Every physical table is listed below.
There is no many-to-many join table.
No column has a declared default.
The TEXT primary keys have no explicit NOT NULL constraint.

## `schema_versions`

Records each applied migration and its application time.

| Column | Physical type | Null | Default | Key | References | Constraints and indexes |
| --- | --- | --- | --- | --- | --- | --- |
| `version` | TEXT | yes | — | PK | — | Unique index `sqlite_autoindex_schema_versions_1` |
| `appliedAt` | TEXT | no | — | — | — | NOT NULL |

## `runs`

Records each API startup.

| Column | Physical type | Null | Default | Key | References | Constraints and indexes |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | INTEGER | no | — | PK | — | SQLite rowid alias. SQLite generates it when omitted. |
| `started_at` | TEXT | no | — | — | — | NOT NULL |

## `users`

Stores each registered account and its password hash.

| Column | Physical type | Null | Default | Key | References | Constraints and indexes |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | TEXT | yes | — | PK | — | Unique index `sqlite_autoindex_users_1` |
| `email` | TEXT | no | — | unique | — | NOT NULL. Unique index `sqlite_autoindex_users_2`. |
| `name` | TEXT | no | — | — | — | NOT NULL |
| `role` | TEXT | no | — | — | — | NOT NULL. No database CHECK constraint. |
| `passwordHash` | TEXT | no | — | — | — | NOT NULL |
| `createdAt` | TEXT | no | — | — | — | NOT NULL |

The application normalizes email to lower case.
The application writes the role `user`.
These are application rules, not database constraints.

## `sessions`

Stores a hash of each session token and its expiry time.

| Column | Physical type | Null | Default | Key | References | Constraints and indexes |
| --- | --- | --- | --- | --- | --- | --- |
| `tokenHash` | TEXT | yes | — | PK | — | Unique index `sqlite_autoindex_sessions_1` |
| `userId` | TEXT | no | — | FK | `users.id` | NOT NULL. ON UPDATE NO ACTION. ON DELETE NO ACTION. |
| `createdAt` | TEXT | no | — | — | — | NOT NULL |
| `expiresAt` | TEXT | no | — | — | — | NOT NULL |

---

> last updated: 2026-10-08T14:04:00+02:00
