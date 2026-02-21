import uuid
from django.db import models
from django.conf import settings
from apps.lectures.models import Lecture
from apps.courses.models import Subject


class ChatSession(models.Model):
    """Chat session for RAG conversations"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_sessions'
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_sessions'
    )
    title = models.CharField(max_length=255, default='New Conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"


class ChatMessage(models.Model):
    """Individual messages in a chat session"""
    
    SENDER_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender_role = models.CharField(max_length=20, choices=SENDER_CHOICES)
    content = models.TextField()
    source_nodes = models.JSONField(default=list, blank=True)  # Store which chunks were used
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender_role}: {self.content[:50]}..."
