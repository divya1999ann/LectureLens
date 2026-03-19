import requests as req_lib
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

AI_SERVICE_CHAT_URL = "http://127.0.0.1:8001/ai/chat"


@extend_schema(tags=['Chat'])
class ChatSessionListView(APIView):
    """
    Placeholder view for Chat sessions.
    Full implementation coming in Phase 2.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"message": "Chat sessions functionality coming soon."}, status=status.HTTP_200_OK)


@extend_schema(tags=['Chat'])
class ChatAskView(APIView):
    """
    POST /api/chat/ask/
    Proxy RAG chat to the AI service.
    Request body:
        question      (str, required)
        lecture_ids   (list[str], required) — lecture UUIDs
        chat_history  (list[{role, content}], optional)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        question = request.data.get('question', '').strip()
        lecture_ids = request.data.get('lecture_ids', [])
        chat_history = request.data.get('chat_history', [])

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
            return Response(ai_resp.json(), status=status.HTTP_200_OK)

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
