# Tulisin — Backend

Kerangka backend FastAPI berlapis. Open source, **run on your machine**, tanpa akun
dan tanpa cloud. State disimpan di satu file SQLite (analogi "savegame").

## Stack

FastAPI (async) · SQLAlchemy 2.0 async · aiosqlite · Pydantic v2.

## Menjalankan

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate   |  Unix: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --reload
```

Buka `http://127.0.0.1:8000/docs`.

## API

| Method | Path                         | Fungsi        |
| ------ | ---------------------------- | ------------- |
| GET    | `/api/v1/health`             | Health check  |
| GET    | `/api/v1/history/`           | Daftar history |
| GET    | `/api/v1/history/{id}`       | Detail history |

## Arsitektur

Layered + SOLID. Detail konvensi ada di [`CLAUDE.md`](./CLAUDE.md).
