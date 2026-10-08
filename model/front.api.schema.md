# API schema — front

Source of truth inspected: `front/server.ts` and `front/src/core/server.settings.ts`.

The web server exposes one runtime configuration endpoint.
It has no application error response for this endpoint.
The browser uses the API error contract in `back.api.schema.md` for backend requests.

- [Runtime configuration](#runtime-configuration): Read the backend base URL.

## Runtime configuration

| Method | URL | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/runtime-config.json` | None | 200 [Runtime configuration result](#runtime-configuration-result) | None defined |

The middleware accepts any method on this path.
GET is the published foundation contract.
The response content type is `application/json`.

## Shared types

### Runtime configuration result

| Field | Type |
| --- | --- |
| `apiBaseUrl` | Text from `API_BASE_URL`. Default: `http://localhost:3000`. |

---

> last updated: 2026-10-08T14:04:00+02:00
