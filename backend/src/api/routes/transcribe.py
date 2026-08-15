from fastapi import APIRouter, UploadFile

from src.api.deps import TranscriptionServiceDep
from src.schemas.transcription import TranscriptionRead

router = APIRouter(tags=["transcribe"], prefix="/transcribe")


@router.post("/")
async def transcribe_audio(
    file: UploadFile,
    service: TranscriptionServiceDep,
) -> TranscriptionRead:
    data = await file.read()
    return await service.transcribe(file.filename or "audio", data)
