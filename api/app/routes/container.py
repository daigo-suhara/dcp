from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok", "service": "container"}


@router.get("")
def list_container() -> dict[str, list[dict[str, object]]]:
    return {"container": []}
