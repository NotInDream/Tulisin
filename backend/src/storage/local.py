from pathlib import Path
from uuid import uuid4

import anyio

from src.storage.base import AudioStorage


class LocalAudioStorage(AudioStorage):
    def __init__(self, base_dir: str) -> None:
        self._base_dir = Path(base_dir)

    async def save(self, data: bytes, original_name: str) -> str:
        suffix = Path(original_name).suffix.lower()
        stored_name = f"{uuid4().hex}{suffix}"
        await anyio.to_thread.run_sync(self._write, stored_name, data)
        return stored_name

    def resolve(self, stored_name: str) -> Path:
        name = Path(stored_name).name
        return self._base_dir / name

    async def delete(self, stored_name: str) -> None:
        await anyio.to_thread.run_sync(self._remove, stored_name)

    def _write(self, stored_name: str, data: bytes) -> None:
        self._base_dir.mkdir(parents=True, exist_ok=True)
        (self._base_dir / stored_name).write_bytes(data)

    def _remove(self, stored_name: str) -> None:
        self.resolve(stored_name).unlink(missing_ok=True)
