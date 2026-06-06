# API Contract

`console` が利用する HTTP API と、`api` の実装対応をまとめた一覧です。

## Auth

| console call | HTTP route | Status |
| --- | --- | --- |
| current user | `GET /api/v1/auth/me` | implemented |
| login | `GET /api/v1/auth/login` | implemented |
| register | `GET /api/v1/auth/register` | implemented |
| logout | `GET /api/v1/auth/logout` | implemented |
| logout (POST) | `POST /api/v1/auth/logout` | implemented |

## Projects

| console call | HTTP route | Status |
| --- | --- | --- |
| list projects | `GET /api/v1/projects` | implemented |
| create project | `POST /api/v1/projects` | implemented |
| delete project | `DELETE /api/v1/projects/{project_id}` | implemented |

## Containers

| console call | HTTP route | Status |
| --- | --- | --- |
| list containers | `GET /api/v1/container` | implemented |
| deploy container | `POST /api/v1/container` | implemented |
| delete container | `DELETE /api/v1/container/{name}` | implemented |

## Console-only UI actions

| UI action | API status | Notes |
| --- | --- | --- |
| project selection | not needed | stored locally in the browser |
| repo connect button | implemented | opens a project-scoped repository settings form |
| auth redirects | implemented | `/api/v1/auth/login`, `/register`, `/logout` redirect back to `/` |

## Gaps

These are visible in the UI but not backed by a real API yet.

| Area | Missing API | Impact |
| --- | --- | --- |
| identity provider | none | auth is stubbed; `/api/v1/auth/me` returns a fixed user |

## Notes

- `console` sends `X-DCP-Project` when a project is selected.
- `api` forwards container operations to the `container` gRPC service.
- `api` persists projects in PostgreSQL through the shared `Repository`.
- `api` also persists repository connection settings per project in PostgreSQL.
