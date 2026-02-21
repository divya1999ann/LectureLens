from rest_framework import serializers
from .models import Lecture, LectureMaterial, LectureAudio


class LectureMaterialSerializer(serializers.ModelSerializer):
    """Serializer for lecture materials"""
    
    class Meta:
        model = LectureMaterial
        fields = (
            'id', 
            'lecture', 
            'm_type', 
            'content_text', 
            'file_url', 
            'vector_id',
            'is_processed_for_rag', 
            'created_at'
        )
        read_only_fields = ('id', 'created_at')


class LectureAudioSerializer(serializers.ModelSerializer):
    """Serializer for lecture audio"""
    
    class Meta:
        model = LectureAudio
        fields = ('id', 'audio_file', 'file_size', 'duration_seconds', 'uploaded_at')
        read_only_fields = ('id', 'file_size', 'uploaded_at')


class LectureSerializer(serializers.ModelSerializer):
    """Basic lecture serializer"""
    subject_title = serializers.CharField(source='subject.title', read_only=True)
    has_audio = serializers.SerializerMethodField()
    
    class Meta:
        model = Lecture
        fields = (
            'id', 
            'subject', 
            'subject_title',
            'title', 
            'summary', 
            'lecture_date', 
            'created_at',
            'has_audio'
        )
        read_only_fields = ('id', 'lecture_date', 'created_at')
    
    def get_has_audio(self, obj):
        return hasattr(obj, 'audio')


class LectureListSerializer(serializers.ModelSerializer):
    """Lighter serializer for listing lectures"""
    subject_title = serializers.CharField(source='subject.title', read_only=True)
    material_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lecture
        fields = ('id', 'title', 'subject_title', 'lecture_date', 'material_count')
    
    def get_material_count(self, obj):
        return obj.materials.count()


class LectureDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with materials"""
    subject_title = serializers.CharField(source='subject.title', read_only=True)
    materials = LectureMaterialSerializer(many=True, read_only=True)
    audio = LectureAudioSerializer(read_only=True)
    
    class Meta:
        model = Lecture
        fields = (
            'id', 
            'subject', 
            'subject_title',
            'title', 
            'summary', 
            'lecture_date', 
            'created_at',
            'materials',
            'audio'
        )
        read_only_fields = ('id', 'lecture_date', 'created_at')


class LectureCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating lectures with audio upload"""
    audio_file = serializers.FileField(write_only=True, required=False)
    
    class Meta:
        model = Lecture
        fields = ('subject', 'title', 'summary', 'audio_file')
    
    def create(self, validated_data):
        audio_file = validated_data.pop('audio_file', None)
        lecture = Lecture.objects.create(**validated_data)
        
        # If audio file is provided, create LectureAudio
        if audio_file:
            LectureAudio.objects.create(
                lecture=lecture,
                audio_file=audio_file,
                file_size=audio_file.size
            )
        
        return lecture
