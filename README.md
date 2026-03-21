# LectureLens

LectureLens is an AI-powered lecture management platform. Teachers upload lecture audio and materials; the system automatically transcribes the audio, embeds the content into a vector database, and gives students a RAG-powered chat interface to ask questions directly about their course material.

---

## Architecture

Three services run locally and communicate over HTTP:

```
Frontend (Vite/React)   →   Backend (Django REST)   →   AI Service (FastAPI)
     :5173                        :8000                        :8001
                                                                  ↓
                                                         Deepgram (transcription)
                                                         OpenRouter (LLM + embeddings)
                                                         Pinecone (vector store)
```

| Service | Stack | Port |
|---------|-------|------|
| Frontend | React 18, Vite, Tailwind, Zustand | 5173 |
| Backend | Django 4.2, DRF, SimpleJWT | 8000 |
| AI Service | FastAPI, LangGraph, Pinecone | 8001 |

---

## Prerequisites

Make sure you have these installed before starting:

- **Python 3.13** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **pip** and **venv** (bundled with Python)
- **Git**

You also need accounts and API keys for three external services:

| Service | Purpose | Get key at |
|---------|---------|------------|
| [Deepgram](https://deepgram.com) | Audio transcription | console.deepgram.com |
| [OpenRouter](https://openrouter.ai) | LLM answers + embeddings | openrouter.ai/keys |
| [Pinecone](https://pinecone.io) | Vector storage for RAG | app.pinecone.io |

---

## 1. Clone the Repository

```bash
git clone <repo-url>
cd LectureLens
```

---

## 2. Backend Setup (Django)

### 2a. Create a virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
```

### 2b. Install dependencies

```bash
pip install -r requirements.txt
```

### 2c. Configure environment variables

```bash
cp .env.example .env
```

Open `backend/.env` and fill in the values:

```env
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True

# Leave these blank to use SQLite (recommended for local dev)
# DB_NAME=lecturelens
# DB_USER=lecturelens_user
# DB_PASSWORD=strongpassword
# DB_HOST=localhost
# DB_PORT=5432

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=1440
```

> **SQLite vs PostgreSQL**: By default the backend uses SQLite (`db.sqlite3`) which requires no extra setup. To use PostgreSQL, uncomment the `DB_*` variables, create the database, and update `settings.py` to use the PostgreSQL `DATABASES` config.

### 2d. Run migrations

```bash
python manage.py migrate
```

### 2e. Create an admin user

```bash
python manage.py createsuperuser
```

Follow the prompts to set email, password, and role. You can use this account to log into the app as a teacher.

### 2f. Start the backend

```bash
python manage.py runserver
```

Backend is now running at **http://127.0.0.1:8000**

- API docs (Swagger): http://127.0.0.1:8000/api/docs/
- Admin panel: http://127.0.0.1:8000/admin/

---

## 3. AI Service Setup (FastAPI)

Open a **new terminal** and keep the backend running.

### 3a. Create a virtual environment

```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
```

### 3b. Install dependencies

```bash
pip install -r requirements.txt
```

### 3c. Configure environment variables

```bash
cp .env.example .env
```

Open `ai-service/.env` and fill in your API keys:

```env
# Required — get these from the services listed in Prerequisites
OPENROUTER_API_KEY=sk-or-v1-...
PINECONE_API_KEY=pcsk_...
DEEPGRAM_API_KEY=...

# Pinecone index settings — create an index named "lecturelens" in your Pinecone dashboard
PINECONE_INDEX_NAME=lecturelens
PINECONE_ENVIRONMENT=us-east-1

# Model settings (these defaults work with the free OpenRouter tier)
LLM_MODEL=mistralai/mistral-7b-instruct-v0.1
EMBEDDING_MODEL=nvidia/llama-nemotron-embed-vl-1b-v2:free
EMBEDDING_DIMENSION=4096
```

#### Creating the Pinecone index

1. Go to [app.pinecone.io](https://app.pinecone.io)
2. Create a new index named **`lecturelens`**
3. Set dimensions to **`4096`** (must match `EMBEDDING_DIMENSION`)
4. Use **cosine** as the metric

### 3d. Start the AI service

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

AI service is now running at **http://127.0.0.1:8001**

- API docs: http://127.0.0.1:8001/docs
- Health check: http://127.0.0.1:8001/health

---

## 4. Frontend Setup (React)

Open a **new terminal**.

### 4a. Install dependencies

```bash
cd frontend
npm install
```

### 4b. Start the dev server

```bash
npm run dev
```

Frontend is now running at **http://localhost:5173**

---

## 5. Using the App

With all three services running, open **http://localhost:5173** in your browser.

### Register accounts

Navigate to `/register` to create accounts. There are two roles:

- **Teacher** — can create subjects, upload lectures with audio, view transcripts
- **Student** — can browse subjects, view lectures, and use the AI chat

### Teacher workflow

1. Log in as a teacher
2. Go to **Subjects** → **Create New Subject**
3. Open the subject → click **Upload New** to upload a lecture
4. Attach an audio file — the backend will automatically trigger transcription in the background
5. Once transcription completes (check the transcript tab in the lecture view), the lecture content is searchable via chat

### Student workflow

1. Log in as a student
2. Browse **Available Subjects** on the dashboard
3. Open a subject → select lectures → click **Chat**
4. Select which lectures to use as context, then ask questions

---

## 6. Running All Services (Quick Reference)

Open **three separate terminals**:

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2 — AI Service
cd ai-service && source venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

# Terminal 3 — Frontend
cd frontend && npm run dev
```

---

## Project Structure

```
LectureLens/
├── backend/                  # Django REST API
│   ├── apps/
│   │   ├── authentication/   # JWT auth, registration, login
│   │   ├── users/            # User profiles
│   │   ├── courses/          # Subject/course management
│   │   ├── lectures/         # Lecture and material management
│   │   ├── transcriptions/   # Transcription trigger + status
│   │   └── chat/             # Proxy to AI service for RAG chat
│   ├── config/               # Django settings, URLs
│   ├── requirements.txt
│   └── .env.example
│
├── ai-service/               # FastAPI AI pipeline
│   ├── app/
│   │   ├── routers/          # /ai/transcribe and /ai/chat endpoints
│   │   ├── services/
│   │   │   ├── rag.py        # LangGraph RAG pipeline
│   │   │   └── vector_store.py # Pinecone client
│   │   ├── models/schemas.py # Pydantic request/response models
│   │   ├── config.py         # Settings loaded from .env
│   │   └── main.py           # FastAPI app + CORS
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                 # React + Vite app
    ├── src/app/
    │   ├── pages/
    │   │   ├── student/      # Dashboard, SubjectDetail, ChatInterface
    │   │   └── teacher/      # SubjectList, TeacherSubjectDetail, Upload
    │   ├── services/api.js   # Axios client for all API calls
    │   ├── store/            # Zustand stores (auth, chat, theme)
    │   └── components/ui/    # shadcn/ui component library
    └── package.json
```

---

## API Overview

### Backend (Django) — `http://127.0.0.1:8000/api/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Create account |
| POST | `/auth/login/` | Get JWT tokens |
| POST | `/auth/logout/` | Blacklist refresh token |
| GET/POST | `/courses/` | List / create subjects |
| GET/PUT/DELETE | `/courses/{id}/` | Subject detail |
| GET/POST | `/lectures/` | List / create lectures |
| GET | `/lectures/{id}/` | Lecture detail with materials |
| POST | `/transcriptions/{id}/start/` | Trigger transcription |
| GET | `/transcriptions/{id}/status/` | Poll transcription status |
| POST | `/chat/ask/` | Send question to RAG pipeline |

### AI Service (FastAPI) — `http://127.0.0.1:8001/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/transcribe` | Transcribe audio + embed into Pinecone |
| POST | `/ai/chat` | RAG query with citations |
| GET | `/health` | Health check |

---

## Troubleshooting

**"Network error. Is the backend running?"**
The frontend cannot reach the backend. Make sure Django is running on port 8000.

**Chat returns "The specific information you're asking for is not covered..."**
The lecture has not been transcribed yet, or the transcription failed. Check the teacher view to confirm the transcript is visible. Also confirm the AI service is running.

**Transcription never completes**
- Verify `DEEPGRAM_API_KEY` is set in `ai-service/.env`
- Check the AI service terminal for error output
- The audio file must be reachable at the path stored in the database (`media/uploads/...`)

**Pinecone connection error**
- Verify `PINECONE_API_KEY` is correct
- Make sure the index named `lecturelens` exists in your Pinecone project
- Confirm `EMBEDDING_DIMENSION=4096` matches the index dimension

**"Invalid token" or 401 errors after being logged in**
The access token expired. The frontend auto-refreshes it; if it fails, log out and log back in.

---

## Environment Variable Reference

### `backend/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | — | Django secret key (use a long random string) |
| `DEBUG` | No | `True` | Set to `False` in production |
| `ALLOWED_HOSTS` | No | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | No | Vite + React origins | Comma-separated frontend URLs |
| `DB_NAME` | No | — | PostgreSQL DB name (omit to use SQLite) |
| `DB_USER` | No | — | PostgreSQL user |
| `DB_PASSWORD` | No | — | PostgreSQL password |
| `DB_HOST` | No | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `ACCESS_TOKEN_LIFETIME` | No | `60` | JWT access token TTL (minutes) |
| `REFRESH_TOKEN_LIFETIME` | No | `1440` | JWT refresh token TTL (minutes) |

### `ai-service/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | — | OpenRouter API key for LLM + embeddings |
| `PINECONE_API_KEY` | Yes | — | Pinecone API key |
| `DEEPGRAM_API_KEY` | Yes | — | Deepgram API key for audio transcription |
| `PINECONE_INDEX_NAME` | No | `lecturelens` | Pinecone index name |
| `PINECONE_ENVIRONMENT` | No | `us-east-1` | Pinecone region |
| `LLM_MODEL` | No | `mistralai/mistral-7b-instruct-v0.1` | OpenRouter LLM model |
| `EMBEDDING_MODEL` | No | `nvidia/llama-nemotron-embed-vl-1b-v2:free` | OpenRouter embedding model |
| `EMBEDDING_DIMENSION` | No | `4096` | Must match Pinecone index dimension |
| `CHUNK_SIZE` | No | `500` | Token chunk size for transcript splitting |
| `CHUNK_OVERLAP` | No | `50` | Token overlap between chunks |
