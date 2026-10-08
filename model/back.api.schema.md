# API schema — back

Source of truth inspected: `back/src/features/features.manifest.ts`, feature routes, auth controller and services, users service, and the core server, session guard, and error handler.

Every error response has the body `{ "error": "<message>" }`.
An input error also has `fields`, a map from field names to messages.
Every endpoint can return 400 for invalid JSON, 413 for a body above the configured limit, and 500 for an unexpected failure.
An unknown path returns 404 with `Not found`.
An unknown path under a protected registration first requires a valid session.
Every OPTIONS request returns 204 through the CORS middleware.

- [Health](#health): Read the API health.
- [Register](#register): Create an account.
- [Login](#login): Create a session.
- [Current user](#current-user): Read the current user.
- [Logout](#logout): Remove the current session.
- [Account](#account): Read the own account.

## Health

| Method | URL | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | None. Public. | 200 [Health](#health-type) | 500 database failure |

## Register

| Method | URL | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | [Registration](#registration). Public. | 201 [Public user](#public-user) | 400 invalid fields · 409 email already registered |

## Login

| Method | URL | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/login` | [Credentials](#credentials). Public. | 200 [Login result](#login-result) | 400 invalid fields · 401 `Invalid credentials` |

## Current user

| Method | URL | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/auth/me` | `Authorization: Bearer <token>` | 200 [Public user](#public-user) | 401 `Unauthorized` for an absent, invalid, or expired session |

## Logout

| Method | URL | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/logout` | `Authorization: Bearer <token>` | 204 with no body | 401 `Unauthorized` for an absent, invalid, or expired session |

## Account

| Method | URL | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/users/:id` | User identifier and `Authorization: Bearer <token>` | 200 [Account result](#account-result) | 401 `Unauthorized` without a valid session · 404 `Not found` when the identifier differs from the current user |

## Shared types

### Health type

| Field | Type |
| --- | --- |
| `status` | Literal `ok` |
| `runs` | Integer of at least 1 |
| `uptime` | Positive number of seconds |

### Registration

| Field | Type |
| --- | --- |
| `email` | Non-empty text. Stored in lower case. |
| `name` | Non-empty text. End spaces are removed. |
| `password` | Non-empty text. The original value is hashed. |

### Credentials

| Field | Type |
| --- | --- |
| `email` | Non-empty text. Compared in lower case. |
| `password` | Non-empty text |

### Public user

| Field | Type |
| --- | --- |
| `id` | UUID text |
| `email` | Lower-case text |
| `name` | Text |
| `role` | Literal `user` |
| `createdAt` | ISO 8601 date-time text |

### Login result

| Field | Type |
| --- | --- |
| `token` | Non-empty opaque text |
| `user` | Public user |

### Account result

| Field | Type |
| --- | --- |
| `name` | Text |
| `email` | Lower-case text |
| `createdAt` | ISO 8601 date-time text |

---

> last updated: 2026-10-08T14:04:00+02:00
