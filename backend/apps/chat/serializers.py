from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='sender_role')
    citations = serializers.JSONField(source='source_nodes')
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ('id', 'role', 'content', 'citations', 'timestamp')
        read_only_fields = ('id', 'timestamp')


class ChatSessionSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    first_message = serializers.SerializerMethodField()
    subject_id = serializers.UUIDField(source='subject.id', read_only=True, allow_null=True)

    class Meta:
        model = ChatSession
        fields = (
            'id',
            'subject_id',
            'title',
            'message_count',
            'first_message',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_first_message(self, obj):
        first = obj.messages.filter(sender_role='user').order_by('created_at').first()
        return first.content if first else obj.title


class ChatSessionDetailSerializer(ChatSessionSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta(ChatSessionSerializer.Meta):
        fields = ChatSessionSerializer.Meta.fields + ('messages',)
