import tiktoken
from typing import List, Dict
from app.config import get_settings

settings = get_settings()

def chunk_text(
    text: str,
    chunk_size: int = None,
    chunk_overlap: int = None,
    lecture_id: int = None
) -> List[Dict[str, any]]:
    """
    Chunk text into overlapping segments using token count.
    
    Args:
        text: The text to chunk
        chunk_size: Max tokens per chunk (default from settings)
        chunk_overlap: Overlap tokens between chunks (default from settings)
        lecture_id: ID of the lecture (for metadata)
    
    Returns:
        List of chunk dictionaries with text and metadata
    """
    chunk_size = chunk_size or settings.chunk_size
    chunk_overlap = chunk_overlap or settings.chunk_overlap
    
    # Use tiktoken for accurate token counting
    encoding = tiktoken.get_encoding("cl100k_base")
    
    # Encode text to tokens
    tokens = encoding.encode(text)
    total_tokens = len(tokens)
    
    chunks = []
    start_idx = 0
    chunk_index = 0
    
    while start_idx < total_tokens:
        # Get chunk tokens
        end_idx = min(start_idx + chunk_size, total_tokens)
        chunk_tokens = tokens[start_idx:end_idx]
        
        # Decode back to text
        chunk_text = encoding.decode(chunk_tokens)
        
        # Create chunk with metadata
        chunk = {
            "text": chunk_text,
            "chunk_index": chunk_index,
            "start_token": start_idx,
            "end_token": end_idx,
            "token_count": len(chunk_tokens),
            "lecture_id": lecture_id
        }
        
        chunks.append(chunk)
        
        # Move to next chunk with overlap
        start_idx += (chunk_size - chunk_overlap)
        chunk_index += 1
    
    return chunks

def estimate_tokens(text: str) -> int:
    """Estimate token count for a text string"""
    encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))
