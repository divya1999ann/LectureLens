from django.contrib import admin
from .models import ChatSession, ChatMessage


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'lecture', 'subject', 'created_at', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'sender_role', 'content_preview', 'created_at')
    list_filter = ('sender_role', 'created_at')
    search_fields = ('content',)
    readonly_fields = ('id', 'created_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
