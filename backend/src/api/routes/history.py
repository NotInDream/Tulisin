from fastapi import APIRouter, status

from src.api.deps import AudioStorageDep, HistoryServiceDep, SessionDep
from src.schemas.history import HistoryCreate, HistoryRead, HistoryUpdate

router = APIRouter(tags=["history"], prefix="/history")


@router.get("/")
async def list_history(service: HistoryServiceDep) -> list[HistoryRead]:
    items = await service.list_all()
    return [HistoryRead.model_validate(item) for item in items]


@router.get("/{history_id}")
async def get_history_item(history_id: int, service: HistoryServiceDep) -> HistoryRead:
    item = await service.get(history_id)
    return HistoryRead.model_validate(item)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_history_item(
    payload: HistoryCreate,
    service: HistoryServiceDep,
    session: SessionDep,
) -> HistoryRead:
    item = await service.create(payload)
    await session.commit()
    return HistoryRead.model_validate(item)


@router.put("/{history_id}")
async def update_history_item(
    history_id: int,
    payload: HistoryUpdate,
    service: HistoryServiceDep,
    session: SessionDep,
) -> HistoryRead:
    item = await service.update(history_id, payload)
    await session.commit()
    return HistoryRead.model_validate(item)


@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history_item(
    history_id: int,
    service: HistoryServiceDep,
    storage: AudioStorageDep,
    session: SessionDep,
) -> None:
    audio_file = await service.delete(history_id)
    await session.commit()
    if audio_file:
        await storage.delete(audio_file)
    return
