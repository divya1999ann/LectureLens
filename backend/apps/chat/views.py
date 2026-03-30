import requests as req_lib
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatSessionDetailSerializer

AI_SERVICE_CHAT_URL = "http://127.0.0.1:8001/ai/chat"


@extend_schema(tags=['Chat'])
class ChatSessionListView(generics.ListCreateAPIView):
    """
    GET  /api/chat/sessions/         — list the current user's sessions
    POST /api/chat/sessions/         — create a new session
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ChatSession.objects.filter(user=self.request.user).order_by('-updated_at')
        subject_id = self.request.query_params.get('subject')
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema(tags=['Chat'])
class ChatSessionDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/chat/sessions/{id}/  — retrieve session with messages
    DELETE /api/chat/sessions/{id}/  — delete session
    """
    serializer_class = ChatSessionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


@extend_schema(tags=['Chat'])
class ChatAskView(APIView):
    """
    POST /api/chat/ask/
    Proxy RAG chat to the AI service and persist messages to the database.
    Request body:
        question      (str, required)
        lecture_ids   (list[str], required) — lecture UUIDs
        chat_history  (list[{role, content}], optional)
        session_id    (str, optional)       — existing session UUID
        subject_id    (str, optional)       — subject UUID for new session
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        question = request.data.get('question', '').strip()
        lecture_ids = request.data.get('lecture_ids', [])
        chat_history = request.data.get('chat_history', [])
        session_id = request.data.get('session_id')
        subject_id = request.data.get('subject_id')

        if not question:
            return Response(
                {'error': 'question is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not lecture_ids:
            return Response(
                {'error': 'lecture_ids must be a non-empty list'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Resolve or create chat session
        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                pass

        if session is None:
            session = ChatSession.objects.create(
                user=request.user,
                subject_id=subject_id or None,
                title=question[:100],
            )

        # Persist user message
        ChatMessage.objects.create(
            session=session,
            sender_role='user',
            content=question,
        )

        payload = {
            'question': question,
            'lecture_ids': lecture_ids,
            'chat_history': chat_history,
        }

        try:
            ai_resp = req_lib.post(
                AI_SERVICE_CHAT_URL,
                json=payload,
                timeout=60,
            )
            ai_resp.raise_for_status()
            ai_data = ai_resp.json()

            # Persist assistant message
            ChatMessage.objects.create(
                session=session,
                sender_role='assistant',
                content=ai_data.get('answer', ''),
                source_nodes=ai_data.get('citations', []),
            )

            # Update session timestamp
            session.save()

            return Response({**ai_data, 'session_id': str(session.id)}, status=status.HTTP_200_OK)

        except req_lib.exceptions.ConnectionError:
            return Response(
                {'error': 'AI service is unavailable. Please try again later.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except req_lib.exceptions.Timeout:
            return Response(
                {'error': 'AI service timed out. Please try again.'},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except req_lib.exceptions.HTTPError as exc:
            return Response(
                {'error': f'AI service returned an error: {exc.response.text}'},
                status=status.HTTP_502_BAD_GATEWAY
            )
