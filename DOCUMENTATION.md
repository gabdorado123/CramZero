# <img src="assets/cramzero-logo.svg" alt="CramZero Logo" width="36" height="36" valign="middle" /> CramZero Master Documentation

Welcome to the comprehensive technical documentation for **CramZero**, a high-performance, frictionless AI micro-learning and collaborative study platform.

---

## 📑 Table of Contents

1. [Platform Vision & Core Philosophy](#1-platform-vision--core-philosophy)
2. [Feature Directory & Views](#2-feature-directory--views)
3. [Architecture & System Design](#3-architecture--system-design)
4. [Dual AI Engine & Failover Pipeline](#4-dual-ai-engine--failover-pipeline)
5. [Document Text Extraction Pipeline](#5-document-text-extraction-pipeline)
6. [Identity & Authentication Architecture](#6-identity--authentication-architecture)
7. [Study Hubs & Collaborative Ecosystem](#7-study-hubs--collaborative-ecosystem)
8. [Social Profiles & University Communities](#8-social-profiles--university-communities)
9. [Motivation, Mastery & UI System](#9-motivation-mastery--ui-system)
10. [Real-Time Multiplayer Battle Arena](#10-real-time-multiplayer-battle-arena)
11. [Audio Synthesis & AI Tutor](#11-audio-synthesis--ai-tutor)
12. [REST & WebSocket API Summary](#12-rest--websocket-api-summary)
13. [Data Models & Persistence](#13-data-models--persistence)
14. [Local Setup & Development Guide](#14-local-setup--development-guide)
15. [Deployment Guide](#15-deployment-guide)

---

## 1. Platform Vision & Core Philosophy

Traditional educational technology platforms often burden students with strict sign-up walls, paywalled exports, slow multi-step onboarding, and unreliable AI rate limits.

**CramZero was engineered around three founding principles:**
- **Zero Friction Entry:** Students can land on the website, pick an avatar, generate flashcards, and immediately start studying without needing an account.
- **Cross-Device Freedom:** Students who want persistence can easily upgrade to a cloud account (email & password) anytime to sync decks across phones, tablets, and laptops.
- **Fail-Safe AI Reliability:** By pairing **Groq** (ultra-fast inference) and **Google Gemini** (multimodal analysis) into a self-healing pipeline with concurrency guards, students never experience service disruptions due to 429 quota exhaustion.

---

## 2. Feature Directory & Views

| View Name | File Location | Key Purpose |
| :--- | :--- | :--- |
| **Landing Page** | `LandingPageView.jsx` | High-converting landing page with live AI synthesis demo, ecosystem preview, mode selector, and instant auth prompts. |
| **Home Dashboard** | `DashboardView.jsx` | Student overview showing daily cards reviewed, active streaks, recent decks, and one-click study actions. |
| **Study Hub** | `StudyView.jsx` | Launchpad for study sessions with adaptive viewport formatting across phones, tablets, and desktops. |
| **Deck Library** | `DecksView.jsx` | Personal decks repository alongside community public deck search, filtering, and one-click cloning. |
| **New Deck Creator** | `NewDeckView.jsx` | Multi-source deck builder: natural language prompts, document upload (`.pdf`, `.docx`, `.pptx`, `.txt`), or manual card entry. |
| **Deck Details** | `DeckDetailsView.jsx` | Full deck card list, audio readout player, contextual AI tutor chat, visibility toggling, and PDF export. |
| **Flashcard Mode** | `FlashcardModeView.jsx` | 3D flip flashcard review with Spaced Repetition confidence rating (Easy, Medium, Hard) and keyboard shortcuts. |
| **Interactive Quiz** | `QuizSetupView.jsx` | Multi-format assessments: Multiple Choice, True/False, Identification, and Matching pairs with instant feedback. |
| **Mock Exam** | `MockExamSetupView.jsx` / `MockExamActiveView.jsx` | Timed mock testing with custom question limits, question palette jumper, bookmark flagging, and score breakdown. |
| **Multiplayer Arena** | `MultiplayerView.jsx` | Live quiz battle room with synchronized timers, PIN-based lobbies, real-time scoreboards, and celebratory victory screen. |
| **Study Hubs** | `StudyHubsView.jsx` / `HubDetailsView.jsx` / `CreateHubView.jsx` | Classroom groups with 6-digit invite codes, shared deck feeds, member roster, and admin permissions. |
| **Student Profile** | `ProfileView.jsx` | Identity customizer (female & male preset avatars + custom URL), cloud account upgrade form, and session management. |
| **Community** | `SocialView.jsx` | Public learner search, follow/unfollow, profile deck browsing, university communities, and campus leaderboards. |
| **CodeSpace** | `CodeSpaceView.jsx` | Embedded scratchpad and code editor designed for computer science and technical learners. |
| **Analytics** | `AnalyticsView.jsx` | Visual retention curves, review consistency logs, and card maturity progression. |
| **Rewards** | `StudyRewardsPanel.jsx` | Local XP, learner levels, weekly challenge standings, and collectible milestone badges. |

---

## 3. Architecture & System Design

For full architectural diagrams, please see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

- **Client Tier:** React 19 single-page application built with Vite, styled using Tailwind CSS v4, and accelerated by native browser View Transitions.
- **API Tier:** FastAPI running asynchronous endpoints, concurrency semaphores, and automated database column migrations.
- **Persistence Tier:** SQLAlchemy ORM abstracting PostgreSQL (Neon / Render) for cloud deployment, with native SQLite fallback for zero-config local development.
- **Real-Time Tier:** Bidirectional WebSocket communication supporting live score propagation and synchronized countdown clocks.

---

## 4. Dual AI Engine & Failover Pipeline

```
Prompt Generation:      [Client Request] ──> [Groq 120B] ──Failover──> [Gemini 2.0 Flash] ──Failover──> [Gemini 1.5 Flash]
Document Generation:    [File Upload] ──> [Gemini Files API] ──Failover──> [Python Text Extraction] ──> [Groq Engine]
```

1. **Prompt Deck Generation:**
   - Groq (`openai/gpt-oss-120b`) handles rapid synthesis with lowest latency.
   - If Groq experiences rate limits or downtime, the request immediately cascades to Google Gemini (`gemini-2.0-flash` then `gemini-1.5-flash`).
   - Results are automatically cached in an in-memory LRU cache (`cache.py`) to prevent duplicate LLM calls across users.

2. **Concurrency Protection:**
   - Global `AI_CONCURRENCY_SEMAPHORE` (capacity: 3) prevents multiple concurrent heavy AI operations from overloading outbound connection pools.

---

## 5. Document Text Extraction Pipeline

When users upload study materials to `/api/generate-deck-from-file/`:
- **PDF Documents (`.pdf`):** Processed via Gemini Files API (primary) or `pypdf.PdfReader` (fallback) with page-by-page text stream aggregation.
- **Word Documents (`.docx`):** Extracted via `python-docx` — paragraphs and table cells (with merged-cell deduplication). Zipfile/XML fallback if python-docx fails.
- **PowerPoint Decks (`.pptx`):** Extracted via `python-pptx.Presentation`, iterating across all slides, shapes, text frames, and bullet paragraphs.
- **Plain Text (`.txt`):** Processed via Gemini Files API (primary) or decoded with automatic encoding detection (`utf-8`, `utf-8-sig`, `latin-1`, `cp1252`) (fallback).
- **Context Bounds:** Extracted document text is truncated safely to 25,000–30,000 characters to protect inference tokens and maintain sub-second response times.

---

## 6. Identity & Authentication Architecture

CramZero provides a hybrid authentication model:

1. **Guest Identity (Frictionless):**
   - Each browser instance receives a persistent `cramzero-user-id` UUID.
   - Users can choose a display name and select from a rich gallery of curated female and male avatars or paste a custom image URL.
   - Decks and hubs created in guest mode are saved locally and bound to the client UUID in the database.

2. **Cloud Account (Cross-Device Sync):**
   - Registered with an email and password.
   - Passwords are salt-hashed securely using SHA-256 before storage.
   - When a guest signs up or logs in, their existing local decks and hub memberships are automatically migrated to their cloud account.

---

## 7. Study Hubs & Collaborative Ecosystem

Study Hubs allow classes, cohorts, and study groups to share learning decks:
- **Invite Codes:** Unique 6-character codes (e.g. `BSIT26`) allow instant joining.
- **Role Permissions:**
  - `Admin`: Can modify hub settings, toggle member upload privileges, and remove members.
  - `Member`: Can view, clone, and share decks to the hub.
- **One-Click Cloning:** Members can clone any deck from the hub into their private collection for personalized review.

## 8. Social Profiles & University Communities

The Community area supports both learner-to-learner discovery and university-based study groups.

- **Public profile search:** Search by display name and open a profile when it is public.
- **Following:** Follow or unfollow public profiles; profiles expose follower and following counts.
- **Connection lists:** Profile pages show the current user's followers and following lists with quick access to Community.
- **Notifications:** New follows create persistent notifications that appear in the Inbox and can be marked read.
- **Public deck discovery:** A public profile can show its public decks for review or cloning.
- **Profile controls:** Users can edit their bio, avatar, education level, university, and profile visibility.
- **Education-aware onboarding:** Missing education data triggers setup for existing accounts. University selection is required only when the education level is `Undergraduate`.
- **Live Philippine universities:** The selector displays institution name, short name, city, and logo from an OpenAlex-backed catalog. If OpenAlex is unavailable, the backend falls back to the public Hipo university-domain dataset and retains the last successful response in memory. It has loading, retry, no-result, and stale-request protection states.
- **Provider-safe saving:** Profile saves normalize known aliases but preserve fresh live-provider university names when the frontend and backend catalog caches refresh at different times.
- **University community pages:** Each supported institution has public member and deck listings plus a leaderboard scored from public decks and followers.

## 9. Motivation, Mastery & UI System

- **Mastery checks:** Quiz sessions can eliminate incorrect options, show hints, reveal explanations, and repeat missed questions until the learner answers correctly.
- **Local progression:** Study events calculate XP, learner levels, review totals, correct-answer totals, active study days, and unlocked collectibles in the rewards panel.
- **Responsive Gizmo-inspired UI:** The application uses rounded cards, pill navigation, sky-blue active states, violet/blue reward gradients, elevated mobile navigation, responsive spacing, and explicit loading/error/empty/completion states.
- **Accessibility and device support:** Interactive controls retain visible focus states, touch-friendly sizing, and mobile/tablet/desktop layouts.

## 10. Real-Time Multiplayer Battle Arena

Multiplayer trivia matches allow up to dozens of players to compete in live study battles:
- **Synchronized Match Timers:** The server broadcasts epoch timestamps (`serverTime`), allowing clients to calibrate their local clocks and keep the 15-second answer countdown perfectly aligned across devices.
- **Dynamic Scoring:** Points are awarded based on speed and accuracy, with streak multipliers for consecutive correct answers.
- **Celebratory Winner UI:** At the end of the match, an animated podium highlights 1st, 2nd, and 3rd place winners with accuracy statistics.

---

## 11. Audio Synthesis & AI Tutor

- **ElevenLabs Flash v2.5:** Generates ultra-low latency, human-grade lecture voice readouts of any study deck.
- **Web Speech API Fallback:** Seamlessly activates browser-native speech synthesis if ElevenLabs API quotas are reached or when offline.
- **Interactive AI Tutor:** Allows students to converse with an AI grounded in the deck's specific concepts to clarify doubts, request analogies, or generate practice questions.

---

## 12. REST & WebSocket API Summary

For detailed schemas and example responses, see [docs/API_REFERENCE.md](docs/API_REFERENCE.md).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/rate-limits/` | Check remaining daily AI allowances |
| `POST` | `/api/auth/register` | Register new cloud account with deck migration |
| `POST` | `/api/auth/login` | Sign in with email and password |
| `POST` | `/api/auth/guest` | Initialize or update guest identity |
| `GET` | `/api/auth/me` | Rehydrate the current account profile |
| `PUT` | `/api/auth/profile` | Update profile details and avatars |
| `GET` | `/api/users/search` | Search public learner profiles |
| `GET` | `/api/users/{id}/profile` | Read a public learner profile and public decks |
| `POST` | `/api/users/{id}/follow` | Follow a public learner |
| `DELETE` | `/api/users/{id}/follow` | Unfollow a learner |
| `GET` | `/api/users/{id}/followers` | List a learner's followers |
| `GET` | `/api/users/{id}/following` | List learners a user follows |
| `GET` | `/api/notifications` | List notifications for a user |
| `PATCH` | `/api/notifications/{id}/read` | Mark a notification as read |
| `GET` | `/api/universities` | Search university communities and member counts |
| `GET` | `/api/universities/catalog` | Return the live university catalog used by selectors |
| `GET` | `/api/universities/{name}` | Read a university community, decks, members, and leaderboard |
| `GET` | `/api/decks/` | Fetch personal decks for a user |
| `GET` | `/api/decks/public` | Search and explore public community decks |
| `POST` | `/api/decks/` | Create a new deck |
| `PATCH`| `/api/decks/{id}/visibility`| Toggle Public / Private visibility |
| `POST` | `/api/decks/{id}/clone` | Clone a public deck to personal library |
| `POST` | `/api/generate-deck/` | AI generation from topic prompt |
| `POST` | `/api/generate-deck-from-file/` | AI generation from uploaded document (.pdf, .pptx, .txt) |
| `POST` | `/api/decks/{id}/readout` | Generate lecture summary and audio transcript |
| `POST` | `/api/chat/` | Ask questions to the context-aware AI tutor |
| `GET` | `/api/study-hubs` | List hubs for a user |
| `POST` | `/api/study-hubs` | Create a new study hub |
| `POST` | `/api/study-hubs/join` | Join a hub via invite code |
| `WS` | `/ws/multiplayer` | Realtime multiplayer quiz battle room |

---

## 13. Data Models & Persistence

Defined in `cramzero-backend/models.py`:
- `User`: Accounts and guest profiles.
- `UserFollow`: Unique follower/following relationships.
- `Notification`: Persistent social notifications, including follow events and read state.
- `Deck`: Study collections with visibility and authorship.
- `Card`: Terms and definitions belonging to a deck.
- `StudyHub`: Collaborative classrooms with 6-digit invite codes.
- `StudyHubMember`: Users enrolled in a hub with assigned roles.
- `StudyHubDeck`: Decks shared into a study hub.
- `ApiUsage`: Daily usage tracking for rate limiting.

---

## 14. Local Setup & Development Guide

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup
```bash
cd cramzero-backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd cramzero-frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`, proxying API requests to `http://localhost:8000`.

---

## 15. Deployment Guide

For end-to-end cloud production deployment (Vercel, Render, Neon PostgreSQL), see the dedicated [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
