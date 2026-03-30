from django.urls import path
from .views import ChatSessionListView, ChatSessionDetailView, ChatAskView

urlpatterns = [
    path('sessions/', ChatSessionListView.as_view(), name='chat-session-list'),
    path('sessions/<uuid:pk>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('ask/', ChatAskView.as_view(), name='chat-ask'),
]
