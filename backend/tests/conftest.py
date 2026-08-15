from pathlib import Path

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from src.api.deps import get_audio_storage, get_transcriber
from src.db.base import Base
from src.db.session import get_session
from src.main import create_app
from src.storage.base import AudioStorage
from src.transcription.base import Transcriber


class FakeAudioStorage(AudioStorage):
    def __init__(self) -> None:
        self.saved: list[tuple[str, bytes]] = []
        self.deleted: list[str] = []

    async def save(self, data: bytes, original_name: str) -> str:
        self.saved.append((original_name, data))
        return f"{len(self.saved)}{Path(original_name).suffix.lower()}"

    def resolve(self, stored_name: str) -> Path:
        return Path(stored_name)

    async def delete(self, stored_name: str) -> None:
        self.deleted.append(stored_name)


class FakeTranscriber(Transcriber):
    async def transcribe(self, audio_path: Path) -> str:
        return f"transkrip untuk {audio_path.name}"


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    TestSessionFactory = async_sessionmaker(
        bind=engine, expire_on_commit=False, autoflush=False
    )

    async def override_get_session():
        async with TestSessionFactory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_audio_storage] = lambda: FakeAudioStorage()
    app.dependency_overrides[get_transcriber] = lambda: FakeTranscriber()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    await engine.dispose()
