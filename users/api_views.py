from django.contrib.auth import authenticate
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from FarmMoo.api_response import api_success
from .api_serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer


# Scoped throttle classes — each reads its rate from settings.DEFAULT_THROTTLE_RATES[scope].
# Using separate classes instead of setting throttle_scope on @action because
# the views are mounted via as_view() directly (not via a Router), so action
# kwargs are not forwarded automatically as initkwargs.

class _LoginThrottle(ScopedRateThrottle):
    scope = 'login'


class _RegisterThrottle(ScopedRateThrottle):
    scope = 'register'


class _TokenRefreshThrottle(ScopedRateThrottle):
    scope = 'token_refresh'


class TokenRefreshEnvelopeView(TokenRefreshView):
    throttle_classes = [_TokenRefreshThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return api_success(response.data, status_code=response.status_code)


class AuthViewSet(viewsets.ViewSet):
    def _token_payload(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user, context={'request': self.request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

    def get_permissions(self):
        if self.action in ('register', 'login'):
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_throttles(self):
        # Per-action throttling. self.action is reliably set in initialize_request()
        # which runs before check_throttles(), so this is safe.
        if self.action == 'login':
            return [_LoginThrottle()]
        if self.action == 'register':
            return [_RegisterThrottle()]
        return super().get_throttles()

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return api_success(self._token_payload(user), status_code=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            raise ValidationError({'detail': 'กรุณากรอก username และ password'})

        user = authenticate(username=username, password=password)
        if user is None:
            raise AuthenticationFailed('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')

        return api_success(self._token_payload(user))

    @action(detail=False, methods=['get'])
    def me(self, request):
        return api_success(UserSerializer(request.user, context={'request': request}).data)

    @action(detail=False, methods=['get', 'patch'])
    def profile(self, request):
        if request.method == 'GET':
            return api_success(UserSerializer(request.user, context={'request': request}).data)

        serializer = ProfileUpdateSerializer(request.user.profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(UserSerializer(request.user, context={'request': request}).data)
