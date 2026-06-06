from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timezone
from threading import Lock
from typing import Any
from uuid import uuid4

import psycopg
from psycopg.rows import dict_row

from apps.knative import KnativeManager


SCHEMA = """
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
"""


def now() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")


def env(key: str, fallback: str) -> str:
    value = os.getenv(key)
    return value if value else fallback


def database_url() -> str:
    return env(
        "DCLD_DATABASE_URL",
        "postgresql://postgres:postgres@127.0.0.1:5432/dcloud?sslmode=disable",
    )


def public_service_domain() -> str:
    return env("DCLD_PUBLIC_SERVICE_DOMAIN", "drkatana.com")


def sanitize_dns_label(value: str) -> str:
    value = value.strip().lower()
    chars: list[str] = []
    last_hyphen = False
    for ch in value:
        if ("a" <= ch <= "z") or ("0" <= ch <= "9"):
            chars.append(ch)
            last_hyphen = False
        elif chars and not last_hyphen:
            chars.append("-")
            last_hyphen = True
    return "".join(chars).strip("-")


def short_id() -> str:
    return uuid4().hex[:8]


@dataclass
class Repository:
    lock: Lock
    dsn: str
    knative: KnativeManager | None

    @classmethod
    def new(cls) -> "Repository":
        public_domain = public_service_domain()
        try:
            knative = KnativeManager.new(env("DCLD_TARGET_NAMESPACE", "dcloud-system"), public_domain)
        except Exception:
            knative = None
        repo = cls(lock=Lock(), dsn=database_url(), knative=knative)
        repo.initialize()
        return repo

    def _connect(self) -> psycopg.Connection[Any]:
        return psycopg.connect(self.dsn, row_factory=dict_row)

    def initialize(self) -> None:
        with self.lock, self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(SCHEMA)

    def _project_exists(self, conn: psycopg.Connection[Any], user_id: str, project_id: str) -> bool:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM projects WHERE user_id = %s AND id = %s LIMIT 1",
                (user_id, project_id),
            )
            return cur.fetchone() is not None

    def project_exists(self, user_id: str, project_id: str) -> bool:
        normalized_user = user_id.strip()
        normalized_project = project_id.strip()
        if not normalized_user or not normalized_project:
            return False
        with self._connect() as conn:
            return self._project_exists(conn, normalized_user, normalized_project)

    def list_projects(self, user_id: str) -> list[dict[str, Any]]:
        normalized_user = user_id.strip()
        if not normalized_user:
            raise ValueError("userId is required")
        with self._connect() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, name, user_id AS owner, created_at AS "createdAt"
                FROM projects
                WHERE user_id = %s
                ORDER BY created_at, id
                """,
                (normalized_user,),
            )
            return [dict(row) for row in cur.fetchall()]

    def create_project(self, user_id: str, name: str) -> dict[str, Any]:
        normalized_user = user_id.strip()
        normalized_name = name.strip()
        if not normalized_user or not normalized_name:
            raise ValueError("userId and name are required")

        project = {
            "id": f"{sanitize_dns_label(normalized_name)}-{short_id()}",
            "name": normalized_name,
            "owner": normalized_user,
            "createdAt": now(),
        }

        with self.lock, self._connect() as conn, conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO projects (id, user_id, name, created_at)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id, name) DO NOTHING
                RETURNING id, name, user_id AS owner, created_at AS "createdAt"
                """,
                (project["id"], normalized_user, normalized_name, project["createdAt"]),
            )
            row = cur.fetchone()
            if row is None:
                raise KeyError("project already exists")
            return dict(row)

    def upsert_container_state(self, user_id: str, project_id: str, service: dict[str, Any]) -> dict[str, Any]:
        normalized_user = user_id.strip()
        normalized_project = project_id.strip()
        normalized_name = str(service.get("name", "")).strip()
        normalized_image = str(service.get("image", "")).strip()
        normalized_url = str(service.get("url", "")).strip()
        normalized_namespace = str(service.get("namespace", env("DCLD_TARGET_NAMESPACE", "dcloud-system"))).strip()
        normalized_reason = str(service.get("reason", "")).strip() or None
        if not normalized_user or not normalized_project or not normalized_name or not normalized_image or not normalized_url:
            raise ValueError("userId, projectId, name, image, and url are required")

        created_at = str(service.get("createdAt", now()))
        updated_at = str(service.get("updatedAt", created_at))
        ready = bool(service.get("ready", False))
        generation = int(service.get("generation") or 1)

        with self.lock, self._connect() as conn, conn.cursor() as cur:
            if not self._project_exists(conn, normalized_user, normalized_project):
                raise KeyError("project not found")
            cur.execute(
                """
                INSERT INTO containers (
                    project_id, name, image, url, ready, reason,
                    created_at, updated_at, namespace, generation
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (project_id, name) DO UPDATE SET
                    image = EXCLUDED.image,
                    url = EXCLUDED.url,
                    ready = EXCLUDED.ready,
                    reason = EXCLUDED.reason,
                    created_at = EXCLUDED.created_at,
                    updated_at = EXCLUDED.updated_at,
                    namespace = EXCLUDED.namespace,
                    generation = EXCLUDED.generation
                RETURNING
                    name,
                    image,
                    url,
                    ready,
                    reason,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt",
                    namespace,
                    project_id AS "projectId",
                    generation
                """,
                (
                    normalized_project,
                    normalized_name,
                    normalized_image,
                    normalized_url,
                    ready,
                    normalized_reason,
                    created_at,
                    updated_at,
                    normalized_namespace,
                    generation,
                ),
            )
            row = cur.fetchone()
            if row is None:
                raise RuntimeError("failed to persist container")
            return dict(row)

    def delete_project(self, user_id: str, project_id: str) -> bool:
        normalized_user = user_id.strip()
        normalized_project = project_id.strip()
        if not normalized_user or not normalized_project:
            raise ValueError("userId and projectId are required")

        with self.lock, self._connect() as conn, conn.cursor() as cur:
            cur.execute(
                "DELETE FROM projects WHERE user_id = %s AND id = %s",
                (normalized_user, normalized_project),
            )
            return cur.rowcount > 0

    def list_containers(self, user_id: str, project_id: str) -> dict[str, Any]:
        normalized_user = user_id.strip()
        normalized_project = project_id.strip()
        if not normalized_user or not normalized_project:
            raise ValueError("userId and projectId are required")

        with self._connect() as conn:
            if not self._project_exists(conn, normalized_user, normalized_project):
                raise KeyError("project not found")

        if self.knative is None:
            with self._connect() as conn, conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        name,
                        image,
                        url,
                        ready,
                        reason,
                        created_at AS "createdAt",
                        updated_at AS "updatedAt",
                        namespace,
                        project_id AS "projectId",
                        generation
                    FROM containers
                    WHERE project_id = %s
                    ORDER BY created_at, name
                    """,
                    (normalized_project,),
                )
                return {
                    "userId": normalized_user,
                    "projectId": normalized_project,
                    "namespace": env("DCLD_TARGET_NAMESPACE", "dcloud-system"),
                    "containers": [dict(row) for row in cur.fetchall()],
                }

        services = self.knative.list_services(normalized_project)
        records = []
        for service in services:
            record = {
                "name": service.name,
                "image": service.image,
                "url": service.url,
                "ready": service.ready,
                "reason": service.reason,
                "createdAt": service.created_at,
                "updatedAt": service.updated_at,
                "namespace": service.namespace,
                "projectId": normalized_project,
                "generation": service.generation,
            }
            records.append(record)
            self.upsert_container_state(normalized_user, normalized_project, record)

        return {
            "userId": normalized_user,
            "projectId": normalized_project,
            "namespace": env("DCLD_TARGET_NAMESPACE", "dcloud-system"),
            "containers": records,
        }

    def deploy_container(
        self,
        user_id: str,
        project_id: str,
        name: str,
        image: str,
        port: int,
        min_scale: int,
        max_scale: int,
    ) -> dict[str, Any]:
        normalized_user = user_id.strip()
        normalized_project = project_id.strip()
        normalized_name = name.strip()
        normalized_image = image.strip()
        if not normalized_user or not normalized_project or not normalized_name or not normalized_image:
            raise ValueError("userId, projectId, name, and image are required")
        if port < 1 or port > 65535:
            raise ValueError("port must be between 1 and 65535")
        _ = min_scale, max_scale

        if self.knative is None:
            timestamp = now()
            url = f"https://{normalized_name}.{public_service_domain()}"
            with self.lock, self._connect() as conn, conn.cursor() as cur:
                if not self._project_exists(conn, normalized_user, normalized_project):
                    raise KeyError("project not found")
                cur.execute(
                    """
                    INSERT INTO containers (
                        project_id, name, image, url, ready, reason,
                        created_at, updated_at, namespace, generation
                    )
                    VALUES (%s, %s, %s, %s, TRUE, NULL, %s, %s, %s, 1)
                    ON CONFLICT (project_id, name) DO UPDATE SET
                        image = EXCLUDED.image,
                        url = EXCLUDED.url,
                        ready = EXCLUDED.ready,
                        reason = EXCLUDED.reason,
                        created_at = EXCLUDED.created_at,
                        updated_at = EXCLUDED.updated_at,
                        namespace = EXCLUDED.namespace,
                        generation = EXCLUDED.generation
                    RETURNING
                        name,
                        image,
                        url,
                        ready,
                        reason,
                        created_at AS "createdAt",
                        updated_at AS "updatedAt",
                        namespace,
                        project_id AS "projectId",
                        generation
                    """,
                    (
                        normalized_project,
                        normalized_name,
                        normalized_image,
                        url,
                        timestamp,
                        timestamp,
                        env("DCLD_TARGET_NAMESPACE", "dcloud-system"),
                        1,
                    ),
                )
                row = cur.fetchone()
                if row is None:
                    raise RuntimeError("failed to persist container")
                return dict(row)

        with self.lock, self._connect() as conn, conn.cursor() as cur:
            if not self._project_exists(conn, normalized_user, normalized_project):
                raise KeyError("project not found")
        service = self.knative.deploy_service(normalized_project, normalized_name, normalized_image, port)
        timestamp = service.created_at or now()

        with self.lock, self._connect() as conn, conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO containers (
                    project_id, name, image, url, ready, reason,
                    created_at, updated_at, namespace, generation
                )
                VALUES (%s, %s, %s, %s, TRUE, NULL, %s, %s, %s, 1)
                ON CONFLICT (project_id, name) DO UPDATE SET
                    image = EXCLUDED.image,
                    url = EXCLUDED.url,
                    ready = EXCLUDED.ready,
                    reason = EXCLUDED.reason,
                    created_at = EXCLUDED.created_at,
                    updated_at = EXCLUDED.updated_at,
                    namespace = EXCLUDED.namespace,
                    generation = EXCLUDED.generation
                RETURNING
                    name,
                    image,
                    url,
                    ready,
                    reason,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt",
                    namespace,
                    project_id AS "projectId",
                    generation
                """,
                (
                    normalized_project,
                    normalized_name,
                    service.image or normalized_image,
                    service.url,
                    timestamp,
                    service.updated_at or timestamp,
                    env("DCLD_TARGET_NAMESPACE", "dcloud-system"),
                    service.generation or 1,
                ),
            )
            row = cur.fetchone()
            if row is None:
                raise RuntimeError("failed to persist container")
            return dict(row)

    def delete_container(self, user_id: str, project_id: str, name: str) -> bool:
        normalized_user = user_id.strip()
        normalized_project = project_id.strip()
        normalized_name = name.strip()
        if not normalized_project or not normalized_name:
            raise ValueError("projectId and name are required")
        if not normalized_user:
            return False

        if self.knative is None:
            with self.lock, self._connect() as conn, conn.cursor() as cur:
                if not self._project_exists(conn, normalized_user, normalized_project):
                    return False
                cur.execute(
                    "DELETE FROM containers WHERE project_id = %s AND name = %s",
                    (normalized_project, normalized_name),
                )
                return cur.rowcount > 0

        with self.lock, self._connect() as conn, conn.cursor() as cur:
            if not self._project_exists(conn, normalized_user, normalized_project):
                return False
        self.knative.delete_service(normalized_project, normalized_name)
        with self.lock, self._connect() as conn, conn.cursor() as cur:
            cur.execute(
                "DELETE FROM containers WHERE project_id = %s AND name = %s",
                (normalized_project, normalized_name),
            )
            return cur.rowcount > 0
