from django.urls import path
from .views import LectureListCreateView, LectureDetailView

urlpatterns = [
    path('', LectureListCreateView.as_view(), name='lecture-list-create'),
    path('<uuid:pk>/', LectureDetailView.as_view(), name='lecture-detail'),
]
