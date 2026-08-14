from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.history import History
from src.repositories.base import HistoryRepository


class SqlAlchemyHistoryRepository(HistoryRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, history: History) -> History:
        self._session.add(history)
        await self._session.flush()
        return history

    async def list_all(self) -> list[History]:
        result = await self._session.execute(
            select(History).order_by(History.created_at.desc())
        )
        return list(result.scalars().all())

    async def get(self, history_id: int) -> History | None:
        return await self._session.get(History, history_id)

    async def update(self, history: History) -> History:
        await self._session.flush()
        return history

    async def delete(self, history_id: int) -> None:
        history = await self._session.get(History, history_id)
        if history is not None:
            await self._session.delete(history)
            await self._session.flush()
