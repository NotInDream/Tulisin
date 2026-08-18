from pathlib import Path

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from src.api.deps import get_audio_storage, get_transcriber
from src.db.base import Base
from src.db.session import get_session
from src.main import create_app
from src.storage.local import LocalAudioStorage
from src.transcription.base import Transcriber


class StubTranscriber(Transcriber):
    async def transcribe(self, audio_path: Path, language: str | None = None) -> str:
        return "teks"


@pytest_asyncio.fixture
async def cleanup_client(tmp_path):
    storage_dir = tmp_path / "audio"
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

    storage = LocalAudioStorage(str(storage_dir))
    app = create_app()
    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_audio_storage] = lambda: storage
    app.dependency_overrides[get_transcriber] = lambda: StubTranscriber()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac, storage_dir

    await engine.dispose()


async def test_deleting_history_removes_audio_file(cleanup_client):
    client, storage_dir = cleanup_client

    transcribed = await client.post(
        "/api/v1/transcribe/",
        files={"file": ("rapat.mp3", b"fake-audio-bytes", "audio/mpeg")},
    )
    audio_file = transcribed.json()["audio_file"]
    assert (storage_dir / audio_file).exists()

    created = await client.post(
        "/api/v1/history/",
        json={"name": "rapat", "audio_file": audio_file, "output": "teks"},
    )
    history_id = created.json()["id"]

    deleted = await client.delete(f"/api/v1/history/{history_id}")

    assert deleted.status_code == 204
    assert not (storage_dir / audio_file).exists()


async def test_deleting_missing_history_is_noop(cleanup_client):
    client, _ = cleanup_client

    response = await client.delete("/api/v1/history/999")

    assert response.status_code == 204
