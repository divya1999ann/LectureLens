from rest_framework import generics, permissions, status, parsers
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from apps.authentication.permissions import IsTeacherOrReadOnly
from .models import Lecture, LectureMaterial
from .serializers import (
    LectureSerializer,
    LectureListSerializer,
    LectureDetailSerializer,
    LectureCreateSerializer
)


@extend_schema(tags=['Lectures'])
class LectureListCreateView(generics.ListCreateAPIView):
    """
    GET /api/lectures/ - List all lectures
    POST /api/lectures/ - Create a new lecture with audio upload (teachers only)
    """
    queryset = Lecture.objects.select_related('subject').all()
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LectureCreateSerializer
        return LectureListSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsTeacherOrReadOnly()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filter lectures by subject if query param provided"""
        queryset = Lecture.objects.select_related('subject').all()
        subject_id = self.request.query_params.get('subject', None)
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lecture = serializer.save()
        
        # Return detailed lecture data
        detail_serializer = LectureDetailSerializer(lecture)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )


@extend_schema(tags=['Lectures'])
class LectureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/lectures/{lecture_id}/ - Get lecture details
    PUT /api/lectures/{lecture_id}/ - Update lecture (teacher only)
    DELETE /api/lectures/{lecture_id}/ - Delete lecture (teacher only)
    """
    queryset = Lecture.objects.select_related('subject').prefetch_related('materials', 'audio').all()
    serializer_class = LectureDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsTeacherOrReadOnly()]
        return [permissions.IsAuthenticated()]
