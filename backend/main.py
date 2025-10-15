"""
FindYourPeace Backend API
FastAPI application for Quran-based emotional guidance
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import random
from pathlib import Path
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="FindYourPeace API",
    description="Quran-based emotional guidance system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production (or specify your Vercel domain)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset
DATASET_PATH = Path(__file__).parent / "dataset.json"
with open(DATASET_PATH, "r", encoding="utf-8") as f:
    DATASET = json.load(f)

# Pydantic Models
class Verse(BaseModel):
    ayah_text: str
    surah_name: str
    surah_number: int
    ayah_number: int
    source_url: str
    verified_at: str

class Condition(BaseModel):
    id: str
    label: str
    description: str
    tags: List[str]
    ui_theme: dict

class VerseResponse(BaseModel):
    feeling: str
    ayah: str
    reference: str
    surah_name: str
    surah_number: int
    ayah_number: int
    source_url: str
    ui_theme: dict
    timestamp: str

class VerseRequest(BaseModel):
    feeling_id: str
    user_id: Optional[str] = None
    exclude_verses: Optional[List[str]] = Field(default_factory=list)

class SystemPromptResponse(BaseModel):
    system_prompt: str
    version: str
    last_updated: str

# In-memory history tracking (in production, use Redis)
user_history = {}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "FindYourPeace API",
        "version": "1.0.0",
        "description": "Quran-based emotional guidance system",
        "endpoints": {
            "feelings": "/api/feelings",
            "verse": "/api/verse",
            "system_prompt": "/api/system-prompt",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "dataset_loaded": len(DATASET.get("conditions", [])),
        "total_verses": sum(len(c["verses"]) for c in DATASET.get("conditions", []))
    }

@app.get("/api/feelings", response_model=List[Condition])
async def get_feelings():
    """Get all available emotional states/feelings"""
    conditions = []
    for condition in DATASET.get("conditions", []):
        conditions.append({
            "id": condition["id"],
            "label": condition["label"],
            "description": condition["description"],
            "tags": condition["tags"],
            "ui_theme": condition["ui_theme"]
        })
    return conditions

@app.post("/api/verse", response_model=VerseResponse)
async def get_verse(request: VerseRequest):
    """
    Get a random verse for the selected feeling
    
    Implements smart randomization that avoids recently shown verses
    """
    feeling_id = request.feeling_id
    user_id = request.user_id or "anonymous"
    exclude_verses = request.exclude_verses or []
    
    # Find the condition
    condition = next(
        (c for c in DATASET["conditions"] if c["id"] == feeling_id),
        None
    )
    
    if not condition:
        raise HTTPException(
            status_code=404,
            detail=f"Feeling '{feeling_id}' not found. Please select another mood."
        )
    
    # Get verses for this condition
    verses = condition["verses"]
    
    if not verses:
        raise HTTPException(
            status_code=404,
            detail="No verses available for this condition yet. Please select another mood."
        )
    
    # Filter out recently shown verses (history-aware selection)
    user_key = f"{user_id}:{feeling_id}"
    recent_verses = user_history.get(user_key, [])
    
    # Combine exclusions
    all_exclusions = set(exclude_verses + recent_verses)
    
    # Filter available verses
    available_verses = [
        v for v in verses
        if f"{v['surah_number']}:{v['ayah_number']}" not in all_exclusions
    ]
    
    # If all verses have been shown, reset and use full pool
    if not available_verses:
        available_verses = verses
        user_history[user_key] = []
    
    # Randomly select a verse
    selected_verse = random.choice(available_verses)
    
    # Update history (keep last 3 verses)
    verse_ref = f"{selected_verse['surah_number']}:{selected_verse['ayah_number']}"
    if user_key not in user_history:
        user_history[user_key] = []
    user_history[user_key].append(verse_ref)
    user_history[user_key] = user_history[user_key][-3:]  # Keep only last 3
    
    # Format reference
    reference = f"Surah {selected_verse['surah_name']} {selected_verse['surah_number']}:{selected_verse['ayah_number']}"
    
    return {
        "feeling": condition["label"],
        "ayah": selected_verse["ayah_text"],
        "reference": reference,
        "surah_name": selected_verse["surah_name"],
        "surah_number": selected_verse["surah_number"],
        "ayah_number": selected_verse["ayah_number"],
        "source_url": selected_verse["source_url"],
        "ui_theme": condition["ui_theme"],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/system-prompt", response_model=SystemPromptResponse)
async def get_system_prompt():
    """Get the structured system prompt for LLM integration"""
    system_prompt = """You are FindYourPeace, a Quran-based emotional guidance companion.
Your voice is compassionate, calm, and non-judgmental.

Mission:
  Deliver authentic Quran verses (Sahih International English) that align with the user's selected emotion.

Knowledge Source:
  Solely rely on the curated dataset provided at runtime. Never fabricate or paraphrase scripture.

Interaction Rules:
  1. Accept a user-specified feeling or mood label.
  2. Randomly choose exactly one ayah from the ten verses mapped to that feeling.
  3. Respond with the following structure:
     Feeling: <human-friendly mood label>
     Ayah: <exact Sahih International translation>
     Reference: Surah <Name> <number:ayah>
  4. Do not add commentary, tafsir, or personal advice.
  5. If the feeling is absent from the dataset, reply:
     "I don't have verses for this condition yet. Please select another mood."
  6. Decline to provide medical, psychological, or legal guidance.
  7. Maintain reverent, peaceful tone in every response.

Safety:
  Escalate with a gentle refusal if asked for prohibited content or if dataset constraints cannot be met.
"""
    
    return {
        "system_prompt": system_prompt,
        "version": "1.0.0",
        "last_updated": "2025-10-14"
    }

@app.get("/api/stats")
async def get_statistics():
    """Get dataset statistics"""
    conditions = DATASET.get("conditions", [])
    total_verses = sum(len(c["verses"]) for c in conditions)
    
    return {
        "total_conditions": len(conditions),
        "total_verses": total_verses,
        "verses_per_condition": {c["label"]: len(c["verses"]) for c in conditions},
        "translation": DATASET["metadata"]["translation"],
        "last_updated": DATASET["metadata"]["last_updated"],
        "verification_source": DATASET["metadata"]["verification_source"]
    }

if __name__ == "__main__":
    import uvicorn
    print("🕊️ Starting FindYourPeace API...")
    print("📖 Dataset loaded with", len(DATASET.get("conditions", [])), "emotional states")
    print("🌐 API will be available at http://localhost:8000")
    print("📚 Documentation at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
