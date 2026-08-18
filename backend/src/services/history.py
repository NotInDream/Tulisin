from src.core.exceptions import HistoryNotFoundError
from src.models.history import History
from src.repositories.base import HistoryRepository
from src.schemas.history import HistoryCreate, HistoryUpdate


class HistoryService:
    def __init__(self, repository: HistoryRepository) -> None:
        self._repository = repository

    async def create(self, data: HistoryCreate) -> History:
        history = History(
            name=data.name,
            audio_file=data.audio_file,
            output=data.output,
            segments=self._dump_segments(data),
        )
        return await self._repository.add(history)

    async def list_all(self) -> list[History]:
        return await self._repository.list_all()

    async def get(self, history_id: int) -> History:
        history = await self._repository.get(history_id)
        if history is None:
            raise HistoryNotFoundError(history_id)
        return history

    async def update(self, history_id: int, data: HistoryUpdate) -> History:
        history = await self._repository.get(history_id)
        if history is None:
            raise HistoryNotFoundError(history_id)
        history.name = data.name
        history.audio_file = data.audio_file
        history.output = data.output
        history.segments = self._dump_segments(data)
        return await self._repository.update(history)

    async def delete(self, history_id: int) -> str | None:
        history = await self._repository.get(history_id)
        if history is None:
            return None
        audio_file = history.audio_file
        await self._repository.delete(history_id)
        return audio_file

    @staticmethod
    def _dump_segments(
        data: HistoryCreate | HistoryUpdate,
    ) -> list[dict[str, float | str]] | None:
        if data.segments is None:
            return None
        return [segment.model_dump() for segment in data.segments]
