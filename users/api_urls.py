from django.urls import path
from .api_views import AuthViewSet

register = AuthViewSet.as_view({'post': 'register'})
login = AuthViewSet.as_view({'post': 'login'})
me = AuthViewSet.as_view({'get': 'me'})
profile = AuthViewSet.as_view({'get': 'profile', 'patch': 'profile'})

urlpatterns = [
    path('register/', register, name='api_register'),
    path('login/', login, name='api_login'),
    path('me/', me, name='api_me'),
    path('profile/', profile, name='api_profile'),
]
