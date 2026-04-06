from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from apps.authentication.permissions import IsTeacherOrReadOnly, IsTeacherOrAdmin, IsAdminUser
from .models import Subject
from .serializers import (
    CourseSerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    EnrolledStudentSerializer,
    EnrollStudentsSerializer,
)

User = get_user_model()


@extend_schema(tags=['Courses'])
class CourseListCreateView(generics.ListCreateAPIView):
    """
    GET /api/courses/ - List all courses
    POST /api/courses/ - Create a new course (teachers or admin)
    """
    queryset = Subject.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseSerializer
        return CourseListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Subject.objects.select_related('teacher', 'teacher__profile').all()
        teacher_id = self.request.query_params.get('teacher', None)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        return queryset


@extend_schema(tags=['Courses'])
class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/courses/{course_id}/ - Get course details
    PUT /api/courses/{course_id}/ - Update course (teacher or admin)
    DELETE /api/courses/{course_id}/ - Delete course (teacher or admin)
    """
    queryset = Subject.objects.select_related('teacher', 'teacher__profile').all()
    serializer_class = CourseDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]


@extend_schema(tags=['Courses'])
class CourseStudentsView(APIView):
    """
    GET /api/courses/{course_id}/students/ - List enrolled students (admin only)
    POST /api/courses/{course_id}/students/ - Assign students to course (admin only)
    """
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)

    def get(self, request, course_id):
        subject = get_object_or_404(Subject, id=course_id)
        students = subject.students.select_related('profile').all()
        serializer = EnrolledStudentSerializer(students, many=True)
        return Response(serializer.data)

    def post(self, request, course_id):
        subject = get_object_or_404(Subject, id=course_id)
        serializer = EnrollStudentsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student_ids = serializer.validated_data['student_ids']
        students = User.objects.filter(id__in=student_ids, role='STUDENT')

        if students.count() != len(student_ids):
            return Response(
                {'detail': 'One or more student IDs are invalid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        subject.students.add(*students)
        enrolled = subject.students.select_related('profile').all()
        return Response(EnrolledStudentSerializer(enrolled, many=True).data)


@extend_schema(tags=['Courses'])
class CourseStudentRemoveView(APIView):
    """
    DELETE /api/courses/{course_id}/students/{student_id}/ - Remove student from course (admin only)
    """
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)

    def delete(self, request, course_id, student_id):
        subject = get_object_or_404(Subject, id=course_id)
        student = get_object_or_404(User, id=student_id, role='STUDENT')
        subject.students.remove(student)
        return Response(status=status.HTTP_204_NO_CONTENT)
