from abc import ABC, abstractmethod
from pathlib import Path


class AudioStorage(ABC):
    @abstractmethod
    async def save(self, data: bytes, original_name: str) -> str: ...

    @abstractmethod
    def resolve(self, stored_name: str) -> Path: ...

    @abstractmethod
    async def delete(self, stored_name: str) -> None: ...
