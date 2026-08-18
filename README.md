<p align="center">
  <img src="frontend/public/logo.svg" alt="Tulisin logo" width="120" height="120" />
</p>

<h1 align="center">Tulisin</h1>

Self-hosted **speech-to-text**: upload an audio file, get the transcript back. Everything runs on your own machine — open source, no account, no cloud service. Your data lives in a single portable SQLite file (a "savegame") plus the audio files on disk.

- **Backend** — FastAPI (async) + SQLAlchemy 2.0 + SQLite, transcription powered by [faster-whisper](https://github.com/SYSTRAN/faster-whisper) (CTranslate2).
- **Frontend** — React 19 + Vite + Tailwind v4.

## Features

- Upload audio (MP3, WAV, M4A, …) and transcribe it locally with Whisper.
- A single **Saved** list — each item plays back its audio and shows its transcript.
- **Edit** a transcript when the result is off, **rename**, or **delete** an entry (deleting also removes its audio file from disk).
- Run on **CPU or NVIDIA GPU (CUDA)** — switchable via an environment variable.
- Light / dark theme.

## How it works

1. The browser uploads the file **once** to `POST /api/v1/transcribe/`.
2. The backend saves it to `data/audio/<uuid>.<ext>`, runs faster-whisper, and returns `{ name, audio_file, output }`.
3. The frontend creates a history record via `POST /api/v1/history/`, reusing the returned `audio_file` reference — the bytes are never re-sent.
4. Playback streams the same file back through the `/audio` static mount.

The transcript (`output`) and the audio reference (`audio_file`, a filename relative to `data/audio/`) live on the same history row. No second copy of the audio is ever made.

## Requirements

- **Python 3.11+**
- **Node.js 20+** (for the frontend)
- **Rust toolchain** — _only_ if pip has to build the `tokenizers` dependency from source (no prebuilt wheel for your OS / Python version). Most users on common platforms don't need it. Install from [rustup.rs](https://rustup.rs) if the backend install fails on `tokenizers` (see [Troubleshooting](#troubleshooting)).
- Optional: an NVIDIA GPU with CUDA for faster transcription.

## Getting started

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   Unix: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --reload
```

The API runs at `http://127.0.0.1:8000` — interactive docs at `http://127.0.0.1:8000/docs`.
The Whisper model is downloaded automatically the first time you transcribe.

#### Using an NVIDIA GPU (CUDA)

`requirements.txt` installs the **CPU** stack only. To run on CUDA you also need the
CUDA 12 runtime libraries (`cuBLAS 12` + cuDNN) — the simplest way to get them is to
install a **PyTorch CUDA 12** build, which ships those libraries as dependencies:

```bash
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

Then point Tulisin at the GPU in `backend/.env`:

```
TULISIN_DEVICE=cuda
TULISIN_WHISPER_COMPUTE_TYPE=float16
```

Without the CUDA libraries on your path, faster-whisper / whisper-ctranslate2 fails at
startup looking for `cublas64_12.dll` (Windows) or `libcublas.so.12` (Linux) — see
[Troubleshooting](#troubleshooting).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173` and talks to the backend at `VITE_API_BASE_URL`.

## Configuration

### Backend (`backend/.env`, prefix `TULISIN_`)

| Variable                       | Default                                 | Description                                                                                                              |
| ------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `TULISIN_DATABASE_URL`         | `sqlite+aiosqlite:///./data/tulisin.db` | SQLite "savegame" database.                                                                                              |
| `TULISIN_AUDIO_DIR`            | `./data/audio`                          | Where uploaded audio files are stored.                                                                                   |
| `TULISIN_AUDIO_URL_PREFIX`     | `/audio`                                | Static mount path used for playback.                                                                                     |
| `TULISIN_WHISPER_MODEL`        | `base`                                  | `tiny` \| `base` \| `small` \| `medium` \| `large-v3` \| `large-v3-turbo` (add `.en` for English-only, e.g. `small.en`). |
| `TULISIN_DEVICE`               | `cpu`                                   | `cpu` \| `cuda` \| `auto`.                                                                                               |
| `TULISIN_WHISPER_COMPUTE_TYPE` | `int8`                                  | CPU: `int8` \| `int16` \| `float32`. CUDA: `float16` \| `int8_float16` \| `bfloat16` \| `float32`.                       |
| `TULISIN_WHISPER_LANGUAGE`     | _(empty)_                               | ISO-639-1 code (`id`, `en`, …). Empty = auto-detect.                                                                     |
| `TULISIN_CORS_ORIGINS`         | `["http://localhost:5173"]`             | Allowed frontend origins.                                                                                                |

Larger models are more accurate but slower and need more RAM/VRAM. For GPU, `cuda` + `float16` is a good starting point — but first install the CUDA 12 libraries (see [Using an NVIDIA GPU (CUDA)](#using-an-nvidia-gpu-cuda)).

### Frontend (`frontend/.env`)

| Variable            | Default                  | Description                        |
| ------------------- | ------------------------ | ---------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8000/` | Backend base URL (trailing slash). |

## API

| Method | Path                   | Description                                                             |
| ------ | ---------------------- | ----------------------------------------------------------------------- |
| GET    | `/api/v1/health`       | Health check.                                                           |
| POST   | `/api/v1/transcribe/`  | Upload audio (multipart `file`), returns transcript + stored reference. |
| GET    | `/api/v1/history/`     | List saved transcriptions (newest first).                               |
| GET    | `/api/v1/history/{id}` | Get one transcription.                                                  |
| POST   | `/api/v1/history/`     | Create a history record.                                                |
| PUT    | `/api/v1/history/{id}` | Update a record (rename / edit transcript).                             |
| DELETE | `/api/v1/history/{id}` | Delete a record **and** its audio file.                                 |
| GET    | `/audio/{filename}`    | Stream a stored audio file (supports range requests).                   |

## Project structure

```
Tulisin/
├── backend/                 FastAPI service
│   ├── src/
│   │   ├── api/routes/       health, transcribe, history endpoints
│   │   ├── services/         use-cases (history, transcription)
│   │   ├── repositories/     SQLAlchemy data access (behind ABCs)
│   │   ├── storage/          audio file storage (behind ABC)
│   │   ├── transcription/    faster-whisper engine (behind ABC)
│   │   ├── models/ schemas/  ORM tables & Pydantic DTOs
│   │   └── main.py           app factory, static mount, lifespan
│   ├── data/                 SQLite db + audio/ (git-ignored)
│   └── tests/
└── frontend/                React + Vite app (atomic design)
    └── src/
        ├── components/       atoms / molecules / organisms / templates
        ├── features/         transcription & history state hooks + API
        └── lib/              fetch helpers, utilities
```

The backend follows a layered, SOLID architecture (API → Service → Repository/Storage/Transcriber, all behind abstractions). See [`backend/CLAUDE.md`](./backend/CLAUDE.md) and [`frontend/CLAUDE.md`](./frontend/CLAUDE.md) for the detailed conventions.

## Development

```bash
# Backend
cd backend
ruff check .        # lint
mypy src            # type-check
pytest              # tests

# Frontend
cd frontend
npm run lint        # eslint
npm run build       # type-check + production build
```

## Troubleshooting

### Backend install fails while building `tokenizers` (Rust)

faster-whisper pulls in HuggingFace `tokenizers`, which is written in Rust. If pip
can't find a prebuilt wheel for your platform / Python version, it falls back to
compiling it from source — which needs a Rust compiler and fails with an error like
`error: can't find Rust compiler` or `Cargo, the Rust package manager, is not installed`.

Fix it with any of:

- **Install Rust** from [rustup.rs](https://rustup.rs), reopen your terminal, then re-run
  `pip install -r requirements.txt`. On Windows, also install the "Desktop development
  with C++" build tools if prompted.
- **Upgrade pip first** (`python -m pip install -U pip`) so it can pick up a matching
  prebuilt wheel, then reinstall.
- **Use a Python version with prebuilt wheels** (3.11 or 3.12 are the safest).

### CUDA error: cannot find `cublas64_12.dll` / `libcublas.so.12`

Tulisin ships the **CPU** dependencies only, so `TULISIN_DEVICE=cuda` fails at
startup when the CUDA 12 runtime libraries (cuBLAS 12 + cuDNN) aren't installed —
whisper-ctranslate2 / CTranslate2 looks for `cublas64_12.dll` on Windows or
`libcublas.so.12` on Linux.

Install a **PyTorch CUDA 12** build, which bundles those libraries:

```bash
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

Make sure your NVIDIA driver supports CUDA 12, then restart the backend. See
[Using an NVIDIA GPU (CUDA)](#using-an-nvidia-gpu-cuda) for the full setup.

### First transcription is slow

The Whisper model is downloaded on first use and cached under
`~/.cache/huggingface`. Later runs reuse the cache. Pick a smaller
`TULISIN_WHISPER_MODEL` (e.g. `tiny`) for faster, lower-accuracy results.

## License

Open source — run it on your own machine.
