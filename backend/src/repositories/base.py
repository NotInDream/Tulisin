from abc import ABC, abstractmethod

from src.models.history import History


class HistoryRepository(ABC):
    @abstractmethod
    async def add(self, history: History) -> History: ...

    @abstractmethod
    async def list_all(self) -> list[History]: ...

    @abstractmethod
    async def get(self, history_id: int) -> History | None: ...

    @abstractmethod
    async def update(self, history: History) -> History: ...

    @abstractmethod
    async def delete(self, history_id: int) -> None: ...
