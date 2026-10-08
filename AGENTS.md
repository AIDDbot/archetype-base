# Archetype Base

Reference archetypes that follow the AIDDbot Blueprint. Each project folder is one archetype. AIDDbot copies a folder into a new system, and the system then grows from it.

- Write `AGENTS.md` files, specs and other records in ASD-STE100 Simplified Technical English: short sentences, one statement in each sentence, active voice, and one word for one concept. Technical names are permitted.
- When a request is ambiguous or incomplete, ask one closed question at a time.

## Environment

- **Git**: default branch `main`.
- **Runtime**: Node.js 24 or later, npm only. Each project has its own `package.json` and lock file.

## Archetypes

| Project | Type | Archetype | Source path | Responsibility | Instructions |
| --- | --- | --- | --- | --- | --- |
| back | back-api | Express, framework-free TypeScript, SQLite | `back/` | Own persistence and the foundation API. | `back/AGENTS.md` |
| front | front-web | Framework-free TypeScript with Vite, web components, Pico CSS | `front/` | Show the foundation through the native web platform. | `front/AGENTS.md` |
| e2e | e2e | Playwright | `e2e/` | Prove the foundation requirements through HTTP and screens. It is the conformance suite of the archetypes. | `e2e/AGENTS.md` |

The front gets data only from the back. The e2e suite uses the API and the browser screens. The identity of a system (`displayName`, `description`, `author`, `homepage`, `version`) is in the root `package.json`; the front and the suite read it from there.

All archetypes implement the AIDDbot foundation specs. `foundation/` holds the instance of each spec for this system: `S0001-configuration`, `S0002-monitoring`, `S0003-layout`, `S0004-health`, `S0005-basic-auth`, `S0006-account`, `S0007-about` and `S0008-record-views`, in the delivery order of AIDDbot. Each acceptance test has the tag of its requirement (`@S0001-R01`). A system that starts from these archetypes gets the same spec IDs, so the tags stay correct. The archetypes carry no business feature.

## Blueprint

<!-- Copied as written from AIDDbot `outline-system/assets/AGENTS.template.md`, v0.3.0 (Columbus). Never change it here: change it in AIDDbot and copy it again. -->

All projects obey these principles. A project `AGENTS.md` gives only its own data and the limits that its archetype changes. Do not explore the code to learn the setup. First make it work, then make it correct: only `lint`, `unit`, acceptance and a security finding block a delivery. Any other violation is debt.

### System

- `back-api` owns the data. Only it connects to persistence. `front-web` and `cli` get data only through `back-api`.
- REST API: paths start with `/api`; a resource is a plural noun. JSON bodies, ISO 8601 dates, `Authorization: Bearer <token>`. Status codes: 200, 201, 204, 400, 401, 403, 404, 409, 413, 500. Every error has the body `{ "error": "<message>" }`; an input error adds `fields`. An error never shows a stack, SQL or a path.
- Security: no secrets in the code or the repository; a password only as a salted hash; check each input at the edge.

### Containers

| Container | Is | Never |
| --- | --- | --- |
| `core` | The platform that the framework or the entry calls one time at startup: server or shell, router, connections, error handler, global styles. | Business rules. Imports of a feature. |
| `shared` | Generic elements with no domain, and the contracts of the services that features need (such as the logger, the HTTP client or the error type). Primitives at the root, other elements in folders by technical concern (`http`, `database`). | Domain words. Imports of `core` or of a feature. Folders `utils`, `helpers`, `common`, `misc`. |
| feature | One flat folder for one unit of business value. The role in each file name tells its layer. | Subfolders. Imports of `core`. Imports of a different feature, except its facade. |
| composition | The entry. It starts `core`, registers each feature by name in one explicit list (the manifest), and gives the features the services of `core` through the contracts of `shared`. The only part that knows `core` and the features. | Automatic discovery: folder scans, global decorators, file-based routers. |

### Layers

- composition → `presentation` → `logic` → `data`. A different feature → `facade` → `logic`.
- `presentation`: input, output and the registration of the feature (route, page, command). No business rules. Only the composition imports it.
- `facade`: the public functions and types for other features. Only other features import it. A feature that gives nothing has no facade.
- `logic`: rules and decisions. It does not know how data is stored.
- `data`: all that the project reads or writes outside itself (database, remote API, files).
- Types are not a layer. Each layer can use types, `shared` and the facades of other features.
- `lint` checks the imports. With no boundary linter, `review-implementation` checks them.
- A feature that the manifest loads on demand has no other import. Tests start the application through the composition, without a port.

### Tests

- Unit tests prove `logic`, at least one for each business rule, with a fake `data`. They also prove `shared` and `core`. They are fast and independent. A business rule without a unit test is debt.
- An acceptance test proves one requirement. Its name contains the identifier of that requirement.
- `e2e` has no layers, no manifest and no composition; the runner is the entry. `core` is the life cycle of the suite (setup, teardown, startup check of the projects). Features: one folder for each feature of the system, with `.api.spec` and `.web.spec` tests. `shared`: primitives, `page-objects/`, `test-data/`.
- An e2e test uses only the API and the screens. It never uses `core` or a different feature. Each test makes its own data with unique values. One browser engine (Chromium), unless the system asks for more.

### Code

| Limit | Code | Tests (all `e2e` files) |
| --- | --- | --- |
| Cyclomatic complexity of a function | 8 | 8 |
| Statements in a function | 16 | 64 |
| Nesting depth | 2 | 4 |
| Parameters of a function | 2 | 4 |
| Lines in a file | 128 | 256 |
| Entries in a folder | 16 | — |

- A callback whose signature the framework sets (such as a middleware) is outside the parameter limit: disable the limit for it with a lint comment. A folder over the limit has more than one concern: divide it by concern.
- Strictest typed form of the language and its strictest type check. One type for each domain concept, never a bare string or number. A value object for a value with rules, made at the edge; it checks only what the spec states. A closed type for a closed set: an enum or a union of literals, as the type check permits. Composition, not inheritance. Generic types in `shared`, domain types in their feature.
- DRY: `shared` has one function to check, convert or format each common type. Look there before you write one.
- Names: idiomatic, words of the domain. A function is a verb. A boolean is a question (`isActive`, `canEdit`). No negative names, no abbreviations except standard ones.
- Early returns; no `else` on the main path. A long or deep block: a function with a domain name. More than one logical operator: a named variable or predicate. More than two values: one typed object.
- Errors: never hide them. Catch only at the edges: the error handler of `core`, and `data` when it changes an external failure into the expected error.
- Configuration from the environment. Query statements as named constants in the `data` file that uses them. Migrations as numbered files. A dependency only with the package manager.
- No check, limit or default value that the spec does not state.

## Library gate

An archetype enters or changes in this repository only when all of these are true:

- `lint`, `unit` and `quality` pass in each project, and `quality` reports no warning.
- The full acceptance run of `e2e` passes against the reference `back` and `front`.
- Each requirement in `foundation/` has a test with its tag, and each tag names a requirement in `foundation/`.
- The schema documents in `model/` match the code: the model, the tables of `back`, and the endpoints of `back` and `front`. AIDDbot copies them into each system and never derives them again.
- The archetype has no open technical debt. Debt in an archetype goes into each system that starts from it.
- A boundary canary fails `lint`: a `logic` file that imports a `presentation` file of the same feature. Undo the canary.

A new archetype of a type (for example a different `front-web`) passes the same `e2e` suite with the reference archetypes of the other types. Change the suite only when the foundation specs change: first change the instance in `foundation/`, then the tests, then the code.

## Versions

- The major and the minor version, and the `codename` of the root `package.json`, are the same as the AIDDbot release whose Blueprint this repository obeys. Change them only when that AIDDbot release copies its Blueprint here.
- A fix that keeps the Blueprint is a patch version. Patch versions are independent of AIDDbot.
- Each version has a tag `v{version}`. Never move a published tag.

## Git

- MANDATORY: Preserve work; no secrets; no destructive commands.
- Conventional commits: `{feat|refactor|fix|chore|docs|test}({project}): {description}`.
- One archetype change in each commit, with the gate green.

## Project decisions

- Only back owns SQLite persistence. Each test instance has an isolated database.
