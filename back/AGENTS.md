# back — back-api

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: The foundation API and SQLite persistence.
- **Never**: Browser rendering.

## 2 · Technology

- **Language**: TypeScript 7, strict.
- **Runtime / framework**: Node.js 26 and Express 5.
- **Main dependencies**: Express — HTTP routes; node:sqlite — persistence.
- **Package manager**: npm only.

## 3 · Tooling

| Slot | Blocks | Command | Tool |
| --- | --- | --- | --- |
| `lint` | Yes | `npm run lint` | oxlint, typeAware, typeCheck, oxlint-tsgolint, layer boundaries |
| `format` | No | `npm run format` | oxfmt |
| `upgrade` | No | `npm run upgrade` | npm-check-updates and npm install |
| `unit` | Yes | `npm test` | node --test |
| `start` | No | `npm start` | Node.js |
| `acceptance` | Yes | n/a: e2e owns acceptance | n/a |
| `quality` | No | `npm run quality` | oxlint with Blueprint complexity limits |

## 4 · Architecture

**Services of `core`**: registration arguments; contracts in `src/shared/http/` and `src/shared/`.

| Item | back-api |
| --- | --- |
| `composition` | process entry and explicit manifest |
| `core` | server, settings, logger, database, error handler |
| `features` | endpoints |
| `presentation` | route registration and controller |
| `logic` | services and policies |
| `data` | repositories |
| `shared concerns` | http, database |

## 5 · Folder structure

| Concept | Path | Framework mechanism |
| --- | --- | --- |
| composition | `src/app.main.ts, src/app.compose.ts, src/features/features.manifest.ts` | explicit registration list |
| core | `src/core/` | plain TypeScript |
| features | `src/features/{feature}/` | flat feature folders |
| facade | `src/features/{feature}/{feature}.api.ts` | public functions and types |
| presentation / logic / data / types | `*.routes.ts and *.controller.ts / *.service.ts / *.repository.ts / *.type.ts and *.value.ts` | file roles |
| shared | `src/shared/, src/shared/http/ and src/shared/database/` | primitives and service contracts |
| unit tests | `src/**/*.test.ts` | node --test |

```text
src/
  app.main.ts
  app.compose.ts
  core/
  features/
    features.manifest.ts
  shared/
```

### Shared primitives

The index of `shared`. Read it before you write a check or a conversion. Add each primitive that two or more features use. A helper of one feature has no row.

| Primitive | Contract | Path |
| --- | --- | --- |
| `Email(value)` | Check non-empty text. Normalize lower case. | `src/shared/email.value.ts` |
| `requireText(input)` | Trim non-empty text or raise field errors. | `src/shared/text.check.ts` |
| `readFields(input, rules)`, `text`, `integerIn(min, max)`, `oneOf(options)` | Read a request body by a rule for each field: the typed values, or one 400 error with the message of each invalid field. Use it for each input; never write a parser of your own. | `src/shared/input.read.ts` |
| `RouteRegistration`, `SessionResolver` | Explicit route visibility and opaque session resolution contracts. | `src/shared/http/application.type.ts` |
| `ApplicationServices`, `FeatureRegistration` | Inject the database into explicit feature registration. | `src/shared/http/application.type.ts` |
| `ExpectedError(details)` | Status, message and optional field errors. | `src/shared/error.type.ts` |
| `Logger` | Write a level and message. Flush pending lines. | `src/shared/logger.type.ts` |
| `LogLevel` | Closed set: debug, info, warn, error. | `src/shared/logger.type.ts` |
| `parseInteger(input)` | Integer in the input range or an error that names the field. | `src/shared/numbers.parse.ts` |
| `isRecord(value)` | True for a key-value object. | `src/shared/types.check.ts` |
| `readSetting(input)` | Parse the supplied value or fallback. Propagate a parse error. | `src/shared/settings.read.ts` |
| `Database` | Prepare and execute SQL through an injected database contract. | `src/shared/database/database.type.ts` |

## 6 · Coding rules

### Technology rules

- Use TypeScript 7. Run type checks inside oxlint. Do not add a separate tsc check.
- Use oxlint boundary overrides from the foundation assets. Use their e2e variant for e2e. Prove them with a forbidden import.
- Use oxfmt. Upgrade all dependencies and the lockfile through npm-check-updates.
- Use strict compiler settings. Use erasable TypeScript that Node.js can run directly.
- Use Express routers and middleware. The composition injects platform contracts.
- Use node:sqlite. Only core opens a connection. Features get its shared contract.
- Number migrations in migrations/. Apply them in transactions before listening.
- Anchor runtime ignore patterns: /node_modules/, /data/, /logs/. Never ignore source data layers.

### Project rules

| Rule | Scope | Origin |
| --- | --- | --- |

## 7 · Connections

- **Needs**: local SQLite storage.
- **Gives to**: front and e2e through /api.
- **Port**: `PORT` = 3000.
- **Environment variables**: `HOST` = all interfaces; `DATABASE_URL` = ./data/app.sqlite; `CORS_ORIGIN` = *; `LOG_DIR` = ./logs; `LOG_LEVEL` = info; `BODY_LIMIT_KB` = 100; `SESSION_TTL_HOURS` = 24 (integer 1–720).

- Shared Email: src/shared/email.value.ts. Checks non-empty text and normalizes lower case.
- Passwords use scrypt N=131072, r=8, p=1. Store cost and salt with each hash. OWASP minimum: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt
