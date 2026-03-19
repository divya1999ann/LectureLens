from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

# ==================== Transcription Schemas ====================

class TranscriptionMethod(str, Enum):
    """Method for transcription"""
    LIVE = "live"  # Live audio from frontend
    FILE = "file"  # Uploaded MP3/WAV file

class TranscribeRequest(BaseModel):
    """Request for transcription"""
    lecture_id: str
    audio_path: Optional[str] = None  # For file upload
    audio_url: Optional[str] = None   # For live recording
    method: TranscriptionMethod = TranscriptionMethod.FILE

class TranscribeResponse(BaseModel):
    """Response after transcription"""
    lecture_id: str
    transcript: str
    word_count: int
    duration_seconds: float
    chunks_created: int
    status: str = "success"

# ==================== RAG/Chat Schemas ====================

class ChatMessage(BaseModel):
    """Single chat message"""
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    """Request for RAG chat"""
    question: str
    lecture_ids: List[str]  # Which lectures to query
    chat_history: List[ChatMessage] = Field(default_factory=list)  # Last 4 messages

class LectureCitation(BaseModel):
    """Citation for a lecture chunk"""
    lecture_id: str
    lecture_title: Optional[str] = None
    chunk_text: str
    relevance_score: float

class ChatResponse(BaseModel):
    """Response from RAG chat"""
    answer: str
    citations: List[LectureCitation]
    lecture_ids_used: List[str]
    status: str = "success"

# ==================== Health Check ====================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    services: Dict[str, bool]
    version: str = "1.0.0"
