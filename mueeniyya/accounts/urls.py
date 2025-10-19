from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RoleViewSet, UserViewSet, LoginView, MeView, OffCampusViewSet

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'users', UserViewSet, basename='user')
router.register(r'offcampuses', OffCampusViewSet, basename='offcampuses')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token_refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('', include(router.urls)),
]