-- name: ListProjects :many
SELECT id, user_id, name, created_at
FROM projects
WHERE user_id = $1
ORDER BY created_at, id;

-- name: CreateProject :one
INSERT INTO projects (id, user_id, name, created_at)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, name) DO NOTHING
RETURNING id, user_id, name, created_at;

-- name: DeleteProject :execrows
DELETE FROM projects
WHERE user_id = $1 AND id = $2;

-- name: ProjectExists :one
SELECT EXISTS (
    SELECT 1
    FROM projects
    WHERE user_id = $1 AND id = $2
);

-- name: ListContainers :many
SELECT project_id, name, image, url, ready, reason, created_at, updated_at, namespace, generation
FROM containers
WHERE project_id = $1
ORDER BY created_at, name;

-- name: UpsertContainer :one
INSERT INTO containers (
    project_id, name, image, url, ready, reason,
    created_at, updated_at, namespace, generation
)
VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7, $8, 1)
ON CONFLICT (project_id, name) DO UPDATE SET
    image = EXCLUDED.image,
    url = EXCLUDED.url,
    ready = EXCLUDED.ready,
    reason = EXCLUDED.reason,
    updated_at = EXCLUDED.updated_at,
    namespace = EXCLUDED.namespace,
    generation = containers.generation + 1
RETURNING project_id, name, image, url, ready, reason, created_at, updated_at, namespace, generation;

-- name: DeleteContainer :execrows
DELETE FROM containers
WHERE project_id = $1 AND name = $2;

-- name: CreateOperation :one
INSERT INTO operations (id, status, created_at, updated_at)
VALUES ($1, 'pending', $2, $2)
RETURNING id, status, error, created_at, updated_at;

-- name: UpdateOperation :exec
UPDATE operations
SET status = $2, error = $3, updated_at = $4
WHERE id = $1;

-- name: GetOperation :one
SELECT id, status, error, created_at, updated_at
FROM operations
WHERE id = $1;
