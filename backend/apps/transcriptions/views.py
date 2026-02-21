from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from apps.lectures.models import Lecture, LectureMaterial
from .serializers import TranscriptionStatusSerializer, TranscriptionSerializer


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
        
        # TODO: In production, trigger async transcription job here
        # For now, create a placeholder transcript entry
        transcript = LectureMaterial.objects.create(
            lecture=lecture,
            m_type='TRANSCRIPT',
            content_text='',  # Will be filled by AI service
            is_processed_for_rag=False
        )
        
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
        if transcript.content_text:
            transcription_status = 'completed'
            progress = 100
            message = 'Transcription completed successfully'
        else:
            # TODO: Check actual status from AI service
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
