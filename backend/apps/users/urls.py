from django.urls import path
from .views import CurrentUserProfileView, UserListView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('me/', CurrentUserProfileView.as_view(), name='current-user-profile'),
]
