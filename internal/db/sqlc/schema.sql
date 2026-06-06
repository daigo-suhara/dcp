CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_projects_user_created_at
    ON projects (user_id, created_at, id);

CREATE TABLE IF NOT EXISTS containers (
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    url TEXT NOT NULL,
    ready BOOLEAN NOT NULL,
    reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    namespace TEXT NOT NULL,
    generation BIGINT NOT NULL,
    PRIMARY KEY (project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_containers_project_created_at
    ON containers (project_id, created_at, name);
