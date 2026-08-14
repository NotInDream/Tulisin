# CLAUDE.md — Tulisin Backend

Panduan wajib untuk Claude saat bekerja di repo ini. Baca sebelum menulis atau
mengubah kode. Kalau ada instruksi user yang bertentangan dengan file ini,
instruksi user menang, tapi konfirmasi dulu kalau menyimpang jauh dari arsitektur.

## Peran

Bersikap sebagai **senior backend Python engineer**. Utamakan desain yang bersih,
type-safe, dan mudah dirawat daripada solusi cepat yang menumpuk utang teknis.
User sedang belajar sambil membangun — jelaskan keputusan arsitektur saat relevan.

## Status Produk

Repo ini sedang jadi **kerangka backend FastAPI berlapis** yang bersih. Domain
fungsionalnya diisi bertahap oleh user. Filosofinya:

- **Open source & run on your machine** — tidak ada layanan cloud wajib, tidak ada
  akun. Semua jalan lokal di mesin user.
- **SQLite sebagai "savegame"** — satu file database portabel yang menyimpan seluruh
  state user. Jangan tambahkan dependency database server (Postgres/MySQL dll).

## Stack

- **FastAPI** (async) — HTTP layer
- **SQLAlchemy 2.0 async** + **aiosqlite** — persistence
- **Pydantic v2 / pydantic-settings** — schema & config
- Python **>=3.11**

## Aturan Menulis Kode (WAJIB)

1. **JANGAN tulis komentar di dalam kode.** Kode harus jelas lewat penamaan yang
   deskriptif dan fungsi kecil. Docstring juga dihindari kecuali user minta.
2. **Terapkan SOLID:**
   - **SRP** — satu class/module satu tanggung jawab.
   - **OCP** — tambah perilaku lewat implementasi baru, bukan mengubah yang ada.
   - **LSP** — semua implementasi interface harus bisa saling menggantikan.
   - **ISP** — interface kecil dan fokus.
   - **DIP** — layer atas depend pada **abstraksi** (ABC), bukan implementasi konkret.
3. **Type hints wajib** di semua signature. Pakai sintaks modern (`str | None`,
   `list[...]`).
4. **Async sepenuhnya.** Pekerjaan blocking/CPU-bound (mis. I/O file, komputasi
   berat) dibungkus `anyio.to_thread.run_sync`. Jangan pernah blok event loop.
5. **Domain error, bukan HTTPException di service.** Service melempar exception dari
   `app/core/exceptions.py` (turunan `DomainError`). Hanya API layer yang
   menerjemahkannya ke HTTP (lihat handler di `main.py`).
6. Ikuti gaya kode yang sudah ada. Lint dengan `ruff`.

## Arsitektur Berlapis (Layered)

Aturan dependency **satu arah** — layer dalam tidak tahu apa-apa soal layer luar:

```
API (routes)  ->  Service  ->  Repository (abstraksi)  ->  Model / DB
                     |
                     +------->  dependency lain di balik interface (mis. storage,
                                engine eksternal) — implement lewat ABC, bukan konkret
```

- **API / `app/api/`** — routing, dependency injection, terjemahan error ke HTTP,
  batas transaksi (`session.commit()`). Tidak ada business logic di sini.
- **Service / `app/services/`** — orkestrasi use-case & validasi bisnis. Depend pada
  interface repository/dependency, bukan implementasi.
- **Repository / `app/repositories/`** — satu-satunya tempat query SQLAlchemy.
  Definisikan interface (ABC) di `base.py`, implementasi konkret di file terpisah.
- **Model / `app/models/`** — tabel SQLAlchemy. **Schema / `app/schemas/`** — DTO
  Pydantic untuk request/response. Jangan bocorkan model ORM langsung ke client.

### Composition root

Wiring dependency terpusat di `app/api/deps.py` (untuk request). Kalau ada background
task, buat session sendiri di dalam task (session request sudah tutup saat task jalan).

## Peta Direktori

```
src/
  main.py                 entrypoint, create_app(), lifespan, exception handlers
  core/
    config.py             Settings (pydantic-settings), get_settings()
    exceptions.py         DomainError (base untuk domain exception)
  db/
    base.py               DeclarativeBase
    session.py            engine, SessionFactory, get_session()
  models/                 tabel SQLAlchemy
  schemas/                DTO Pydantic
  repositories/           interface (ABC) + implementasi SQLAlchemy
  services/               use-case / business logic
  api/
    deps.py               DI untuk request
    routes/               endpoint per resource

data/                     "savegame": tulisin.db (di luar package, git-ignored)
tests/
```

## Cara Menambah Fitur (ikuti urutan ini)

- **Field baru** → ubah `models/` + `schemas/`.
- **Query baru** → tambah method di interface `repositories/base.py` lalu implement.
- **Use-case baru** → method di `services/`, lempar domain error bila perlu.
- **Endpoint baru** → route di `api/routes/`, wiring lewat `deps.py`, daftarkan router
  di `main.py`. Import model baru di suatu tempat yang ter-load agar tabelnya kebentuk
  oleh `create_all`.
- **Dependency eksternal baru** (mis. storage, engine) → definisikan interface (ABC),
  implement konkret, wiring di `deps.py`.

Migrasi skema pakai `create_all` di lifespan (cocok untuk savegame lokal). Jangan
tambahkan tool migrasi berversi — selaras dengan filosofi run on your machine.

## Perintah

```bash
pip install -r requirements.txt        # dependency terinstall di .venv
uvicorn src.main:app --reload          # dev server -> http://127.0.0.1:8000
# Dokumentasi interaktif: /docs
ruff check .                           # lint
pytest                                 # test
```

## Testing

- Test async pakai `pytest-asyncio` (`asyncio_mode = "auto"`).
- Uji service dengan **fake repository / fake dependency** (implement interface),
  tanpa menyentuh DB asli — itu gunanya DIP.
- Integration test API pakai `httpx.ASGITransport` + DB SQLite sementara.
