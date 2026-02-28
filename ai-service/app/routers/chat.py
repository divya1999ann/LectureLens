from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_lectures(request: ChatRequest):
    """
    RAG chatbot endpoint
    TODO: Implement RAG logic
    """
    # Placeholder response
    return ChatResponse(
        answer="RAG chatbot coming soon...",
        citations=[],
        lecture_ids_used=request.lecture_ids,
        status="pending"
    )
