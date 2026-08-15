from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from src.api.routes import health, history, transcribe
from src.core.config import get_settings
from src.core.exceptions import DomainError, NotFoundError
from src.db.base import Base
from src.db.session import engine
from src.models import History  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(get_settings().audio_dir).mkdir(parents=True, exist_ok=True)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


def _register_exception_handlers(app: FastAPI) -> None:
    async def handle_domain_error(request: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": exc.message},
        )

    async def handle_not_found_error(
        request: Request, exc: NotFoundError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": exc.message},
        )

    app.add_exception_handler(DomainError, handle_domain_error)
    app.add_exception_handler(NotFoundError, handle_not_found_error)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _register_exception_handlers(app)

    app.include_router(health.router, prefix=settings.api_prefix)
    app.include_router(history.router, prefix=settings.api_prefix)
    app.include_router(transcribe.router, prefix=settings.api_prefix)

    Path(settings.audio_dir).mkdir(parents=True, exist_ok=True)
    app.mount(
        settings.audio_url_prefix,
        StaticFiles(directory=settings.audio_dir),
        name="audio",
    )
    return app


app = create_app()
