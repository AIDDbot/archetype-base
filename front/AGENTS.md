# front — front-web

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: The browser pages and their state.
- **Never**: Direct database or file access.

## 2 · Technology

- **Language**: TypeScript 7, strict.
- **Runtime / framework**: Native web platform and Vite.
- **Main dependencies**: Vite — server and bundler; Pico CSS — semantic styles; Fontsource Roboto, Audiowide and Anonymous Pro — local fonts.
- **Package manager**: npm only.

## 3 · Tooling

| Slot         | Blocks | Command                  | Tool                                                            |
| ------------ | ------ | ------------------------ | --------------------------------------------------------------- |
| `lint`       | Yes    | `npm run lint`           | oxlint, typeAware, typeCheck, oxlint-tsgolint, layer boundaries |
| `format`     | No     | `npm run format`         | oxfmt                                                           |
| `upgrade`    | No     | `npm run upgrade`        | npm-check-updates and npm install                               |
| `unit`       | Yes    | `npm run unit`           | node --test                                                     |
| `start`      | No     | `npm run start`          | Vite JavaScript API                                             |
| `acceptance` | Yes    | n/a: e2e owns acceptance | n/a                                                             |
| `quality`    | No     | `npm run quality`        | oxlint with Blueprint complexity limits                         |

## 4 · Architecture

**Services of `core`**: registration arguments; contracts in `src/shared/http/` and `src/shared/`.

| Item              | front-web                                     |
| ----------------- | --------------------------------------------- |
| `composition`     | browser entry and explicit lazy page manifest |
| `core`            | shell, router, theme, settings, HTTP client   |
| `features`        | pages and cards                               |
| `presentation`    | page and component registration               |
| `logic`           | stores and use cases                          |
| `data`            | API clients                                   |
| `shared concerns` | components, http                              |

## 5 · Folder structure

| Concept                             | Path                                                                                 | Framework mechanism              |
| ----------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| composition                         | `src/app.main.ts, src/app.compose.ts, src/features/features.manifest.ts`             | explicit registration list       |
| core                                | `src/core/`                                                                          | plain TypeScript                 |
| features                            | `src/features/{feature}/`                                                            | flat feature folders             |
| facade                              | `src/features/{feature}/{feature}.api.ts`                                            | public functions and types       |
| presentation / logic / data / types | `*.page.ts and *.component.ts / *.store.ts / *.client.ts / *.type.ts and *.value.ts` | file roles                       |
| shared                              | `src/shared/, src/shared/components/ and src/shared/http/`                           | primitives and service contracts |
| unit tests                          | `src/**/*.test.ts`                                                                   | node --test                      |

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

The index of `shared`. Read it before you write a check or a conversion. Add each primitive when a spec needs it.

| Primitive                                                                                                                     | Contract                                                                                                                                  | Path                                        |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `parseInteger(input)`                                                                                                         | Integer in the input range, or an error that names the field.                                                                             | `src/shared/numbers.parse.ts`               |
| `readSetting(input)`                                                                                                          | The supplied value parsed, or the fallback. A parse error stops the startup.                                                              | `src/shared/settings.read.ts`               |
| `escapeHtml(value)`                                                                                                           | Text that is safe in a page.                                                                                                              | `src/shared/html.escape.ts`                 |
| `formatDate(value)`                                                                                                           | Date and time in the language of the browser.                                                                                             | `src/shared/date.format.ts`                 |
| `formatDuration(seconds)`                                                                                                     | Readable duration with `Intl.DurationFormat`.                                                                                             | `src/shared/duration.format.ts`             |
| `formatFact(kind, value)`, `isEndAligned(kind)`, `listMessage(count, empty)`                                                  | A fact that a person reads, `—` with no value; end alignment for numbers, dates and durations; the empty message of a list.               | `src/shared/record.format.ts`               |
| `ExpectedError(details)`                                                                                                      | Status, message and optional field errors.                                                                                                | `src/shared/error.type.ts`                  |
| `HttpClient`                                                                                                                  | The contract of the HTTP client of `core`.                                                                                                | `src/shared/http.type.ts`                   |
| `ActionLogger.action(name, path)`                                                                                             | The contract of the console logger of `core`: one named action.                                                                           | `src/shared/logger.type.ts`                 |
| `identity`                                                                                                                    | Application name, description, author and website; version from the root package.                                                         | `src/shared/identity.ts`                    |
| `Access`, `PageServices`, `PageContext`, `PageRegistration`, `MenuLink`, `MenuControl`, `CardRegistration`, `SessionPlatform` | Page, menu, card and session contracts between the composition, `core` and the features.                                                  | `src/shared/page.type.ts`                   |
| `PlatformElement`                                                                                                             | Base of each custom element: renders a `<template>` in the light DOM.                                                                     | `src/shared/components/platform.element.ts` |
| `createRecordCard()`, `createRecordDetail()`, `createRecordTable()`                                                           | Record views from a typed description (`record.type.ts`): card and detail with a footer of links (empty list: no footer), detail with sections, striped table with caption. Loading is `aria-busy`; a failure keeps the title and the links. | `src/shared/components/record.*.ts`         |

## 6 · Coding rules

### Technology rules

- Use TypeScript 7. Run type checks inside oxlint. Do not add a separate tsc check.
- Use oxlint boundary overrides from the foundation assets. Use their e2e variant for e2e. Prove them with a forbidden import.
- Use oxfmt. Upgrade all dependencies and the lockfile through npm-check-updates.
- Use strict compiler settings. Use erasable TypeScript that Node.js can run directly.
- Use native custom elements and `<template>` in the light DOM. Do not use Shadow DOM.
- Use Navigation API and URLPattern. Import each page dynamically through the manifest. Do not add a framework or polyfill.
- Use native form validation, fetch with AbortController, ES modules, CSS custom properties and nesting.
- Install Pico CSS and the three Fontsource packages with npm. Import them in the entry.
- Copy theme.css, colors.css and custom.css unchanged from the foundation assets to src/core/styles/. Import them after Pico.
- Store the theme in the root data-theme attribute and localStorage. Read prefers-color-scheme for the initial theme.

### Project rules

| Rule | Scope | Origin |
| ---- | ----- | ------ |

## 7 · Connections

- **Needs**: back through the core HTTP client.
- **Gives to**: operator and e2e through browser screens.
- **Port**: `PORT` = 4000.
- **Environment variables**: `API_BASE_URL` = http://localhost:3000, served by /runtime-config.json.
