<div align="center">

# ⚡ CramZero

<p align="center">
  <strong>Frictionless AI Micro-Learning. Zero limits, instant mastery.</strong>
</p>

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/Groq-gpt--oss--120b-F55036?logo=groq&logoColor=white)](https://groq.com/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Flash_v2.5-FF4D4D?logo=elevenlabs&logoColor=white)](https://elevenlabs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<br />

[Explore Documentation](DOCUMENTATION.md) • [Architecture Guide](docs/ARCHITECTURE.md) • [API Reference](docs/API_REFERENCE.md) • [Study Modes](docs/STUDY_MODES.md) • [Deployment Guide](docs/DEPLOYMENT.md)

</div>

---

## 🌟 What is CramZero?

**CramZero** is an intelligent, high-performance study platform designed to eliminate the friction of traditional ed-tech tools. Students can upload heavy documents (PDFs, PowerPoint slides, lecture notes) or type prompts to instantly generate structured flashcards, quizzes, and timed mock exams—with the flexibility of **frictionless guest mode** or **cross-device email/password cloud sync**.

---

## ✨ Key Features & Capabilities

### 🤖 Dual AI Engine with Automatic Failover
- **Groq & Google Gemini Pairing:** Uses Groq (`openai/gpt-oss-120b` and `openai/gpt-oss-20b`) for ultra-low latency generation and Google Gemini (`gemini-2.0-flash` and `gemini-1.5-flash`) for deep document reasoning.
- **Self-Healing Fallback Pipeline:** If Gemini experiences capacity limits (503) or quota exhaustion (429), file processing automatically switches to Groq using built-in Python text extraction (`pypdf` and `python-pptx`).
- **LRU In-Memory Cache:** Remembers generated topics to deliver instant responses and protect API quotas.

### 📄 Universal Document Extraction
- Ingests **PDF** (`.pdf`), **PowerPoint** (`.pptx`), and **Text** (`.txt`) files directly into study decks.
- Intelligently parses slide text boxes, shapes, headers, and bullet points into clear terms and concise definitions.

### 🎴 Cognitive Science Study Modes
- **3D Spaced Repetition Flashcards:** Flip cards with smooth animations, confidence ratings (*Easy*, *Medium*, *Hard*), keyboard navigation (`Space`, arrows, `1-3`), and shuffle.
- **Dynamic Assessments:** Quizzes dynamically adapt cards into **Multiple Choice**, **True or False**, **Identification**, and **Matching Pairs**.
- **Timed AI Mock Exams:** Practice under exam pressure with a customizable question count, real-time countdown timer, question jumper palette, and deep score breakdown.
- **Audio Lecture Readouts:** Condensed audio summaries powered by **ElevenLabs Flash v2.5** with automatic browser **Web Speech API** fallback.
- **Context-Aware AI Tutor:** Interactive chat drawer grounded in the specific concepts of any deck to answer questions and provide mnemonics.

### ⚔️ Real-Time Multiplayer Battle Arena
- **Synchronized Match Timers:** Live quiz battles with synchronized 15-second answer countdowns between host and joiners.
- **Lobby PINs & Instant Links:** Share a 6-digit room code or one-click join URL (`?room=123456`).
- **Dynamic Leaderboards & Victory UI:** Real-time scoring, streak multipliers, and celebratory animated victory podiums.

### 👥 Collaborative Study Hubs
- **Classroom Hubs:** Create dedicated spaces for cohorts and classes with a unique 6-character invite code (e.g., `BSIT26`).
- **Role Permissions:** Admin/Owner controls, member management, and shared deck feeds.
- **One-Click Cloning:** Save any shared hub deck or public community deck straight into your personal library.

### 👤 Flexible Identity & Personalization
- **Frictionless Guest Access:** Start studying immediately with no passwords; data is saved locally to your device.
- **Cross-Device Cloud Accounts:** Register with email and password to sync your decks across phones, tablets, and computers.
- **Custom Avatars:** Choose from curated female and male student avatar sets or supply custom image URLs.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 19, Vite 8, Tailwind CSS v4, Radix UI, Lucide Icons, Sonner |
| **Backend API** | Python 3.10+, FastAPI, Pydantic v2, Uvicorn |
| **Database** | PostgreSQL (Neon / Render) & SQLite via SQLAlchemy ORM |
| **AI Engines** | Groq Cloud API, Google Gemini API |
| **Document Processing** | `pypdf`, `python-pptx`, ReportLab (PDF export) |
| **Audio Voice Engine** | ElevenLabs Flash v2.5 API, Web Speech API |
| **Realtime Networking** | WebSockets (FastAPI WS & Standalone Node.js WS Server) |

---

## 📁 Repository Structure

```
cramzero/
├── cramzero-backend/          # FastAPI Backend Server
│   ├── cache.py               # In-memory LRU cache & concurrency semaphore
│   ├── database.py            # SQLAlchemy engine (PostgreSQL / SQLite)
│   ├── main.py                # REST endpoints, AI failover & WebSocket gateway
│   ├── models.py              # Database models (User, Deck, Card, Hubs, etc.)
│   ├── requirements.txt       # Python dependencies
│   └── schemas.py             # Pydantic validation schemas
│
├── cramzero-frontend/         # React Single-Page Application
│   ├── server/                # Standalone Node.js multiplayer WebSocket server
│   ├── src/
│   │   ├── components/        # Radix UI primitives & layout elements
│   │   │   ├── auth/          # AuthModal (Login, Register, Guest setup)
│   │   │   ├── layout/        # PrimaryNavigation, MobileBottomNav, UsageTracker
│   │   │   └── ui/            # Buttons, Cards, Inputs, Progress, Badges
│   │   ├── features/views/    # Application Views
│   │   │   ├── DashboardView.jsx
│   │   │   ├── DecksView.jsx
│   │   │   ├── FlashcardModeView.jsx
│   │   │   ├── HubDetailsView.jsx
│   │   │   ├── LandingPageView.jsx
│   │   │   ├── MockExamActiveView.jsx
│   │   │   ├── MultiplayerView.jsx
│   │   │   ├── NewDeckView.jsx
│   │   │   ├── ProfileView.jsx
│   │   │   ├── QuizSetupView.jsx
│   │   │   └── StudyHubsView.jsx
│   │   ├── lib/               # API clients, ElevenLabs TTS, analytics
│   │   ├── App.jsx            # Main app router, state & theme management
│   │   └── main.jsx           # React DOM root entry
│   └── package.json
│
├── docs/                      # Technical Documentation
│   ├── ARCHITECTURE.md        # Deep dive into system design & AI pipelines
│   ├── API_REFERENCE.md       # Comprehensive REST & WebSocket documentation
│   ├── STUDY_MODES.md         # Guide to all 6 study modes and mechanics
│   └── DEPLOYMENT.md          # Cloud production deployment guides
│
├── DOCUMENTATION.md           # Master documentation index
└── README.md                  # Project overview (this file)
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18.0 or later)
- **Python** (v3.10 or later)
- API Keys for **Google Gemini** and/or **Groq**

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd cramzero-backend

# Create and activate virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your credentials
# (See Environment Variables below)

# Run development server
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`. You can inspect the interactive Swagger API documentation at `http://localhost:8000/docs`.

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd cramzero-frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will run on `http://localhost:5173`.

---

### 4. Multiplayer Realtime Server

The multiplayer battle engine connects automatically to the WebSocket endpoint. To run the dedicated high-performance WebSocket process:

```bash
# Inside cramzero-frontend:
npm run multiplayer
```
The server listens on `ws://localhost:8787`.

---

## ⚙️ Environment Variables

### Backend (`cramzero-backend/.env`)

```env
# Database (SQLite by default, or Neon / Supabase PostgreSQL)
DATABASE_URL=sqlite:///./cramzero.db

# AI Engines
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://cram-zero.vercel.app
```

### Frontend (`cramzero-frontend/.env`)

```env
# Backend API Base URL
VITE_API_URL=http://localhost:8000

# Multiplayer WebSocket URL (optional, defaults to API_BASE ws)
VITE_MULTIPLAYER_WS_URL=ws://localhost:8787

# Voice Synthesis (optional, falls back to Web Speech API)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
VITE_ELEVENLABS_MODEL_ID=eleven_flash_v2_5
```

---

## 📚 Comprehensive Documentation

For complete technical specifications, review our documentation suite:
- [📖 Master Documentation (`DOCUMENTATION.md`)](DOCUMENTATION.md)
- [🏛️ System Architecture (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md)
- [📡 API Reference & WebSockets (`docs/API_REFERENCE.md`)](docs/API_REFERENCE.md)
- [🧠 Study Modes & Learning Science (`docs/STUDY_MODES.md`)](docs/STUDY_MODES.md)
- [🚀 Cloud Deployment Guide (`docs/DEPLOYMENT.md`)](docs/DEPLOYMENT.md)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ for modern learners everywhere. © 2026 CramZero.</sub>
</div>
