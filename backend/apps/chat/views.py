from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['Chat'])
class ChatSessionListView(APIView):
    """
    Placeholder view for Chat sessions.
    Full implementation coming in Phase 2.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"message": "Chat sessions functionality coming soon."}, status=status.HTTP_200_OK)
