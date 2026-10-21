# 🚀 CramZero Deployment & Operations Guide

This guide covers deploying CramZero to production environments, including cloud hosting, database provisioning, and environment configuration.

---

## 1. Architecture Deployment Overview

```
Frontend (Vercel / Netlify) ──HTTPS──> Backend (Render / Railway / Docker) ──SQL──> Database (Neon PostgreSQL)
                                 └──WSS──> Multiplayer Server (Render / Fly.io / Node.js)
```

---

## 2. Environment Variables Checklist

### 2.1 Backend (`cramzero-backend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy connection string (PostgreSQL for prod, SQLite for dev) | `postgresql://user:pass@ep-cool-db.neon.tech/cramzero_db?sslmode=require` |
| `GEMINI_API_KEY` | Google Gemini API key (AI generation & file upload) | `AIzaSy...` |
| `GROQ_API_KEY` | Groq Cloud API key (Primary prompt generation & Groq fallback) | `gsk_...` |
| `GROQ_MODEL` | Preferred Groq model ID | `openai/gpt-oss-120b` *(default)* |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `https://cram-zero.vercel.app,http://localhost:5173` |
| `FRONTEND_URL` | Primary frontend web URL | `https://cram-zero.vercel.app` |

### 2.2 Frontend (`cramzero-frontend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend HTTP API base URL | `https://cramzero-backend.onrender.com` |
| `VITE_MULTIPLAYER_WS_URL` | WebSocket URL for real-time multiplayer | `wss://cramzero-backend.onrender.com/ws/multiplayer` |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs TTS API key | `sk_...` |
| `VITE_ELEVENLABS_MODEL_ID` | Voice model ID | `eleven_flash_v2_5` |

---

## 3. Database Setup (Neon PostgreSQL)

1. Create a serverless PostgreSQL database on [Neon.tech](https://neon.tech).
2. Copy the pooled connection string:
   ```
   postgresql://[user]:[password]@[endpoint].neon.tech/cramzero_db?sslmode=require
   ```
3. Set this string as `DATABASE_URL` in your backend environment.
4. CramZero automatically runs table creation and migrations on application startup (`models.Base.metadata.create_all(bind=engine)` and custom column migrations).

---

## 4. Backend Deployment (Render / Railway)

### Deploying to Render
1. Create a new **Web Service** connected to your CramZero repository.
2. Configure settings:
   - **Root Directory:** `cramzero-backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `ALLOWED_ORIGINS`

---

## 5. Frontend Deployment (Vercel)

1. Import your CramZero GitHub repository into **Vercel**.
2. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `cramzero-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://cramzero-backend.onrender.com`)
   - `VITE_ELEVENLABS_API_KEY`: Your ElevenLabs API key
   - `VITE_ELEVENLABS_MODEL_ID`: `eleven_flash_v2_5`
4. Deploy.

---

## 6. Multiplayer Server Options

CramZero supports two multiplayer WebSocket configurations:

1. **Embedded in FastAPI (`/ws/multiplayer`):**
   - No separate server needed. The WebSocket server runs directly on the FastAPI backend on the `/ws/multiplayer` path.
   - Point `VITE_MULTIPLAYER_WS_URL` to `wss://your-backend.com/ws/multiplayer`.

2. **Standalone Node.js Server (`server/multiplayer-server.js`):**
   - High-throughput dedicated WebSocket process.
   - Run via `node server/multiplayer-server.js` (listens on port 8787).
   - Point `VITE_MULTIPLAYER_WS_URL` to `wss://your-multiplayer-service.com`.

