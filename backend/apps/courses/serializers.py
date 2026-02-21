from rest_framework import serializers
from .models import Subject
from apps.authentication.serializers import UserSerializer


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for course/subject"""
    teacher_email = serializers.EmailField(source='teacher.email', read_only=True)
    teacher_name = serializers.CharField(source='teacher.profile.full_name', read_only=True)
    
    class Meta:
        model = Subject
        fields = (
            'id', 
            'teacher', 
            'teacher_email', 
            'teacher_name',
            'title', 
            'description', 
            'created_at', 
            'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'teacher')
    
    def create(self, validated_data):
        # Set the teacher to the current user
        validated_data['teacher'] = self.context['request'].user
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
