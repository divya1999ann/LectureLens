from django.urls import path
from .views import ChatSessionListView

urlpatterns = [
    path('sessions/', ChatSessionListView.as_view(), name='chat-session-list'),
]
