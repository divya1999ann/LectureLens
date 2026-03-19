"""Chat router - RAG chatbot endpoint"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, LectureCitation
from app.services.rag import RAGService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize RAG service
rag_service = RAGService()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_lectures(request: ChatRequest):
    """
    RAG chatbot endpoint

    Query lecture content using retrieval-augmented generation.
    Supports multi-lecture queries and maintains chat history context.
    """
    try:
        print(f"\n=== CHAT REQUEST ===")
        print(f"Lectures: {request.lecture_ids}")
        print(f"Question: {request.question}")
        logger.info(f"Chat request for lectures: {request.lecture_ids}")
        logger.info(f"Question: {request.question}")
        
        # Convert chat history to dict format
        chat_history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.chat_history
        ]
        
        # Execute RAG query
        result = await rag_service.query(
            question=request.question,
            lecture_ids=request.lecture_ids,
            chat_history=chat_history
        )
        
        # Convert citations to schema
        citations = [
            LectureCitation(
                lecture_id=cite["lecture_id"],
                chunk_text=cite["chunk_text"],
                relevance_score=cite["relevance_score"]
            )
            for cite in result["citations"]
        ]
        
        return ChatResponse(
            answer=result["answer"],
            citations=citations,
            lecture_ids_used=result["lecture_ids_used"],
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
