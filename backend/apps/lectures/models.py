import uuid
from django.db import models
from apps.courses.models import Subject


class Lecture(models.Model):
    """Lecture model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='lectures'
    )
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    lecture_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lectures'
        ordering = ['-lecture_date']
    
    def __str__(self):
        return f"{self.title} - {self.subject.title}"


class LectureMaterial(models.Model):
    """Lecture materials including transcripts, notes, etc."""
    
    MATERIAL_TYPE_CHOICES = (
        ('TRANSCRIPT', 'Transcript'),
        ('NOTES', 'Notes'),
        ('PPT', 'PowerPoint'),
        ('LIVE_TRANSCRIPT', 'Live Transcript'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='materials'
    )
    m_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES)
    content_text = models.TextField(blank=True, null=True)
    file_url = models.TextField(blank=True, null=True)
    vector_id = models.CharField(max_length=255, blank=True, null=True)
    is_processed_for_rag = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lecture_materials'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.m_type} - {self.lecture.title}"


def lecture_audio_upload_path(instance, filename):
    """Generate upload path for lecture audio files"""
    return f'uploads/lectures/{instance.id}/{filename}'


class LectureAudio(models.Model):
    """Separate model to handle audio file uploads"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lecture = models.OneToOneField(
        Lecture,
        on_delete=models.CASCADE,
        related_name='audio'
    )
    audio_file = models.FileField(upload_to=lecture_audio_upload_path)
    file_size = models.BigIntegerField(help_text="File size in bytes")
    duration_seconds = models.IntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lecture_audio'
    
    def __str__(self):
        return f"Audio for {self.lecture.title}"
