from rest_framework import generics, permissions, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from apps.authentication.permissions import IsTeacherOrReadOnly
from .models import Subject
from .serializers import (
    CourseSerializer, 
    CourseListSerializer, 
    CourseDetailSerializer
)


@extend_schema(tags=['Courses'])
class CourseListCreateView(generics.ListCreateAPIView):
    """
    GET /api/courses/ - List all courses
    POST /api/courses/ - Create a new course (teachers only)
    """
    queryset = Subject.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseSerializer
        return CourseListSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsTeacherOrReadOnly()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filter courses by teacher if query param provided"""
        queryset = Subject.objects.select_related('teacher', 'teacher__profile').all()
        teacher_id = self.request.query_params.get('teacher', None)
        
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        
        return queryset


@extend_schema(tags=['Courses'])
class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/courses/{course_id}/ - Get course details
    PUT /api/courses/{course_id}/ - Update course (teacher only)
    DELETE /api/courses/{course_id}/ - Delete course (teacher only)
    """
    queryset = Subject.objects.select_related('teacher', 'teacher__profile').all()
    serializer_class = CourseDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsTeacherOrReadOnly()]
        return [permissions.IsAuthenticated()]
