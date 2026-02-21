from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    
    class Meta:
        model = ChatMessage
        fields = ('id', 'session', 'sender_role', 'content', 'source_nodes', 'created_at')
        read_only_fields = ('id', 'created_at')


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions"""
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = (
            'id', 
            'user', 
            'lecture', 
            'subject', 
            'title', 
            'message_count',
            'created_at', 
            'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def get_message_count(self, obj):
        return obj.messages.count()
