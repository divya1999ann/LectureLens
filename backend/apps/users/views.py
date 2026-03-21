from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Profile
from .serializers import UserProfileSerializer, UserListSerializer
from apps.authentication.models import User
from apps.authentication.permissions import IsAdminUser


@extend_schema(tags=['Users'])
class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/users/me/ - Get current user profile
    PUT /api/users/me/ - Update current user profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        """Get or create profile for the current user"""
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile
    
    def retrieve(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@extend_schema(tags=['Users'])
class UserListView(generics.ListAPIView):
    """
    GET /api/users/?role=STUDENT|TEACHER|ADMIN — admin only
    Returns all users, optionally filtered by role.
    """
    serializer_class = UserListSerializer
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get_queryset(self):
        role = self.request.query_params.get('role', '').upper()
        qs = User.objects.select_related('profile').order_by('-created_at')
        if role in ('STUDENT', 'TEACHER', 'ADMIN'):
            qs = qs.filter(role=role)
        return qs
