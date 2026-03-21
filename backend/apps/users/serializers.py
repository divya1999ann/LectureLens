from rest_framework import serializers
from .models import Profile
from apps.authentication.serializers import UserSerializer
from apps.authentication.models import User


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for admin user listings"""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'is_active', 'created_at', 'full_name')

    def get_full_name(self, obj):
        try:
            return obj.profile.full_name or ''
        except Exception:
            return ''


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    class Meta:
        model = Profile
        fields = ('id', 'full_name', 'avatar_url', 'bio', 'updated_at')
        read_only_fields = ('id', 'updated_at')


class UserProfileSerializer(serializers.Serializer):
    """Combined user and profile serializer"""
    
    id = serializers.UUIDField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    created_at = serializers.DateTimeField(source='user.created_at', read_only=True)
    
    # Profile fields
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    avatar_url = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    
    def update(self, instance, validated_data):
        """Update profile fields"""
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.avatar_url = validated_data.get('avatar_url', instance.avatar_url)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Custom representation to include user data"""
        if isinstance(instance, Profile):
            profile = instance
            user = instance.user
        else:
            # If instance is User, get the profile
            user = instance
            profile = instance.profile
        
        return {
            'id': str(user.id),
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
            'created_at': user.created_at,
            'full_name': profile.full_name,
            'avatar_url': profile.avatar_url,
            'bio': profile.bio,
            'updated_at': profile.updated_at,
        }
