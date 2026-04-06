import uuid
from django.db import models
from django.conf import settings


class Subject(models.Model):
    """Subject/Course model - exposed as 'courses' in API"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subjects'
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='enrolled_subjects',
        blank=True,
        limit_choices_to={'role': 'STUDENT'}
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subjects'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
