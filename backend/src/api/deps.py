from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import Settings, get_settings
from src.db.session import get_session
from src.repositories.base import HistoryRepository
from src.repositories.history import SqlAlchemyHistoryRepository
from src.services.history import HistoryService

SettingsDep = Annotated[Settings, Depends(get_settings)]
SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_history_repository(session: SessionDep) -> HistoryRepository:
    return SqlAlchemyHistoryRepository(session)


HistoryRepositoryDep = Annotated[HistoryRepository, Depends(get_history_repository)]


def get_history_service(repository: HistoryRepositoryDep) -> HistoryService:
    return HistoryService(repository)


HistoryServiceDep = Annotated[HistoryService, Depends(get_history_service)]
