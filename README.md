# ⚡ CramZero

> **Frictionless AI Micro-Learning. Zero accounts, zero limits.**

CramZero is a free, web-based, AI-powered study platform designed to eliminate the friction of traditional ed-tech tools. Upload study materials (PDFs, PPTs) or input text prompts to instantly generate an interactive, customized study suite—including flashcards, quizzes, and a conversational AI tutor—without ever creating an account.

## ✨ Features

### Core Engine
- **Frictionless Entry & Persistence:** 100% free with no accounts. Study history is saved locally to your browser and backed by shareable permalinks.
- **Universal Input:** Drag-and-drop PDFs, PPTs, TXT, or direct text prompts.
- **AI Smart Flashcards:** Auto-generated key term/definition flip cards.
- **Dynamic Quizzing:** Multiple assessment types (Matching, Identification, True/False) tailored to the text.
- **AI Tutor Chatbot:** Persistent chat window to ask specific questions about the uploaded document.
- **Summarized Readouts:** Long, dense materials condensed into structured lecture summaries.

### Differentiating Features
- **Browser-Based Spaced Repetition:** Uses `localStorage` to track struggled flashcards and re-tests them.
- **Confidence Slider:** Rate confidence before flipping a card to adjust upcoming quiz difficulty.
- **One-Click Multiplayer:** Shareable link for live, competitive quiz lobbies.
- **Vocal Language Partner:** Web Speech API integration for oral prep and language learning.

## 🛠️ Tech Stack

- **Frontend UI:** React (Vite)
- **Backend API:** Python (FastAPI)
- **Database & Storage:** Supabase (PostgreSQL)
- **AI Engine:** Google Gemini API

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Supabase Account & Project
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CramZero.git
cd CramZero
```

### 2. Frontend Setup (React)
```bash
cd frontend
npm install
# Create a .env file with VITE_API_URL and Supabase public keys
npm run dev
```

### 3. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Mac/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

pip install -r requirements.txt
# Create a .env file with your GEMINI_API_KEY and Supabase service role keys
uvicorn main:app --reload
```

## 📁 Architecture Flow
1. **Upload:** User drops a PDF into the React UI; a unique Deck UUID is generated.
2. **Store & Parse:** The file is sent to FastAPI, temporarily saved in Supabase Storage, and parsed for text.
3. **AI Generation:** FastAPI passes the text to the Gemini API requesting a strict JSON format for flashcards and quizzes.
4. **Persistent Cache:** Generated study materials are saved permanently in Supabase PostgreSQL under the Deck UUID.
5. **Local Memory:** The Deck UUID is saved to the user's browser `localStorage` for automatic retrieval on future visits, and a shareable permalink is generated.
6. **Smart Cleanup:** Database cron jobs automatically wipe the heavy raw PDF/PPT files from storage after 24 hours, while keeping the lightweight JSON study data intact.

---
*Designed and developed to push the boundaries of accessible ed-tech.*
