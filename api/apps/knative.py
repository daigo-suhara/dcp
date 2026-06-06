from __future__ import annotations

import json
import os
import ssl
import hashlib
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def env(key: str, fallback: str) -> str:
    value = os.getenv(key)
    return value if value else fallback


def now() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")


def is_dns_label(value: str) -> bool:
    if len(value) == 0 or len(value) > 63:
        return False
    if value[0] == "-" or value[-1] == "-":
        return False
    for ch in value:
        if ("a" <= ch <= "z") or ("0" <= ch <= "9") or ch == "-":
            continue
        return False
    return True


def public_service_url(name: str, public_domain: str) -> str:
    return f"https://{name}.{public_domain}"


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


def service_resource_name(project_id: str, name: str) -> str:
    seed = f"{project_id.strip()}:{name.strip()}"
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:8]
    prefix = sanitize_dns_label(name)
    if not prefix:
        prefix = "service"
    max_prefix_len = 63 - 1 - len(digest)
    if len(prefix) > max_prefix_len:
        prefix = prefix[:max_prefix_len].rstrip("-")
    if not prefix:
        prefix = "service"
    return f"{prefix}-{digest}"


@dataclass
class KnativeService:
    name: str
    resource_name: str
    image: str
    url: str
    ready: bool
    reason: str
    created_at: str
    updated_at: str
    namespace: str
    generation: int


@dataclass
class KnativeManager:
    namespace: str
    public_domain: str
    base_url: str
    token: str
    ssl_context: ssl.SSLContext

    @classmethod
    def new(cls, namespace: str, public_domain: str) -> "KnativeManager":
        base_url = f"https://{env('KUBERNETES_SERVICE_HOST', 'kubernetes.default.svc')}"
        token_path = env("DCLD_KUBERNETES_TOKEN_FILE", "/var/run/secrets/kubernetes.io/serviceaccount/token")
        ca_path = env("DCLD_KUBERNETES_CA_FILE", "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt")

        with open(token_path, "r", encoding="utf-8") as handle:
            token = handle.read().strip()

        context = ssl.create_default_context()
        if os.path.exists(ca_path):
            context = ssl.create_default_context(cafile=ca_path)

        return cls(
            namespace=namespace,
            public_domain=public_domain,
            base_url=base_url,
            token=token,
            ssl_context=context,
        )

    def public_url(self, name: str) -> str:
        return public_service_url(name, self.public_domain)

    def list_services(self, project_id: str) -> list[KnativeService]:
        selector = urlencode({"labelSelector": f"dcloud.dev/project={project_id}"})
        payload = self._request_json(
            "GET",
            f"/apis/serving.knative.dev/v1/namespaces/{self.namespace}/services?{selector}",
        )

        items = payload.get("items", [])
        services: list[KnativeService] = []
        for item in items:
            metadata = item.get("metadata", {})
            spec = item.get("spec", {})
            status = item.get("status", {})
            containers = (((spec.get("template") or {}).get("spec") or {}).get("containers")) or []
            reason = ""
            ready = False
            updated_at = metadata.get("creationTimestamp", "")
            for condition in status.get("conditions", []):
                if condition.get("type") == "Ready":
                    ready = condition.get("status") == "True"
                    reason = condition.get("reason") or ""
                    updated_at = condition.get("lastTransitionTime") or updated_at
                    break
            services.append(
                KnativeService(
                    name=metadata.get("name", ""),
                    resource_name=metadata.get("name", ""),
                    image=containers[0].get("image", "") if containers else "",
                    url=self.public_url(metadata.get("name", "")),
                    ready=ready,
                    reason=reason,
                    created_at=metadata.get("creationTimestamp", ""),
                    updated_at=updated_at,
                    namespace=metadata.get("namespace", self.namespace),
                    generation=int(metadata.get("generation") or 0),
                )
            )
        return services

    def deploy_service(self, project_id: str, name: str, image: str, port: int) -> KnativeService:
        if not is_dns_label(name):
            raise ValueError("name must be a DNS label")
        if port < 1 or port > 65535:
            raise ValueError("port must be between 1 and 65535")

        timestamp = now()
        resource_name = service_resource_name(project_id, name)
        manifest = {
            "apiVersion": "serving.knative.dev/v1",
            "kind": "Service",
            "metadata": {
                "name": resource_name,
                "namespace": self.namespace,
                "labels": {
                    "app.kubernetes.io/instance": "dcloud",
                    "app.kubernetes.io/component": "container",
                    "dcloud.dev/project": project_id,
                    "dcloud.dev/service-name": name,
                    "app.kubernetes.io/managed-by": "dcloud-api",
                },
            },
            "spec": {
                "template": {
                    "metadata": {
                        "labels": {
                            "app.kubernetes.io/instance": "dcloud",
                            "app.kubernetes.io/component": "container",
                            "dcloud.dev/project": project_id,
                            "dcloud.dev/service-name": name,
                        }
                    },
                    "spec": {
                        "containers": [
                            {
                                "name": name,
                                "image": image,
                                "ports": [{"containerPort": port}],
                            }
                        ]
                    },
                }
            },
        }
        service_payload = self._request_json(
            "PATCH",
            f"/apis/serving.knative.dev/v1/namespaces/{self.namespace}/services/{resource_name}?fieldManager=dcloud-api&force=true",
            body=manifest,
            content_type="application/apply-patch+yaml",
        )

        domain_mapping = {
            "apiVersion": "serving.knative.dev/v1beta1",
            "kind": "DomainMapping",
            "metadata": {
                "name": f"{resource_name}.{self.public_domain}",
                "namespace": self.namespace,
                "labels": {
                    "app.kubernetes.io/instance": "dcloud",
                    "app.kubernetes.io/component": "container",
                    "dcloud.dev/project": project_id,
                    "dcloud.dev/service-name": name,
                    "app.kubernetes.io/managed-by": "dcloud-api",
                },
            },
            "spec": {
                "ref": {
                    "apiVersion": "serving.knative.dev/v1",
                    "kind": "Service",
                    "name": resource_name,
                }
            },
        }
        self._request_json(
            "PATCH",
            f"/apis/serving.knative.dev/v1beta1/namespaces/{self.namespace}/domainmappings/{resource_name}.{self.public_domain}?fieldManager=dcloud-api&force=true",
            body=domain_mapping,
            content_type="application/apply-patch+yaml",
        )

        metadata = service_payload.get("metadata", {})
        spec = service_payload.get("spec", {})
        status = service_payload.get("status", {})
        containers = (((spec.get("template") or {}).get("spec") or {}).get("containers")) or []
        ready = False
        reason = ""
        updated_at = timestamp
        for condition in status.get("conditions", []):
            if condition.get("type") == "Ready":
                ready = condition.get("status") == "True"
                reason = condition.get("reason") or ""
                updated_at = condition.get("lastTransitionTime") or timestamp
                break

        return KnativeService(
            name=name,
            resource_name=metadata.get("name", resource_name),
            image=containers[0].get("image", image) if containers else image,
            url=self.public_url(resource_name),
            ready=ready,
            reason=reason,
            created_at=metadata.get("creationTimestamp", timestamp),
            updated_at=updated_at,
            namespace=metadata.get("namespace", self.namespace),
            generation=int(metadata.get("generation") or 1),
        )

    def delete_service(self, project_id: str, name: str) -> None:
        resource_name = service_resource_name(project_id, name)
        self._request_json(
            "DELETE",
            f"/apis/serving.knative.dev/v1beta1/namespaces/{self.namespace}/domainmappings/{resource_name}.{self.public_domain}",
            allow_not_found=True,
        )
        self._request_json(
            "DELETE",
            f"/apis/serving.knative.dev/v1/namespaces/{self.namespace}/services/{resource_name}",
            allow_not_found=True,
        )

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        body: dict[str, Any] | None = None,
        content_type: str = "application/json",
        allow_not_found: bool = False,
    ) -> dict[str, Any]:
        request = Request(self.base_url + path, method=method)
        request.add_header("Authorization", f"Bearer {self.token}")
        request.add_header("Accept", "application/json")
        if body is not None:
            request.add_header("Content-Type", content_type)
            request.data = json.dumps(body).encode("utf-8")

        try:
            with urlopen(request, context=self.ssl_context, timeout=20) as response:
                raw = response.read()
        except HTTPError as exc:
            if allow_not_found and exc.code == 404:
                return {}
            raw = exc.read()
            message = self._decode_error(raw)
            raise RuntimeError(message or f"kubernetes api returned {exc.code}") from exc
        except URLError as exc:
            raise RuntimeError(f"failed to reach kubernetes api: {exc.reason}") from exc

        if not raw:
            return {}
        return json.loads(raw.decode("utf-8"))

    @staticmethod
    def _decode_error(raw: bytes) -> str:
        if not raw:
            return ""
        try:
            payload = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return ""
        message = payload.get("message") or payload.get("reason")
        return str(message) if message else ""
