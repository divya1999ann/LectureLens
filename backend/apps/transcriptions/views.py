import threading
import requests as req_lib
import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from apps.lectures.models import Lecture, LectureMaterial
from .serializers import TranscriptionStatusSerializer, TranscriptionSerializer

logger = logging.getLogger(__name__)
AI_SERVICE_TRANSCRIBE_URL = "http://127.0.0.1:8001/ai/transcribe"


def _run_transcription(transcript_id: str, lecture_id: str, audio_path: str):
    """
    Spawned in a background thread.
    Calls AI service and writes result back to the LectureMaterial DB row.
    """
    try:
        import os
        logger.info(f"Starting transcription: transcript_id={transcript_id}, lecture_id={lecture_id}")
        logger.info(f"Audio path: {audio_path}")

        # Verify audio file exists
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found at: {audio_path}")
        logger.info(f"Audio file exists: {os.path.getsize(audio_path)} bytes")

        payload = {
            'lecture_id': str(lecture_id),
            'audio_path': audio_path,
            'method': 'file',
        }
        logger.info(f"Sending transcription request to AI service: {AI_SERVICE_TRANSCRIBE_URL}")
        resp = req_lib.post(
            AI_SERVICE_TRANSCRIBE_URL,
            json=payload,
            timeout=300,  # Deepgram transcription can take minutes
        )
        logger.info(f"AI service response status: {resp.status_code}")
        resp.raise_for_status()
        data = resp.json()

        logger.info(f"Transcription response: chunks_created={data.get('chunks_created')}, transcript_words={data.get('word_count')}")

        # Import here to avoid circular imports at module level
        LectureMaterial.objects.filter(id=transcript_id).update(
            content_text=data.get('transcript', ''),
            is_processed_for_rag=True,
        )
        logger.info(f"Transcription succeeded for lecture_id={lecture_id}: {data.get('chunks_created')} chunks stored")

    except Exception as exc:
        logger.error(
            f"Transcription failed for lecture_id={lecture_id}: {exc}",
            exc_info=True
        )
        # Mark as failed so status polling doesn't spin forever
        LectureMaterial.objects.filter(id=transcript_id).update(
            content_text='[TRANSCRIPTION_FAILED]',
        )


@extend_schema(tags=['Transcriptions'])
class StartTranscriptionView(APIView):
    """
    POST /api/transcriptions/{lecture_id}/start/
    Start transcription process for a lecture
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, lecture_id):
        try:
            lecture = Lecture.objects.get(id=lecture_id)
        except Lecture.DoesNotExist:
            return Response(
                {'error': 'Lecture not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if lecture has audio
        if not hasattr(lecture, 'audio'):
            return Response(
                {'error': 'Lecture has no audio file to transcribe'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if transcription already exists
        existing_transcript = LectureMaterial.objects.filter(
            lecture=lecture,
            m_type='TRANSCRIPT'
        ).first()
        
        if existing_transcript and existing_transcript.content_text:
            return Response(
                {
                    'message': 'Transcription already exists',
                    'transcript_id': str(existing_transcript.id)
                },
                status=status.HTTP_200_OK
            )
        
        # Create placeholder transcript entry
        transcript = LectureMaterial.objects.create(
            lecture=lecture,
            m_type='TRANSCRIPT',
            content_text='',  # Will be filled by AI service
            is_processed_for_rag=False
        )

        # Trigger AI service transcription in background thread
        audio_path = str(lecture.audio.audio_file.path)
        threading.Thread(
            target=_run_transcription,
            args=(str(transcript.id), str(lecture_id), audio_path),
            daemon=True,
        ).start()

        return Response(
            {
                'message': 'Transcription started',
                'transcript_id': str(transcript.id),
                'status': 'processing'
            },
            status=status.HTTP_202_ACCEPTED
        )


@extend_schema(tags=['Transcriptions'])
class TranscriptionStatusView(APIView):
    """
    GET /api/transcriptions/{lecture_id}/status/
    Get transcription status for a lecture
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, lecture_id):
        try:
            lecture = Lecture.objects.get(id=lecture_id)
        except Lecture.DoesNotExist:
            return Response(
                {'error': 'Lecture not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        transcript = LectureMaterial.objects.filter(
            lecture=lecture,
            m_type='TRANSCRIPT'
        ).first()
        
        if not transcript:
            return Response({
                'lecture_id': str(lecture_id),
                'status': 'not_started',
                'progress': 0,
                'message': 'Transcription has not been started'
            })
        
        # Determine status based on content
        if transcript.content_text and transcript.content_text != '[TRANSCRIPTION_FAILED]':
            transcription_status = 'completed'
            progress = 100
            message = 'Transcription completed successfully'
        elif transcript.content_text == '[TRANSCRIPTION_FAILED]':
            transcription_status = 'failed'
            progress = 0
            message = 'Transcription failed. Please try again.'
        else:
            transcription_status = 'processing'
            progress = 50
            message = 'Transcription in progress'
        
        return Response({
            'lecture_id': str(lecture_id),
            'transcript_id': str(transcript.id),
            'status': transcription_status,
            'progress': progress,
            'message': message,
            'is_processed_for_rag': transcript.is_processed_for_rag
        })


@extend_schema(tags=['Transcriptions'])
class TranscriptionDetailView(generics.RetrieveAPIView):
    """
    GET /api/transcriptions/{lecture_id}/
    Get the transcript content for a lecture
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TranscriptionSerializer
    
    def get_object(self):
        lecture_id = self.kwargs['lecture_id']
        
        try:
            lecture = Lecture.objects.get(id=lecture_id)
        except Lecture.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Lecture not found')
        
        transcript = LectureMaterial.objects.filter(
            lecture=lecture,
            m_type='TRANSCRIPT'
        ).first()
        
        if not transcript:
            from rest_framework.exceptions import NotFound
            raise NotFound('Transcript not found for this lecture')
        
        return transcript
