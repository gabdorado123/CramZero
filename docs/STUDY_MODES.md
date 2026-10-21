# 🧠 CramZero Study Modes & Features Guide

CramZero provides a suite of cognitive science-backed study modes designed to move learners from passive memorization to active recall and competitive mastery.

---

## 1. 🎴 Spaced Repetition Flashcards

The flashcard engine helps users review and retain key definitions with tactile, low-friction interactions.

### Key Capabilities
- **3D Card Flip Animation:** Smooth perspective-based flip transition on click or keyboard press.
- **Confidence Rating System:** Rate your recall confidence:
  - 🟢 **Easy (Key `3`):** Card is mastered; interval increases.
  - 🟡 **Medium (Key `2`):** Needs periodic review.
  - 🔴 **Hard (Key `1`):** Retested frequently during the session.
- **Keyboard Shortcuts:**
  - `Space` or `Enter`: Flip card.
  - `Arrow Right` / `Arrow Left`: Next / previous card.
  - `1`, `2`, `3`: Record recall confidence rating.
  - `S`: Shuffle remaining deck.
- **Card Progression Bar:** Real-time visual progress counter.

---

## 2. 📝 Interactive Quizzes

Interactive quizzes dynamically format study deck terms into varying cognitive assessment questions:

- **Multiple Choice:** 4 AI-generated plausible distractors based on the deck's subject domain.
- **True / False:** Rapid binary verification testing conceptual precision.
- **Identification:** Free-text fill-in prompt testing active recall without cue bias.
- **Matching Pairs:** Drag-and-drop or select-to-pair exercise to reinforce relational understanding across terms.
- **Instant Explanations:** Explains *why* an answer is correct immediately upon selection.

---

## 3. ⏱️ Timed AI Mock Exams

Designed to simulate realistic testing conditions before midterm or licensure examinations.

### Features
- **Configurable Parameters:** Custom question count (5, 10, 15, 20+) and synchronized countdown timer.
- **Question Jumper Palette:** Visual status matrix on the side pane:
  - ⚪ Unvisited
  - 🔵 Answered
  - 🚩 Flagged for Review
- **Flagging Mechanism:** Allows students to bookmark uncertain questions and jump back before final submission.
- **Comprehensive Score Breakdown:** Displays final grade percentage, time spent, correct vs. incorrect answers, and detailed rationales for every item.

---

## 4. 🎙️ Audio Lecture Readouts & AI Tutor

Combines voice synthesis with conversational tutoring.

### Audio Readout
- Powered by **ElevenLabs Flash v2.5** for lifelike voice synthesis.
- Graceful client-side fallback to the browser's native **Web Speech API** when offline or unconfigured.
- Synthesizes long decks into structured lecture audio summaries with key takeaways and bullet-point recaps.
- Audio playback speed controls (0.75x, 1x, 1.25x, 1.5x) and scrubbable timeline.

### AI Tutor Chatbot
- Embedded persistent chat drawer grounded directly in the deck's context.
- Students can ask clarification questions (e.g., *"Can you provide an analogy for how this enzyme works?"* or *"Give me a mnemonic to remember these three cards"*).
- Backed by Groq and Google Gemini with automatic failover.

---

## 5. ⚔️ Real-Time Multiplayer Battle Arena

Turn study sessions into high-energy live competitions with classmates or study groups.

### Features
- **Synchronized Match Clocks:** Host and joiner countdown timers stay strictly in sync through server clock offset calibration.
- **PIN-Based Lobbies:** Create a room and share a 6-digit numeric PIN or copy the direct lobby URL (`?room=123456`).
- **Live Scoring & Streak Multipliers:** Players earn bonus points for consecutive correct answers submitted quickly.
- **Celebratory Battle Results UI:** Dynamic victory screen highlighting the winner, podium placements (1st, 2nd, 3rd), accuracy percentages, and match stats.

---

## 6. 👥 Collaborative Study Hubs

Classroom and study group spaces that centralize decks for an entire course or section.

### Features
- **6-Digit Invite Codes:** Share a simple alphanumeric code (e.g., `BSIT26`) to let classmates join in one click.
- **Role-Based Access Control:**
  - **Owner / Admin:** Can manage hub settings, remove members, and toggle whether regular members can upload decks.
  - **Member:** Can view and clone shared decks, and contribute new decks if permitted.
- **Deck Repository:** Central feed of all decks shared by hub members.
- **Instant One-Click Cloning:** Save any deck shared in the hub directly to your personal library.

---

## 7. 💻 CodeSpace & Analytics

- **CodeSpace:** A built-in code playground and syntax-highlighted scratchpad designed for computer science and technical learners.
- **Mastery Analytics:** Track your learning streak, view card retention curves, and monitor review consistency over days and weeks.

