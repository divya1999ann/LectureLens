from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import transcription, chat

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="LectureLens AI Service",
    description="Transcription and RAG chatbot service for LectureLens",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware (allow Django backend to call this service)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.django_backend_url,
        "http://localhost:3000",  # React frontend
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transcription.router, prefix="/ai", tags=["Transcription"])
app.include_router(chat.router, prefix="/ai", tags=["Chat"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "LectureLens AI Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "transcribe": "/ai/transcribe",
            "chat": "/ai/chat"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    # TODO: Add actual service checks
    return {
        "status": "healthy",
        "services": {
            "openrouter": True,
            "pinecone": True,
            "deepgram": True
        },
        "version": "1.0.0"
    }
