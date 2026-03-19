from django.urls import path
from .views import ChatSessionListView, ChatAskView

urlpatterns = [
    path('sessions/', ChatSessionListView.as_view(), name='chat-session-list'),
    path('ask/', ChatAskView.as_view(), name='chat-ask'),
]
