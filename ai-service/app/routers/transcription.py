"""Transcription router - handles audio transcription and embedding"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import TranscribeRequest, TranscribeResponse
from app.services.transcription import TranscriptionService
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreService
from app.utils.chunking import chunk_text
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
transcription_service = TranscriptionService()
embedding_service = EmbeddingService()
vector_store = VectorStoreService()


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(request: TranscribeRequest):
    """
    Transcribe audio and embed into Pinecone
    
    Complete pipeline:
    1. Transcribe audio using Deepgram
    2. Chunk the transcript
    3. Generate embeddings for each chunk
    4. Store in Pinecone
    """
    try:
        logger.info(f"Starting transcription for lecture {request.lecture_id}")
        
        # Step 1: Transcribe audio
        if request.method == "file" and request.audio_path:
            logger.info(f"Transcribing from file: {request.audio_path}")
            transcription_result = await transcription_service.transcribe_file(
                request.audio_path
            )
        elif request.method == "live" and request.audio_url:
            logger.info(f"Transcribing from URL: {request.audio_url}")
            transcription_result = await transcription_service.transcribe_url(
                request.audio_url
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid transcription request. Provide either audio_path or audio_url"
            )
        
        transcript = transcription_result["transcript"]
        duration = transcription_result["duration_seconds"]
        word_count = transcription_result["word_count"]
        
        logger.info(f"Transcription complete. Words: {word_count}, Duration: {duration}s")
        
        # Step 2: Chunk the transcript
        logger.info("Chunking transcript...")
        chunks = chunk_text(
            text=transcript,
            lecture_id=request.lecture_id
        )
        logger.info(f"Created {len(chunks)} chunks")
        
        # Step 3: Generate embeddings
        logger.info("Generating embeddings...")
        chunk_texts = [chunk["text"] for chunk in chunks]
        embeddings = embedding_service.embed_texts(chunk_texts)
        logger.info(f"Generated {len(embeddings)} embeddings")
        
        # Step 4: Store in Pinecone
        logger.info("Storing in Pinecone...")
        chunks_stored = vector_store.upsert_chunks(
            lecture_id=request.lecture_id,
            chunks=chunks,
            embeddings=embeddings
        )
        
        logger.info(f"Successfully processed lecture {request.lecture_id}")
        
        return TranscribeResponse(
            lecture_id=request.lecture_id,
            transcript=transcript,
            word_count=word_count,
            duration_seconds=duration,
            chunks_created=chunks_stored,
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Error in transcription pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))
