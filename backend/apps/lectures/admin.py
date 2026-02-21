from django.contrib import admin
from .models import Lecture, LectureMaterial, LectureAudio


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'lecture_date', 'created_at')
    list_filter = ('lecture_date', 'subject')
    search_fields = ('title', 'subject__title')
    readonly_fields = ('id', 'created_at')


@admin.register(LectureMaterial)
class LectureMaterialAdmin(admin.ModelAdmin):
    list_display = ('lecture', 'm_type', 'is_processed_for_rag', 'created_at')
    list_filter = ('m_type', 'is_processed_for_rag')
    search_fields = ('lecture__title',)
    readonly_fields = ('id', 'created_at')


@admin.register(LectureAudio)
class LectureAudioAdmin(admin.ModelAdmin):
    list_display = ('lecture', 'file_size', 'duration_seconds', 'uploaded_at')
    search_fields = ('lecture__title',)
    readonly_fields = ('id', 'file_size', 'uploaded_at')
