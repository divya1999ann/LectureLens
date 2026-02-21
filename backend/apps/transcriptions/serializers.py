from rest_framework import serializers
from apps.lectures.models import LectureMaterial


class TranscriptionStatusSerializer(serializers.Serializer):
    """Serializer for transcription status"""
    lecture_id = serializers.UUIDField()
    status = serializers.CharField()
    progress = serializers.IntegerField(min_value=0, max_value=100)
    message = serializers.CharField(required=False)


class TranscriptionSerializer(serializers.ModelSerializer):
    """Serializer for transcript content"""
    
    class Meta:
        model = LectureMaterial
        fields = ('id', 'lecture', 'content_text', 'is_processed_for_rag', 'created_at')
        read_only_fields = ('id', 'created_at')
