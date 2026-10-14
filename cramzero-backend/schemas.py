from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ... (keep all your existing schemas) ...

class GenerateRequest(BaseModel):
    topic: str

# --- CARD SCHEMAS ---
class CardBase(BaseModel):
    term: str
    definition: str

class CardCreate(CardBase):
    pass

class CardResponse(CardBase):
    id: int
    deck_id: int

    class Config:
        from_attributes = True

# --- DECK SCHEMAS ---
class DeckBase(BaseModel):
    title: str
    description: Optional[str] = None
    visibility: str = "Private"
    user_id: Optional[str] = None
    author_name: Optional[str] = "Student"

class DeckCreate(DeckBase):
    # A new deck will include a list of cards to create simultaneously
    cards: List[CardCreate] = []

class DeckResponse(DeckBase):
    id: int
    created_at: datetime
    cards: List[CardResponse] = []

    class Config:
        from_attributes = True

# --- USER / AUTH SCHEMAS ---
class UserRegister(BaseModel):
    email: str
    password: str
    display_name: str = "Student"
    avatar_url: Optional[str] = None
    guest_user_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str
    guest_user_id: Optional[str] = None

class GuestUserCreate(BaseModel):
    display_name: str = "Student"
    avatar_url: Optional[str] = None
    user_id: Optional[str] = None

class UserProfileUpdate(BaseModel):
    user_id: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    display_name: str
    avatar_url: Optional[str] = None
    is_guest: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DeckVisibilityUpdate(BaseModel):
    user_id: str
    visibility: str

class DeckCloneRequest(BaseModel):
    user_id: str
    display_name: Optional[str] = None

class GenerateRequest(BaseModel):
    topic: str
    card_count: int = 10
    user_id: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: str
    user_id: Optional[str] = None


class StudyHubCreate(BaseModel):
    name: str
    description: Optional[str] = None
    owner_id: str
    owner_name: str = "Student"
    allow_member_uploads: bool = True
    initial_deck_id: Optional[int] = None


class StudyHubJoin(BaseModel):
    invite_code: str
    user_id: str
    display_name: str = "Student"


class StudyHubDeckShare(BaseModel):
    deck_id: int
    user_id: str


class StudyHubMemberRoleUpdate(BaseModel):
    actor_id: str
    role: str


class StudyHubMemberAction(BaseModel):
    actor_id: str


class StudyHubPermissionUpdate(BaseModel):
    user_id: str
    allow_member_uploads: bool