import logging
from pathlib import Path

import anyio
from faster_whisper import WhisperModel

from src.core.exceptions import TranscriptionError
from src.transcription.base import Transcriber
from src.transcription.cuda import register_cuda_dll_directories

logger = logging.getLogger(__name__)


class FasterWhisperTranscriber(Transcriber):
    def __init__(
        self,
        model_name: str,
        device: str,
        compute_type: str,
    ) -> None:
        self._model_name = model_name
        self._device = device
        self._compute_type = compute_type
        self._model: WhisperModel | None = None
        self._lock = anyio.Lock()

    async def transcribe(self, audio_path: Path, language: str | None = None) -> str:
        model = await self._get_model()
        return await anyio.to_thread.run_sync(self._run, model, audio_path, language)

    async def _get_model(self) -> WhisperModel:
        if self._model is None:
            async with self._lock:
                if self._model is None:
                    self._model = await anyio.to_thread.run_sync(self._load_model)
        return self._model

    def _load_model(self) -> WhisperModel:
        try:
            register_cuda_dll_directories()
            logger.info(
                "Memuat model whisper '%s' (device=%s, compute_type=%s)",
                self._model_name,
                self._device,
                self._compute_type,
            )
            return WhisperModel(
                self._model_name,
                device=self._device,
                compute_type=self._compute_type,
            )
        except Exception as error:
            raise TranscriptionError(
                f"Gagal memuat model whisper '{self._model_name}': {error}"
            ) from error

    def _run(
        self, model: WhisperModel, audio_path: Path, language: str | None
    ) -> str:
        try:
            segments, _ = model.transcribe(str(audio_path), language=language or None)
            return "".join(segment.text for segment in segments).strip()
        except Exception as error:
            raise TranscriptionError(f"Transkripsi gagal: {error}") from error
