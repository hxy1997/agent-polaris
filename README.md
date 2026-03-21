# Polaris

Polaris is a local-first internal agent platform with a FastAPI backend and a React frontend. It provides a business-facing chat workspace and an engineer-facing admin console for scene management.

## Local Run

Backend:

```bash
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Local URLs

- Chat UI: `http://127.0.0.1:5173/chat`
- Admin UI: `http://127.0.0.1:5173/admin`
- Backend API docs: `http://127.0.0.1:8000/docs`

## What Works

- Scene listing for chat and admin flows
- Local session creation
- Streaming assistant responses over SSE
- Draft admin UI and chat UI shells

## Verification

Backend tests:

```bash
pytest tests/backend -v
```

Frontend tests:

```bash
cd frontend
npm test
```
