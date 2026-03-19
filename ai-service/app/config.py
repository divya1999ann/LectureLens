from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Keys
    openrouter_api_key: str
    pinecone_api_key: str
    deepgram_api_key: str
    
    # Service URLs
    django_backend_url: str = "http://127.0.0.1:8000"
    ai_service_host: str = "127.0.0.1"
    ai_service_port: int = 8001
    
    # Model Configuration
    llm_model: str = "mistralai/mistral-7b-instruct-v0.1"
    embedding_model: str = "nvidia/llama-nemotron-embed-vl-1b-v2:free"
    embedding_dimension: int = 4096
    
    # Chunking Configuration
    chunk_size: int = 500
    chunk_overlap: int = 50
    
    # Pinecone
    pinecone_environment: str = "us-east-1"
    pinecone_index_name: str = "lecturelens"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
