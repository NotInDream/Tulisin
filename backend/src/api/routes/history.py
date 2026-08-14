from fastapi import APIRouter
from src.schemas.history import HistoryRead, HistoryList

router = APIRouter(tags=["history"], prefix="/history")


@router.get("/")
async def get_history() -> HistoryList:
    return HistoryList(items=[])


@router.get("/{history_id}")
async def get_history_item(history_id: int) -> HistoryRead:
    return HistoryRead(
        id=history_id,
        name="Sample History Item",
        audio_file="sample_audio.mp3",
        output="Sample output text",
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z",
    )
