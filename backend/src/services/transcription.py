from src.core.exceptions import TranscriptionError
from src.schemas.transcription import TranscriptionRead, TranscriptionSegment
from src.storage.base import AudioStorage
from src.transcription.base import Transcriber


class TranscriptionService:
    def __init__(self, storage: AudioStorage, transcriber: Transcriber) -> None:
        self._storage = storage
        self._transcriber = transcriber

    async def transcribe(
        self, original_name: str, data: bytes, language: str | None = None
    ) -> TranscriptionRead:
        if not data:
            raise TranscriptionError("Berkas audio kosong.")

        stored_name = await self._storage.save(data, original_name)
        audio_path = self._storage.resolve(stored_name)
        segments = await self._transcriber.transcribe(audio_path, language)

        return TranscriptionRead(
            name=original_name,
            audio_file=stored_name,
            output=" ".join(segment.text for segment in segments).strip(),
            segments=[
                TranscriptionSegment(
                    start=segment.start,
                    end=segment.end,
                    text=segment.text,
                )
                for segment in segments
            ],
        )
