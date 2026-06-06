# Component Map

`dcloud` is organized as a set of independent components with clear
boundaries.

## Control Plane

- `console`: React/Vite UI for operators and users
- `api`: FastAPI boundary for browser and external clients

## Service Plane

- `project`: project lifecycle and tenant-level metadata
- `container`: container lifecycle and deployment records

## Data Plane

- `database`: PostgreSQL backing store shared by `api`, `project`, and
  `container`

## Notes

- There is no `core` component anymore.
- `services/` is gone; top-level directories are the deployable units.
- Shared API shapes live in `protos/` and shared Go bindings live in
  `internal/pb/`.
