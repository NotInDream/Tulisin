from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HistoryCreate(BaseModel):
    name: str
    audio_file: str
    output: str


class HistoryUpdate(BaseModel):
    name: str
    audio_file: str
    output: str


class HistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    audio_file: str
    output: str
    created_at: datetime
    updated_at: datetime
