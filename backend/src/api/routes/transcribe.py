from typing import Annotated

from fastapi import APIRouter, Form, UploadFile

from src.api.deps import TranscriptionServiceDep
from src.schemas.transcription import Language, TranscriptionRead

router = APIRouter(tags=["transcribe"], prefix="/transcribe")


@router.post("/")
async def transcribe_audio(
    file: UploadFile,
    service: TranscriptionServiceDep,
    language: Annotated[Language, Form()] = Language.auto,
) -> TranscriptionRead:
    data = await file.read()
    return await service.transcribe(file.filename or "audio", data, language.code)
