from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import Settings, get_settings
from src.db.session import get_session
from src.repositories.base import HistoryRepository
from src.repositories.history import SqlAlchemyHistoryRepository
from src.services.history import HistoryService
from src.services.transcription import TranscriptionService
from src.storage.base import AudioStorage
from src.storage.local import LocalAudioStorage
from src.transcription.base import Transcriber
from src.transcription.whisper import FasterWhisperTranscriber

SettingsDep = Annotated[Settings, Depends(get_settings)]
SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_history_repository(session: SessionDep) -> HistoryRepository:
    return SqlAlchemyHistoryRepository(session)


HistoryRepositoryDep = Annotated[HistoryRepository, Depends(get_history_repository)]


def get_history_service(repository: HistoryRepositoryDep) -> HistoryService:
    return HistoryService(repository)


HistoryServiceDep = Annotated[HistoryService, Depends(get_history_service)]


@lru_cache
def get_audio_storage() -> AudioStorage:
    settings = get_settings()
    return LocalAudioStorage(settings.audio_dir)


@lru_cache
def get_transcriber() -> Transcriber:
    settings = get_settings()
    return FasterWhisperTranscriber(
        model_name=settings.whisper_model,
        device=settings.device,
        compute_type=settings.whisper_compute_type,
        language=settings.whisper_language,
    )


AudioStorageDep = Annotated[AudioStorage, Depends(get_audio_storage)]
TranscriberDep = Annotated[Transcriber, Depends(get_transcriber)]


def get_transcription_service(
    storage: AudioStorageDep,
    transcriber: TranscriberDep,
) -> TranscriptionService:
    return TranscriptionService(storage, transcriber)


TranscriptionServiceDep = Annotated[
    TranscriptionService, Depends(get_transcription_service)
]
