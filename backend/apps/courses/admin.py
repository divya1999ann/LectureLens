from django.contrib import admin
from .models import Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'teacher__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
