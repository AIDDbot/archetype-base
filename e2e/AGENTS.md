# e2e — e2e

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: Acceptance evidence through HTTP and screens.
- **Never**: Direct production internals in a test.

## 2 · Technology

- **Language**: TypeScript 7, strict.
- **Runtime / framework**: Node.js 26, Playwright and Chromium.
- **Main dependencies**: @playwright/test — API and browser acceptance.
- **Package manager**: npm only.

## 3 · Tooling

| Slot         | Blocks | Command                            | Tool                                                            |
| ------------ | ------ | ---------------------------------- | --------------------------------------------------------------- |
| `lint`       | Yes    | `npm run lint`                     | oxlint, typeAware, typeCheck, oxlint-tsgolint, layer boundaries |
| `format`     | No     | `npm run format`                   | oxfmt                                                           |
| `upgrade`    | No     | `npm run upgrade`                  | npm-check-updates and npm install                               |
| `unit`       | Yes    | `npm run unit`                     | node --test lifecycle checks                                    |
| `start`      | No     | n/a: the suite starts its projects | n/a                                                             |
| `acceptance` | Yes    | `npm test`                         | Playwright                                                      |
| `quality`    | No     | `npm run quality`                  | oxlint with Blueprint complexity limits                         |

`npm start` opens the interactive Playwright UI. It is for a human only: an agent never runs it, because it does not stop.

## 4 · Architecture

**Services of `core`**: n/a: fixtures supply the base URLs; shared has service contracts.

| Item              | e2e                                     |
| ----------------- | --------------------------------------- |
| `composition`     | n/a: the test runner is the entry       |
| `core`            | life cycle of the suite                 |
| `features`        | one test folder for each system feature |
| `presentation`    | n/a: no layers                          |
| `logic`           | n/a: no layers                          |
| `data`            | n/a: no layers                          |
| `shared concerns` | page-objects, test-data, projects       |

## 5 · Folder structure

| Concept                              | Path                                                                 | Framework mechanism                |
| ------------------------------------ | -------------------------------------------------------------------- | ---------------------------------- |
| entry                                | `playwright.config.ts`                                               | Playwright configuration           |
| core                                 | `core/`                                                              | global setup and teardown          |
| features                             | `features/{feature}/`                                                | *.api.spec.ts and *.web.spec.ts    |
| facade / presentation / logic / data | `n/a`                                                                | e2e has no layers                  |
| shared                               | `shared/, shared/page-objects/, shared/test-data/, shared/projects/` | fixtures and reusable test support |
| unit tests                           | `core/*.test.ts`                                                     | node --test lifecycle checks       |

```text
playwright.config.ts
core/
features/
shared/
```

### Shared primitives

The index of `shared`. Read it before you write a check or a conversion. Add each primitive that two or more features use. A helper of one feature has no row: its page object is `shared/page-objects/{feature}.page.ts`, and its test data is in `shared/test-data/`. The life cycle of the suite in `shared/projects/` has a row only for what the features use.

| Primitive                             | Contract                                                                                                               | Path                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `authClient(request, baseUrl)`        | Register, login and resolve the current user through HTTP.                                                             | `shared/auth.client.ts`            |
| `uniqueCredentials()`                 | Unique email and password for an isolated account.                                                                     | `shared/auth.client.ts`            |
| `authPage(page)`                      | Auth fields, submit, result and fill operation.                                                                        | `shared/page-objects/auth.page.ts` |
| `expectError(body, message?)`         | Check the uniform error body and optional fields.                                                                      | `shared/error.check.ts`            |
| `uniqueValue(prefix)`                 | A value no other test run uses.                                                                                        | `shared/test-data/unique.value.ts` |
| `runProject(settings, use)`           | Start a project on a free port, wait, use it, always stop it. Use it for each test that needs its own running project. | `shared/projects/project.run.ts`   |
| `withTemporaryDirectory(prefix, use)` | Make a temporary directory, use it, always remove it.                                                                  | `shared/projects/project.run.ts`   |
| `freePort()`                          | An unused local port.                                                                                                  | `shared/projects/port.find.ts`     |
| `startProject(settings)`              | Isolated process, output, URL and stop operation. Use it only for a project that must fail at startup.                 | `shared/projects/process.start.ts` |
| `waitForProject(instance, timeout)`   | Wait for HTTP readiness or report process exit or timeout.                                                             | `shared/projects/process.start.ts` |
| `parseInteger(input)`                 | Integer in the input range or an error that names the field.                                                           | `shared/numbers.parse.ts`          |
| `test` fixtures                       | Supply backend and frontend base URLs and source folders.                                                              | `shared/fixtures.ts`               |

## 6 · Coding rules

### Technology rules

- Use TypeScript 7. Run type checks inside oxlint. Do not add a separate tsc check.
- Use oxlint boundary overrides from the foundation assets. Use their e2e variant for e2e. Prove them with a forbidden import.
- Use oxfmt. Upgrade all dependencies and the lockfile through npm-check-updates.
- Use strict compiler settings. Use erasable TypeScript that Node.js can run directly.
- Use Chromium only. Keep the runner parallel. Use no retries to hide shared state.
- Each test creates unique data. Each helper process has a temporary database unless the test supplies one.
- Every acceptance test contains its global requirement tag. Tests use only HTTP and browser screens.
- The suite stops only the processes it started, including after a failure or timeout.

### Project rules

| Rule                                                                                          | Scope                  | Origin                                                     |
| --------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| A parent process close event does not prove descendant exit. Track tree ownership separately. | Custom command helpers | S0008 review: descendants can use separate output streams. |

## 7 · Connections

- **Needs**: back and front.
- **Gives to**: delivery verification.
- **Port**: n/a: suite is not a server.
- **Environment variables**: `BACK_DIRECTORY` = ../back; `BACK_PORT` = 3000; `BACK_START` = npm start; `FRONT_DIRECTORY` = ../front; `FRONT_PORT` = 4000; `FRONT_START` = npm start; `E2E_STARTUP_TIMEOUT_MS` = 15000. Without a project port setting, start it without PORT.
