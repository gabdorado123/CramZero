from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# This imports the Base variable from the database.py file
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    display_name = Column(String(120), nullable=False, default="Student")
    avatar_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    profile_visibility = Column(String(20), nullable=False, default="Public")
    education_level = Column(String(80), nullable=True)
    university = Column(String(180), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserFollow(Base):
    __tablename__ = "user_follows"
    __table_args__ = (UniqueConstraint("follower_id", "following_id", name="uq_user_follow"),)

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(String(64), nullable=False, index=True)
    following_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(String(64), nullable=False, index=True)
    actor_id = Column(String(64), nullable=False, index=True)
    type = Column(String(40), nullable=False, default="follow")
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class UserXP(Base):
    __tablename__ = "user_xp"

    user_id = Column(String(64), primary_key=True, index=True)
    total_xp = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class QuizXPEvent(Base):
    __tablename__ = "quiz_xp_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(120), unique=True, nullable=False, index=True)
    user_id = Column(String(64), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    source = Column(String(40), nullable=False, default="quiz")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    visibility = Column(String(50), default="Private")
    user_id = Column(String(64), nullable=True, index=True)
    author_name = Column(String(120), nullable=True, default="Student")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"))
    term = Column(Text)
    definition = Column(Text)

    deck = relationship("Deck", back_populates="cards")

class Hub(Base):
    __tablename__ = "hubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    invite_code = Column(String(6), unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StudyHub(Base):
    __tablename__ = "study_hubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    invite_code = Column(String(12), unique=True, nullable=False, index=True)
    owner_id = Column(String(64), nullable=False, index=True)
    owner_name = Column(String(120), nullable=False, default="Student")
    allow_member_uploads = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("StudyHubMember", back_populates="hub", cascade="all, delete-orphan")
    shared_decks = relationship("StudyHubDeck", back_populates="hub", cascade="all, delete-orphan")


class StudyHubMember(Base):
    __tablename__ = "study_hub_members"
    __table_args__ = (UniqueConstraint("hub_id", "user_id", name="uq_study_hub_member"),)

    id = Column(Integer, primary_key=True, index=True)
    hub_id = Column(Integer, ForeignKey("study_hubs.id"), nullable=False)
    user_id = Column(String(64), nullable=False, index=True)
    display_name = Column(String(120), nullable=False, default="Student")
    role = Column(String(20), nullable=False, default="Member")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hub = relationship("StudyHub", back_populates="members")


class StudyHubDeck(Base):
    __tablename__ = "study_hub_decks"
    __table_args__ = (UniqueConstraint("hub_id", "deck_id", name="uq_study_hub_deck"),)

    id = Column(Integer, primary_key=True, index=True)
    hub_id = Column(Integer, ForeignKey("study_hubs.id"), nullable=False)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=False)
    shared_by = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hub = relationship("StudyHub", back_populates="shared_decks")
    deck = relationship("Deck")


class ApiUsage(Base):
    __tablename__ = "api_usage"
    __table_args__ = (UniqueConstraint("identifier", "action", "date_str", name="uq_api_usage"),)

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String(128), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True)
    date_str = Column(String(10), nullable=False, index=True)
    count = Column(Integer, nullable=False, default=1)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())