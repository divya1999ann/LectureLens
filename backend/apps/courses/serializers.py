from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Subject
from apps.authentication.serializers import UserSerializer

User = get_user_model()


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for course/subject creation"""
    teacher_email = serializers.EmailField(source='teacher.email', read_only=True)
    teacher_name = serializers.CharField(source='teacher.profile.full_name', read_only=True)
    teacher_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Subject
        fields = (
            'id',
            'teacher',
            'teacher_id',
            'teacher_email',
            'teacher_name',
            'title',
            'description',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'teacher')

    def create(self, validated_data):
        user = self.context['request'].user
        teacher_id = validated_data.pop('teacher_id', None)
        if user.role == 'ADMIN' and teacher_id:
            validated_data['teacher'] = User.objects.get(id=teacher_id)
        else:
            validated_data['teacher'] = user
        return super().create(validated_data)


class CourseListSerializer(serializers.ModelSerializer):
    """Lighter serializer for listing courses"""
    teacher_email = serializers.EmailField(source='teacher.email', read_only=True)
    lecture_count = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ('id', 'title', 'description', 'teacher_email', 'lecture_count', 'created_at')

    def get_lecture_count(self, obj):
        return obj.lectures.count()


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with related lectures"""
    teacher_email = serializers.EmailField(source='teacher.email', read_only=True)
    teacher_name = serializers.CharField(source='teacher.profile.full_name', read_only=True)
    lectures = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = (
            'id',
            'teacher',
            'teacher_email',
            'teacher_name',
            'title',
            'description',
            'lectures',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'teacher')

    def get_lectures(self, obj):
        from apps.lectures.serializers import LectureListSerializer
        lectures = obj.lectures.all()
        return LectureListSerializer(lectures, many=True).data


class EnrolledStudentSerializer(serializers.ModelSerializer):
    """Serializer for a student enrolled in a course"""
    full_name = serializers.CharField(source='profile.full_name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name')


class EnrollStudentsSerializer(serializers.Serializer):
    """Serializer for enrolling students in a course"""
    student_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False
    )
