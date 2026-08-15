from abc import ABC, abstractmethod
from pathlib import Path


class Transcriber(ABC):
    @abstractmethod
    async def transcribe(self, audio_path: Path) -> str: ...
