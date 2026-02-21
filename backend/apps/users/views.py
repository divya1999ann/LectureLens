from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Profile
from .serializers import UserProfileSerializer


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
