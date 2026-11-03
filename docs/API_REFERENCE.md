# 📡 CramZero REST & WebSocket API Reference

The backend API is implemented with **FastAPI**. It includes CORS support for production deployments, OpenAPI interactive documentation at `/docs`, and JSON schema validation powered by Pydantic.

Protected endpoints require `Authorization: Bearer <access_token>`. The token is returned by the authentication endpoints and must not be replaced with a caller-supplied user ID for authorization.

---

## Base URLs
- **Local Development:** `http://localhost:8000`
- **Production Default:** `https://cramzero-backend.onrender.com`
- **Swagger Documentation:** `/docs`
- **OpenAPI JSON Spec:** `/openapi.json`

---

## 1. System & Rate Limit Endpoints

### `GET /api/health`
Checks server status and backend readiness.
- **Response:**
  ```json
  { "status": "ok", "app": "CramZero API" }
  ```

### `GET /api/rate-limits/`
Returns current usage counts and maximum daily allowances for the client.

### XP and leaderboard endpoints

| `POST` | `/api/users/{user_id}/quiz-xp` | Idempotently award quiz XP using an `event_id` |
| `GET` | `/api/leaderboards?scope=global` | Return the global XP leaderboard |
| `GET` | `/api/leaderboards?scope=university&university=...` | Return a university XP leaderboard |
| `GET` | `/api/users/{user_id}/collectibles` | Return XP total and unlocked collectible tiers |
| `GET` | `/api/quiz-usage-policy?user_id=...` | Return ranked daily quiz usage rewards |
- **Query Parameters:**
  - `user_id` *(optional, string)*
- **Response:**
  ```json
  {
    "identifier": "student-12345",
    "date": "2026-10-21",
    "usage": {
      "deck_generation": { "used": 4, "limit": 25, "remaining": 21 },
      "readout": { "used": 1, "limit": 30, "remaining": 29 },
      "chat": { "used": 12, "limit": 60, "remaining": 48 }
    }
  }
  ```

---

## 2. Authentication & Identity Endpoints

### `POST /api/auth/register`
Creates a cross-device cloud account using email and password. Automatically migrates existing guest decks and hubs if `guest_user_id` is supplied.
- **Request Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "securepassword123",
    "display_name": "Alex Cruz",
    "avatar_url": "https://api.dicebear.com/7.x/notionists/svg?seed=Chloe",
    "guest_user_id": "student-uuid-987"
  }
  ```
- **Response `(200 OK)`:**
  ```json
  {
    "id": "usr_9f41b2c8a0",
    "email": "student@university.edu",
    "display_name": "Alex Cruz",
    "avatar_url": "https://api.dicebear.com/7.x/notionists/svg?seed=Chloe",
    "is_guest": false,
    "access_token": "..."
  }
  ```

### `POST /api/auth/login`
Authenticates an existing user and migrates temporary guest decks if provided.
- **Request Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "securepassword123",
    "guest_user_id": "student-uuid-987"
  }
  ```
- **Response `(200 OK)`:** User response object.

### `POST /api/auth/guest`
Initializes a lightweight student identity for local-first guest usage without passwords.
- **Request Body:**
  ```json
  {
    "display_name": "Guest Scholar",
    "avatar_url": "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
    "user_id": "student-uuid-987"
  }
  ```
- **Response `(200 OK)`:**
  ```json
  {
    "id": "student-uuid-987",
    "email": null,
    "display_name": "Guest Scholar",
    "avatar_url": "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
    "is_guest": true,
    "access_token": "..."
  }
  ```

### `PUT /api/auth/profile`
Updates profile information, display names, avatar URLs, education details, visibility, or upgrades guest accounts to email/password authentication. University names are canonicalized when recognized; fresh names from the live university selector are preserved even if the backend catalog cache has not refreshed yet.
- **Request Body:**
  ```json
  {
    "user_id": "usr_9f41b2c8a0",
    "display_name": "Alex Cruz",
    "avatar_url": "https://api.dicebear.com/7.x/notionists/svg?seed=Elena",
    "email": "new.email@university.edu",
    "password": "optionalNewPassword",
    "bio": "Computer science learner",
    "profile_visibility": "Public",
    "education_level": "Undergraduate",
    "university": "University of the Philippines Diliman"
  }
  ```

### `GET /api/auth/me`
Returns the current user profile used by the frontend to rehydrate account and education state after startup.
- **Query Parameters:** `user_id` *(required, string)*
- **Authentication:** Existing users must provide the bearer token issued for that user. A token is returned when a new local guest identity is initialized.
- **Response:** `schemas.UserResponse`, including `bio`, `profile_visibility`, `education_level`, and `university`.

---

## 3. Social Profiles & University Communities

### `GET /api/users/search`
Searches public learner profiles by display name.
- **Query Parameters:**
  - `query` *(required, string)* - Search text.
  - `viewer_id` *(optional, string)* - Adds follow state for the requesting learner.
  - `limit` *(optional, integer)* - Capped by the server at 50.
- **Response:** Profile objects with follower counts, following counts, education details, follow state, and visible public decks.

### `GET /api/users/{user_id}/profile`
Returns a public learner profile and its public decks. Private profiles can only be read by the profile owner.
- **Query Parameters:** `viewer_id` *(optional, string)*

### `POST /api/users/{user_id}/follow`
Follows a public learner.
- **Request Body:**
  ```json
  { "user_id": "usr_9f41b2c8a0" }
  ```
- **Response:** Updated profile object.

### `DELETE /api/users/{user_id}/follow`
Removes the requesting learner's follow relationship.
- **Request Body:** Same as the follow endpoint.
- **Response:** Updated profile object.

### `GET /api/users/{user_id}/followers`
Lists public profiles following the specified learner.
- **Query Parameters:** `viewer_id` *(optional, string)*

### `GET /api/users/{user_id}/following`
Lists public profiles followed by the specified learner.
- **Query Parameters:** `viewer_id` *(optional, string)*

### `GET /api/notifications`
Returns the latest 50 notifications for a user, including actor profile data and read state.
- **Query Parameters:** `user_id` *(required, string)*

### `PATCH /api/notifications/{notification_id}/read`
Marks one notification as read.
- **Query Parameters:** `user_id` *(required, string)*

### `GET /api/universities`
Searches Philippine university communities and returns only institutions with at least one public learner profile using that university. The separate `/api/universities/catalog` endpoint remains the full catalog for profile and onboarding selection.
- **Query Parameters:**
  - `query` *(optional, string)* - Matches institution name, short name, or city.
  - `limit` *(optional, integer)* - Capped by the server at 500.
- **Response:** Catalog entries with `name`, `short_name`, `city`, `logo_url`, and `member_count`.

### `GET /api/universities/catalog`
Returns the live university catalog used by the education selector. The frontend displays institution logos and city details and does not use a manually curated local fallback list.

### `GET /api/universities/{university_name}`
Returns a university community page.
- **Query Parameters:** `viewer_id` *(optional, string)*
- **Response:**
  ```json
  {
    "name": "University of the Philippines Diliman",
    "city": "Quezon City",
    "short_name": "UP Diliman",
    "logo_url": "https://...",
    "member_count": 42,
    "deck_count": 18,
    "members": [],
    "decks": [],
    "leaderboard": [
      {
        "id": "usr_9f41b2c8a0",
        "display_name": "Alex Cruz",
        "public_decks": 4,
        "followers": 8,
        "score": 56
      }
    ]
  }
  ```

---

## 4. Flashcard Decks Endpoints

### `GET /api/decks/`
Retrieves flashcard decks. If `user_id` query param is provided, returns personal decks created by or assigned to that user.
- **Query Parameters:** `user_id` *(optional, string)*
- **Response:** Array of `schemas.DeckResponse`.

### `GET /api/decks/public`
Fetches community public decks with search query support.
- **Query Parameters:** `q` *(optional, string)* - Filter decks by title, topic, or description.
- **Response:**
  ```json
  [
    {
      "id": 12,
      "title": "Advanced Data Structures",
      "description": "Binary trees, graphs, and sorting complexity.",
      "visibility": "Public",
      "author_name": "CS_Guru99",
      "created_at": "2026-10-14T09:00:00Z",
      "cards": [
        { "id": 101, "deck_id": 12, "term": "AVL Tree", "definition": "Self-balancing binary search tree." }
      ]
    }
  ]
  ```

### `GET /api/decks/{deck_id}`
Retrieves a single deck by its numeric ID with all associated cards.

### `POST /api/decks/`
Creates a new deck manually or saves an imported deck.
- **Request Body:**
  ```json
  {
    "title": "Cell Biology",
    "description": "Organelles and metabolic pathways",
    "visibility": "Private",
    "user_id": "usr_9f41b2c8a0",
    "author_name": "Alex Cruz",
    "cards": [
      { "term": "Mitochondria", "definition": "The powerhouse of the cell." }
    ]
  }
  ```

### `PATCH /api/decks/{deck_id}/visibility`
Toggles deck visibility between `Private` and `Public`.
- **Request Body:**
  ```json
  { "user_id": "usr_9f41b2c8a0", "visibility": "Public" }
  ```

### `POST /api/decks/{deck_id}/clone`
Clones a public deck into the authenticated user's private library.
- **Request Body:**
  ```json
  { "user_id": "usr_9f41b2c8a0", "display_name": "Alex Cruz" }
  ```

---

## 5. AI Generation & Document Parsing

### `POST /api/generate-deck/`
Generates a flashcard deck from a natural language topic or study prompt using dual AI engine failover (Groq first, Gemini fallback).
- **Request Body:**
  ```json
  {
    "topic": "Cardiovascular Pharmacology: ACE Inhibitors & Beta Blockers",
    "card_count": 10,
    "user_id": "usr_9f41b2c8a0"
  }
  ```
- **Response `(200 OK)`:** `schemas.DeckCreate` with structured flashcards.

### `POST /api/generate-deck-from-file/`
Uploads a `.pdf`, `.pptx`, or `.txt` document to generate a deck. If Gemini file upload or generation fails, seamlessly extracts text via Python (`pypdf`, `python-pptx`) and synthesizes through Groq.
- **Form Data Parameters:**
  - `file`: Multipart file upload (.pdf, .pptx, .txt)
  - `card_count`: Integer from 1 to 50 (e.g. 10)
  - `user_id`: String matching the authenticated user
- **Limits:** Uploads are capped at 20 MB.
- **Response `(200 OK)`:** `schemas.DeckCreate`

### `POST /api/decks/{deck_id}/readout`
Generates an audio lecture summary transcript for listening and study readouts.
- **Request Body:** Optional `{ "user_id": "..." }`
- **Response:**
  ```json
  {
    "deck_id": 12,
    "summary": "Welcome to your study readout for Cell Biology...",
    "bullets": ["Key concept 1", "Key concept 2"]
  }
  ```

### `POST /api/chat/`
Conversational AI Tutor answering questions based on the deck's context.
- **Request Body:**
  ```json
  {
    "message": "Can you explain why the mitochondria has a double membrane?",
    "context": "Deck Title: Cell Biology. Cards: Mitochondria - Powerhouse of the cell...",
    "user_id": "usr_9f41b2c8a0"
  }
  ```
- **Response:**
  ```json
  { "response": "The double membrane of the mitochondria is a result of..." }
  ```

---

## 6. Study Hubs (Classroom Collaboration)

### `GET /api/study-hubs`
Returns all study hubs the user has created or joined.
- **Query Parameters:** `user_id` *(required)*

### `POST /api/study-hubs`
Creates a study hub with an automatically generated 6-digit alphanumeric invite code.
- **Request Body:**
  ```json
  {
    "name": "BSIT 3A Core Subjects",
    "description": "Shared resources and flashcards for third year IT.",
    "owner_id": "usr_9f41b2c8a0",
    "owner_name": "Alex Cruz",
    "allow_member_uploads": true,
    "initial_deck_id": 12
  }
  ```

### `GET /api/study-hubs/{hub_id}`
Returns hub metadata, member roster, and shared decks.

### `POST /api/study-hubs/join`
Joins an existing study hub using its invite code.
- **Request Body:**
  ```json
  {
    "invite_code": "BSIT26",
    "user_id": "usr_9f41b2c8a0",
    "display_name": "Alex Cruz"
  }
  ```

### `POST /api/study-hubs/{hub_id}/decks`
Shares an existing deck into the study hub.
- **Request Body:**
  ```json
  { "deck_id": 12, "user_id": "usr_9f41b2c8a0" }
  ```

### `PATCH /api/study-hubs/{hub_id}/settings`
Updates hub permissions (e.g. toggle whether members can share decks). Requires owner permissions.

---

## 7. WebSocket Multiplayer Protocol

Multiplayer real-time matches connect to either `ws://localhost:8000/ws/multiplayer` (FastAPI) or `ws://localhost:8787` (Node.js server).

### Client-to-Server Messages

1. **Create Room (Host):**
   ```json
   {
     "type": "create_room",
     "playerName": "Alex Cruz",
     "deck": { "id": 12, "title": "Pharmacology", "cards": [...] }
   }
   ```

2. **Join Room (Player):**
   ```json
   {
     "type": "join_room",
     "pin": "482910",
     "playerName": "Jordan Lee"
   }
   ```

3. **Start Game (Host only):**
   ```json
   { "type": "start_game" }
   ```

4. **Submit Answer:**
   ```json
   {
     "type": "submit_answer",
     "answer": "Beta Blocker",
     "timeRemaining": 11.4
   }
   ```

### Server-to-Client Messages

1. **Room State Broadcast:**
   ```json
   {
     "type": "room_state",
     "room": {
       "pin": "482910",
       "phase": "playing",
       "hostId": "host-uuid",
       "questionIndex": 2,
       "questionStartedAt": 1729548392000,
       "questionSeconds": 15,
       "serverTime": 1729548392100,
       "players": [
         { "id": "p1", "name": "Alex Cruz", "score": 240, "streak": 2 }
       ]
     }
   }
   ```
