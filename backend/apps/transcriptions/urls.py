from django.urls import path
from .views import (
    StartTranscriptionView,
    TranscriptionStatusView,
    TranscriptionDetailView
)

urlpatterns = [
    path('<uuid:lecture_id>/start/', StartTranscriptionView.as_view(), name='start-transcription'),
    path('<uuid:lecture_id>/status/', TranscriptionStatusView.as_view(), name='transcription-status'),
    path('<uuid:lecture_id>/', TranscriptionDetailView.as_view(), name='transcription-detail'),
]
