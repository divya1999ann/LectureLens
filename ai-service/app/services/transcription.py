"""Transcription service using Deepgram API"""
import httpx
from typing import Dict, Any
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class TranscriptionService:
    """Service for transcribing audio using Deepgram"""
    
    def __init__(self):
        self.api_key = settings.deepgram_api_key
        self.base_url = "https://api.deepgram.com/v1/listen"
        
    async def transcribe_file(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcribe audio file using Deepgram
        
        Args:
            audio_path: Path to audio file on disk
            
        Returns:
            Dictionary with transcript and metadata
        """
        try:
            # Read audio file
            with open(audio_path, 'rb') as audio_file:
                audio_data = audio_file.read()
            
            # Prepare request
            headers = {
                "Authorization": f"Token {self.api_key}",
                "Content-Type": "audio/mpeg"  # Adjust based on file type
            }
            
            params = {
                "model": "nova-2",
                "smart_format": "true",
                "punctuate": "true",
                "paragraphs": "true",
                "utterances": "true"
            }
            
            # Call Deepgram API
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    params=params,
                    content=audio_data
                )
                response.raise_for_status()
            
            result = response.json()
            
            # Extract transcript
            transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
            paragraphs = result["results"]["channels"][0]["alternatives"][0].get("paragraphs", {})
            
            # Calculate metadata
            metadata = result.get("metadata", {})
            duration = metadata.get("duration", 0)
            
            return {
                "transcript": transcript,
                "paragraphs": paragraphs,
                "duration_seconds": duration,
                "word_count": len(transcript.split())
            }
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise
    
    async def transcribe_url(self, audio_url: str) -> Dict[str, Any]:
        """
        Transcribe audio from URL using Deepgram
        
        Args:
            audio_url: URL to audio file
            
        Returns:
            Dictionary with transcript and metadata
        """
        try:
            headers = {
                "Authorization": f"Token {self.api_key}",
                "Content-Type": "application/json"
            }
            
            params = {
                "model": "nova-2",
                "smart_format": "true",
                "punctuate": "true",
                "paragraphs": "true"
            }
            
            payload = {"url": audio_url}
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    params=params,
                    json=payload
                )
                response.raise_for_status()
            
            result = response.json()
            
            transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
            metadata = result.get("metadata", {})
            duration = metadata.get("duration", 0)
            
            return {
                "transcript": transcript,
                "duration_seconds": duration,
                "word_count": len(transcript.split())
            }
            
        except Exception as e:
            logger.error(f"Error transcribing audio URL: {e}")
            raise
