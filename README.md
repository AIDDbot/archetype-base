# Archetype Base

Reference archetypes for systems that [AIDDbot](https://aiddbot.com) scaffolds. Each archetype follows the AIDDbot Blueprint and implements its foundation specs: configuration, monitoring, layout, health, basic authentication, account, about and record views. No archetype has a business feature.

| Folder | Project type | Technology |
| --- | --- | --- |
| [`back/`](./back/) | `back-api` | Express, framework-free TypeScript 7, SQLite |
| [`front/`](./front/) | `front-web` | Framework-free TypeScript 7 with Vite, web components, Pico CSS |
| [`e2e/`](./e2e/) | `e2e` | Playwright; it is also the conformance suite of the archetypes |

[`foundation/`](./foundation/) holds the instance of each foundation spec (`S0001`–`S0008`). Each acceptance test has the tag of its requirement.

Common tooling: npm, oxlint (lint, type check, layer boundaries and quality limits), oxfmt, and the Node.js test runner.

## Use an archetype

AIDDbot copies the archetypes for you when it founds a system. To copy one by hand:

```sh
npx degit AIDDbot/archetype-base/back back
```

Then put the identity of your system in the root `package.json` (`displayName`, `description`, `author`, `homepage`, `version`). The front and the e2e suite read it from there.

## Run the archetypes

Requirements: Node.js 24 or later.

```sh
cd back && npm ci && cd ..
cd front && npm ci && cd ..
cd e2e && npm ci && npx playwright install chromium && cd ..
```

In each project: `npm test` (unit tests in `back` and `front`, acceptance in `e2e`), `npm run lint`, `npm run quality` and `npm run format`. Start the back with `npm start` in `back/` (port 3000) and the front with `npm start` in `front/` (port 4000). Copy `.env.example` to `.env` to change a setting.

The acceptance suite starts the back and the front itself:

```sh
cd e2e && npm test
```

## Contribute

Read [`AGENTS.md`](./AGENTS.md). It holds the Blueprint and the gate that each archetype change must pass: green checks, a `quality` run with no warning, a green acceptance run, and no open technical debt.

## License

[MIT](./LICENSE)
