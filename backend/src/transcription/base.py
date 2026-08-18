from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class TranscriptSegment:
    start: float
    end: float
    text: str


class Transcriber(ABC):
    @abstractmethod
    async def transcribe(
        self, audio_path: Path, language: str | None = None
    ) -> list[TranscriptSegment]: ...
