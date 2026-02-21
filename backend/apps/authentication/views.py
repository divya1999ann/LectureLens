from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view

from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer


@extend_schema(tags=['Authentication'])
class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user account
    """
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


@extend_schema(tags=['Authentication'])
class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login with email and password, returns JWT tokens
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = (AllowAny,)


@extend_schema(tags=['Authentication'])
class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklist the refresh token
    """
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(tags=['Authentication'])
class RefreshTokenView(TokenRefreshView):
    """
    POST /api/auth/refresh/
    Refresh the access token using refresh token
    """
    permission_classes = (AllowAny,)
