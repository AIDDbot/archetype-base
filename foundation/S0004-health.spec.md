# S0004-health — Health status

## Problem

Before the first business feature, each layer of each project must operate with the others, and the projects must connect to each other.

### User Stories

- As an operator, I want **to ask the system if it is alive, how many times it started, and for how long it has run** so that I know its state quickly.

### Business rules

- The health answer must contain only the status, the startup count and the uptime.

### Out of context

- Checks of dependencies other than the database of the project. Readiness probes.
- The shell, the menu and the not-found page (`layout`). Authentication (`basic-auth`).

## Requirements

- **R01**: WHEN a client requests `GET /api/health`, the `back` SHALL answer 200 with `{ "status": "ok", "runs": <integer ≥ 1>, "uptime": <seconds > 0> }`.
- **R02**: WHEN the `back` restarts, the `runs` value SHALL be greater than before the restart.
- **R03**: WHILE the `back` runs, each `uptime` value SHALL be greater than the value before it.
- **R04**: WHEN a user opens `/health`, the `front` SHALL show the status, the runs and the uptime from the `back`, with the uptime as a duration that a person reads (such as `1 h 2 min`).
- **R05**: IF the `back` does not answer, THEN the `/health` page SHALL show `Health unavailable` and keep the menu.
- **R06**: WHILE the `front` shows a page, the menu SHALL contain a link to `/health`.
- **R07**: WHEN a user opens `/`, the home page SHALL show a health card with the status, the runs, the uptime as a duration that a person reads, and a link to `/health`.
- **R08**: IF the `back` does not answer, THEN the health card SHALL show `Health unavailable` and keep its link, the other cards and the menu.
- **R09**: WHEN a user follows the link of the health card, the `front` SHALL show `/health` without a full reload of the document.
- **R10**: WHEN a user opens `/` on a screen 375 CSS pixels wide, the home page SHALL have no horizontal scroll.

## Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | back | `GET /api/health` | 200 `{ "status": "ok", "runs": int, "uptime": seconds }`. 500 with the uniform error body if the database fails. | R01, R02, R03 |
| page | front | `/health` | Status, runs and uptime, or `Health unavailable` | R04, R05, R06 |
| page | front | `/` | Health card: status, runs, uptime and a link to `/health`, or `Health unavailable` | R07–R10 |

## Solution

### back

- `data` records one run at startup and counts the runs; its table comes in the first migration of the feature (see `configuration`).
- No facade: no other feature uses `health`. The feature gets the database from the composition (see `configuration`).
- The `unit` smoke test checks the `logic` with a fake `data` layer.

### front

- `logic` keeps the state of the page: loading, loaded or unavailable. `data` calls `GET /api/health` through the HTTP client.
- The page and the card show the uptime with the shared primitive `formatDuration`.
- The registration adds the page `/health`, its menu link `Health` and the card of the home page (see `layout`). The card uses the same `logic` and `data` as the page.

### e2e

- A preflight, not a test: before the first test, it checks `GET /api/health` of the `back` and `/` of the `front`. A project that does not answer stops the run, with its name.
- The page object of `/health` uses the shell page object; the card tests use the home page object (see `layout`).

## Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| model | Run | new | One startup of the `back`: `startedAt` (date-time). |
| back.db | `runs.id`, `runs.started_at` | new | One row for each startup. |

## Test notes

- **R02**: read `runs`, restart the `back`, read it again.
- **R05, R08**: block `/api/health` in the browser.
- **R09**: put a mark on the document before the link; the mark is still there.
- **R10**: the width of the document is not more than the width of the viewport.
- **R04, R07**: check the shape of the duration (such as a number and a unit), never an exact value.
