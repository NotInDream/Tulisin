from enum import StrEnum

from pydantic import BaseModel


class Language(StrEnum):
    auto = "auto"
    id = "id"
    en = "en"
    zh = "zh"
    ja = "ja"
    ko = "ko"
    es = "es"
    fr = "fr"
    de = "de"
    ru = "ru"

    @property
    def code(self) -> str | None:
        return None if self is Language.auto else self.value


class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscriptionRead(BaseModel):
    name: str
    audio_file: str
    output: str
    segments: list[TranscriptionSegment]
