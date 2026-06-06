from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok", "service": "project"}


@router.get("/platform")
def platform() -> dict[str, object]:
    return {
        "name": "dcloud",
        "description": "FastAPI api backed by shared PostgreSQL state.",
        "components": ["console", "api", "project", "container", "database"],
    }
