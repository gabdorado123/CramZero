import os
import json
import re
import secrets
import time
import tempfile
from io import BytesIO
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from google import genai
from google.genai import types
from groq import Groq
from dotenv import load_dotenv

import models, schemas
from database import engine, get_db
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

load_dotenv()

# --- INITIALIZE BOTH AI ENGINES ---
try:
    ai_client = genai.Client()
except Exception as e:
    print(f"Warning: Gemini Client failed to initialize. {e}")
    ai_client = None

try:
    groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
except Exception as e:
    print(f"Warning: Groq Client failed to initialize. {e}")
    groq_client = None

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CramZero API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cram-zero.vercel.app/"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "CramZero Hybrid Engines online"}

@app.get("/api/decks/", response_model=list[schemas.DeckResponse])
def get_decks(db: Session = Depends(get_db)):
    return db.query(models.Deck).all()

@app.post("/api/decks/", response_model=schemas.DeckResponse)
def create_deck(deck: schemas.DeckCreate, db: Session = Depends(get_db)):
    db_deck = models.Deck(title=deck.title, description=deck.description, visibility=deck.visibility)
    db.add(db_deck)
    db.commit()
    db.refresh(db_deck)

    for card_data in deck.cards:
        db_card = models.Card(deck_id=db_deck.id, term=card_data.term, definition=card_data.definition)
        db.add(db_card)
    
    db.commit()
    db.refresh(db_deck)
    return db_deck


def _deck_payload(deck):
    return {
        "id": deck.id,
        "title": deck.title,
        "description": deck.description,
        "visibility": deck.visibility,
        "created_at": deck.created_at,
        "cards": [
            {"id": card.id, "deck_id": card.deck_id, "term": card.term, "definition": card.definition}
            for card in deck.cards
        ],
    }


def _hub_payload(hub, user_id):
    membership = next((member for member in hub.members if member.user_id == user_id), None)
    return {
        "id": hub.id,
        "name": hub.name,
        "description": hub.description,
        "inviteCode": hub.invite_code,
        "ownerId": hub.owner_id,
        "role": membership.role if membership else "Member",
        "members": len(hub.members),
        "decks": len(hub.shared_decks),
        "allowMemberUploads": hub.allow_member_uploads,
        "memberList": [
            {
                "id": member.id,
                "userId": member.user_id,
                "displayName": member.display_name,
                "role": member.role,
                "joinedAt": member.created_at,
            }
            for member in hub.members
        ],
        "sharedDecks": [_deck_payload(shared_deck.deck) for shared_deck in hub.shared_decks],
        "createdAt": hub.created_at,
    }


def _require_hub_member(hub, user_id):
    membership = next((member for member in hub.members if member.user_id == user_id), None)
    if not membership:
        raise HTTPException(status_code=403, detail="Join this hub before accessing it.")
    return membership


def _require_hub_admin(hub, user_id):
    membership = _require_hub_member(hub, user_id)
    if membership.role != "Admin":
        raise HTTPException(status_code=403, detail="Only hub admins can manage members.")
    return membership


@app.get("/api/study-hubs")
def get_study_hubs(user_id: str, db: Session = Depends(get_db)):
    hubs = (
        db.query(models.StudyHub)
        .join(models.StudyHubMember)
        .filter(models.StudyHubMember.user_id == user_id)
        .order_by(models.StudyHub.created_at.desc())
        .all()
    )
    return [_hub_payload(hub, user_id) for hub in hubs]


@app.post("/api/study-hubs")
def create_study_hub(request: schemas.StudyHubCreate, db: Session = Depends(get_db)):
    invite_code = secrets.token_hex(4).upper()
    while db.query(models.StudyHub).filter(models.StudyHub.invite_code == invite_code).first():
        invite_code = secrets.token_hex(4).upper()

    hub = models.StudyHub(
        name=request.name.strip(),
        description=(request.description or "No description provided.").strip(),
        invite_code=invite_code,
        owner_id=request.owner_id,
        owner_name=request.owner_name.strip() or "Student",
        allow_member_uploads=request.allow_member_uploads,
    )
    db.add(hub)
    db.flush()
    db.add(models.StudyHubMember(hub_id=hub.id, user_id=request.owner_id, display_name=hub.owner_name, role="Admin"))

    if request.initial_deck_id:
        deck = db.query(models.Deck).filter(models.Deck.id == request.initial_deck_id).first()
        if not deck:
            raise HTTPException(status_code=404, detail="Initial deck not found.")
        db.add(models.StudyHubDeck(hub_id=hub.id, deck_id=deck.id, shared_by=request.owner_id))

    db.commit()
    db.refresh(hub)
    return _hub_payload(hub, request.owner_id)


@app.get("/api/study-hubs/{hub_id}")
def get_study_hub(hub_id: int, user_id: str, db: Session = Depends(get_db)):
    hub = db.query(models.StudyHub).filter(models.StudyHub.id == hub_id).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Study hub not found.")
    _require_hub_member(hub, user_id)
    return _hub_payload(hub, user_id)


@app.post("/api/study-hubs/join")
def join_study_hub(request: schemas.StudyHubJoin, db: Session = Depends(get_db)):
    hub = db.query(models.StudyHub).filter(models.StudyHub.invite_code == request.invite_code.strip().upper()).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Study hub not found.")

    membership = next((member for member in hub.members if member.user_id == request.user_id), None)
    if not membership:
        db.add(models.StudyHubMember(hub_id=hub.id, user_id=request.user_id, display_name=request.display_name.strip() or "Student", role="Member"))
        db.commit()
        db.refresh(hub)
    return _hub_payload(hub, request.user_id)


@app.post("/api/study-hubs/{hub_id}/decks")
def share_study_hub_deck(hub_id: int, request: schemas.StudyHubDeckShare, db: Session = Depends(get_db)):
    hub = db.query(models.StudyHub).filter(models.StudyHub.id == hub_id).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Study hub not found.")
    membership = _require_hub_member(hub, request.user_id)
    if membership.role != "Admin" and not hub.allow_member_uploads:
        raise HTTPException(status_code=403, detail="Only the hub admin can share decks.")

    deck = db.query(models.Deck).filter(models.Deck.id == request.deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found.")
    already_shared = next((shared for shared in hub.shared_decks if shared.deck_id == deck.id), None)
    if not already_shared:
        db.add(models.StudyHubDeck(hub_id=hub.id, deck_id=deck.id, shared_by=request.user_id))
        db.commit()
        db.refresh(hub)
    return _hub_payload(hub, request.user_id)


@app.patch("/api/study-hubs/{hub_id}/settings")
def update_study_hub_settings(hub_id: int, request: schemas.StudyHubPermissionUpdate, db: Session = Depends(get_db)):
    hub = db.query(models.StudyHub).filter(models.StudyHub.id == hub_id).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Study hub not found.")
    _require_hub_admin(hub, request.user_id)
    hub.allow_member_uploads = request.allow_member_uploads
    db.commit()
    db.refresh(hub)
    return _hub_payload(hub, request.user_id)


@app.get("/api/study-hubs/{hub_id}/members")
def get_study_hub_members(hub_id: int, user_id: str, db: Session = Depends(get_db)):
    hub = db.query(models.StudyHub).filter(models.StudyHub.id == hub_id).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Study hub not found.")
    _require_hub_member(hub, user_id)
    return _hub_payload(hub, user_id)["memberList"]


@app.post("/api/study-hubs/{hub_id}/members/{member_id}/remove")
def remove_study_hub_member(hub_id: int, member_id: int, request: schemas.StudyHubMemberAction, db: Session = Depends(get_db)):
    hub = db.query(models.StudyHub).filter(models.StudyHub.id == hub_id).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Study hub not found.")
    _require_hub_admin(hub, request.actor_id)
    member = next((item for item in hub.members if item.id == member_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")
    if member.user_id == hub.owner_id:
        raise HTTPException(status_code=400, detail="The hub owner cannot be removed.")
    db.delete(member)
    db.commit()
    db.refresh(hub)
    return _hub_payload(hub, request.actor_id)


@app.patch("/api/study-hubs/{hub_id}/members/{member_id}/role")
def update_study_hub_member_role(hub_id: int, member_id: int, request: schemas.StudyHubMemberRoleUpdate, db: Session = Depends(get_db)):
    hub = db.query(models.StudyHub).filter(models.StudyHub.id == hub_id).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Study hub not found.")
    if request.actor_id != hub.owner_id:
        raise HTTPException(status_code=403, detail="Only the hub owner can change member roles.")
    if request.role not in {"Admin", "Member"}:
        raise HTTPException(status_code=400, detail="Role must be Admin or Member.")
    member = next((item for item in hub.members if item.id == member_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")
    if member.user_id == hub.owner_id:
        raise HTTPException(status_code=400, detail="The hub owner role cannot be changed.")
    member.role = request.role
    db.commit()
    db.refresh(hub)
    return _hub_payload(hub, request.actor_id)


# --- HYBRID GENERATOR: GROQ (PRIMARY) -> GEMINI (FALLBACK) ---
@app.post("/api/generate-deck/", response_model=schemas.DeckCreate)
def generate_deck_with_ai(request: schemas.GenerateRequest):
    prompt = f"""
    You are an expert tutor. Generate a highly effective flashcard deck about: {request.topic}.
    Provide exactly {request.card_count} key terms and definitions.
    Respond ONLY with a valid JSON array of objects. Do not include markdown formatting blocks.
    Format exactly like this:
    [
        {{"term": "Concept", "definition": "Explanation"}}
    ]
    """
    
    raw_text = None

    # 1. Try Groq First (OpenAI GPT-OSS 120B)
    if groq_client:
        try:
            print("Attempting generation with Groq (OpenAI GPT-OSS 120B)...")
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="openai/gpt-oss-120b",
                temperature=0.3,
            )
            raw_text = chat_completion.choices[0].message.content
            print("Groq generation successful!")
        except Exception as e:
            print(f"Groq failed or rate-limited: {e}. Falling back to Gemini...")

    # 2. Fallback to Gemini if Groq fails or is not configured
    if not raw_text and ai_client:
        fallback_models = ['gemini-3.7-flash', 'gemini-2.0-flash']
        for model_name in fallback_models:
            try:
                print(f"Attempting generation with {model_name}...")
                response = ai_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.3)
                )
                raw_text = response.text
                print(f"Success using {model_name}!")
                break
            except Exception as e:
                print(f"Model {model_name} overloaded. Falling back...")
                continue

    if not raw_text:
         raise HTTPException(status_code=503, detail="All AI engines (Groq and Gemini) are currently unavailable.")
         
    try:
        raw_text = raw_text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        flashcards_data = json.loads(raw_text)
        
        return {
            "title": request.topic.title(),
            "description": f"Auto-generated deck covering {request.topic}.",
            "visibility": "Private",
            "cards": flashcards_data
        }
        
    except json.JSONDecodeError:
         raise HTTPException(status_code=500, detail="AI returned invalid JSON format.")


# --- FILE GENERATOR: GEMINI ONLY (Groq doesn't natively parse PDFs/PPTXs yet) ---
@app.post("/api/generate-deck-from-file/", response_model=schemas.DeckCreate)
async def generate_deck_from_file(file: UploadFile = File(...), card_count: int = Form(10)):
    if not ai_client:
        raise HTTPException(status_code=500, detail="Gemini Client required for document parsing.")
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.pdf', '.txt', '.pptx']:
        raise HTTPException(status_code=400, detail="Unsupported file format.")
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name

    try:
        uploaded_gemini_file = ai_client.files.upload(file=temp_file_path)
        
        prompt = f"""
        You are an expert tutor. Extract the most important concepts from this uploaded document and generate a highly effective flashcard deck.
        Provide exactly {card_count} key terms and definitions based strictly on the document content.
        Respond ONLY with a valid JSON array of objects. Do not include markdown formatting blocks.
        Format exactly like this:
        [
            {{"term": "Concept", "definition": "Explanation"}}
        ]
        """
        
        response = None
        fallback_models = ['gemini-3.7-flash', 'gemini-2.0-flash']
        
        for model_name in fallback_models:
            try:
                print(f"Attempting file extraction with {model_name}...")
                response = ai_client.models.generate_content(
                    model=model_name,
                    contents=[uploaded_gemini_file, prompt],
                    config=types.GenerateContentConfig(temperature=0.3)
                )
                print(f"Success using {model_name}!")
                break
            except Exception as e:
                print(f"Model {model_name} overloaded. Falling back...")
                continue

        try:
            ai_client.files.delete(name=uploaded_gemini_file.name)
        except:
            pass
            
        if not response:
             raise HTTPException(status_code=503, detail="Gemini models are currently at maximum capacity.")
             
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        flashcards_data = json.loads(raw_text)
        clean_title = file.filename.replace(ext, "").replace("-", " ").replace("_", " ").title()
        
        return {
            "title": clean_title,
            "description": f"Extracted from document: {file.filename}",
            "visibility": "Private",
            "cards": flashcards_data
        }
        
    except json.JSONDecodeError:
         raise HTTPException(status_code=500, detail="AI returned invalid JSON format.")
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/api/decks/{deck_id}/readout")
def generate_deck_readout(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found.")
    if not deck.cards:
        raise HTTPException(status_code=400, detail="Add cards to this deck before generating a readout.")
    if not groq_client and not ai_client:
        raise HTTPException(status_code=503, detail="AI services are currently unavailable.")

    card_context = "\n".join(
        f"- {card.term}: {card.definition}" for card in deck.cards[:200]
    )
    prompt = f"""
    You are Zero, an expert study-material author. Create a clear reading guide from the flashcards below.
    The guide must teach the material, connect related concepts, and help a student prepare for an assessment.
    Do not invent facts that are not supported by the cards.

    Return ONLY valid JSON with this exact shape:
    {{
      "title": "A concise title",
      "overview": "A two or three sentence overview",
      "sections": [
        {{"heading": "Concept group", "body": "A concise explanation with examples where supported by the cards."}}
      ],
      "key_takeaways": ["Short takeaway", "Short takeaway"]
    }}
    Create 3 to 6 sections and 4 to 8 key takeaways.

    Deck title: {deck.title}
    Deck description: {deck.description or "No description provided."}
    Flashcards:
    {card_context}
    """

    raw_text = None
    if groq_client:
        try:
            
            response = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="openai/gpt-oss-120b",
                temperature=0.3,
            )
            raw_text = response.choices[0].message.content
        except Exception as error:
            print(f"Groq readout generation failed: {error}. Falling back to Gemini...")

    if not raw_text and ai_client:
        for model_name in ['gemini-3.7-flash', 'gemini-2.0-flash']:
            try:
                response = ai_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.3),
                )
                raw_text = response.text
                break
            except Exception as error:
                print(f"{model_name} readout generation failed: {error}")

    if not raw_text:
        raise HTTPException(status_code=503, detail="AI services are currently unavailable.")

    try:
        clean_text = raw_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:-3].strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:-3].strip()
        readout = json.loads(clean_text)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=502, detail="AI returned an invalid reading guide.")

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReadoutTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=30,
        textColor=HexColor("#211C18"),
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    subtitle_style = ParagraphStyle(
        "ReadoutSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=HexColor("#997E67"),
        alignment=TA_CENTER,
        spaceAfter=24,
    )
    heading_style = ParagraphStyle(
        "ReadoutHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=HexColor("#664930"),
        spaceBefore=16,
        spaceAfter=7,
    )
    body_style = ParagraphStyle(
        "ReadoutBody",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=16,
        textColor=HexColor("#3F342D"),
        spaceAfter=9,
    )
    takeaway_style = ParagraphStyle(
        "ReadoutTakeaway",
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
    )

    def safe_paragraph(value):
        from xml.sax.saxutils import escape
        replacements = str.maketrans({
            "\u2010": "-",
            "\u2011": "-",
            "\u2012": "-",
            "\u2013": "-",
            "\u2014": "-",
            "\u2018": "'",
            "\u2019": "'",
            "\u201c": '"',
            "\u201d": '"',
            "\u2026": "...",
            "\u2022": "-",
            "\u00a0": " ",
        })
        normalized = str(value or "").translate(replacements)
        normalized = normalized.encode("latin-1", "replace").decode("latin-1")
        return escape(normalized).replace("\n", "<br/>")

    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.7 * inch,
        leftMargin=0.7 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title=f"{deck.title} Reading Guide",
        author="CramZero Zero AI",
    )
    story = [
        Paragraph(safe_paragraph(readout.get("title") or f"{deck.title} Reading Guide"), title_style),
        Paragraph("Generated by Zero AI from your CramZero deck", subtitle_style),
        Paragraph("Overview", heading_style),
        Paragraph(safe_paragraph(readout.get("overview")), body_style),
    ]
    for section in readout.get("sections", []):
        story.extend([
            Paragraph(safe_paragraph(section.get("heading")), heading_style),
            Paragraph(safe_paragraph(section.get("body")), body_style),
        ])
    story.append(Paragraph("Key Takeaways", heading_style))
    for takeaway in readout.get("key_takeaways", []):
        story.append(Paragraph(f"- {safe_paragraph(takeaway)}", takeaway_style))

    document.build(story, onFirstPage=lambda canvas, doc: None, onLaterPages=lambda canvas, doc: None)
    buffer.seek(0)
    filename = re.sub(r"[^A-Za-z0-9]+", "-", deck.title).strip("-").lower() or "cramzero-readout"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}-reading-guide.pdf"'},
    )

@app.post("/api/chat/")
def ai_tutor_chat(request: schemas.ChatRequest):
    prompt = f"""
    You are Zero, an expert, encouraging, and highly organized AI tutor for the CramZero study app.
    You have full access to the user's current flashcard deck context below.
    
    CRITICAL FORMATTING RULES:
    1. ALWAYS structure your responses using Markdown.
    2. Break down explanations into scannable bullet points or numbered lists.
    3. Use bold text to emphasize key terms.
    4. Use ### headers to separate different ideas or steps.
    5. Never send a giant wall of plain text. Keep it visually digestible.

    --- DECK CONTEXT ---
    {request.context}
    --- END CONTEXT ---

    User's message: {request.message}
    """
    reply_text = None
    
    if groq_client:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="openai/gpt-oss-120b",
                temperature=0.4,
            )
            reply_text = chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq chat failed: {e}. Falling back to Gemini...")
            
    # 2. Fallback to Gemini Matrix
    if not reply_text and ai_client:
        fallback_models = ['gemini-3.7-flash', 'gemini-2.0-flash']
        for model_name in fallback_models:
            try:
                response = ai_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.4)
                )
                reply_text = response.text
                break
            except Exception:
                continue
                
    if not reply_text:
        raise HTTPException(status_code=503, detail="Professor AI is currently unavailable.")
        
    return {"reply": reply_text}
