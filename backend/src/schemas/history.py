from datetime import datetime

from pydantic import BaseModel, ConfigDict

from src.schemas.transcription import TranscriptionSegment


class HistoryCreate(BaseModel):
    name: str
    audio_file: str
    output: str
    segments: list[TranscriptionSegment] | None = None


class HistoryUpdate(BaseModel):
    name: str
    audio_file: str
    output: str
    segments: list[TranscriptionSegment] | None = None


class HistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    audio_file: str
    output: str
    segments: list[TranscriptionSegment] | None = None
    created_at: datetime
    updated_at: datetime
