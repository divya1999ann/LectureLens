import uuid
from django.db import models
from django.conf import settings


class Profile(models.Model):
    """User profile model with additional information"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    full_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profiles'
    
    def __str__(self):
        return f"{self.user.email}'s profile"
