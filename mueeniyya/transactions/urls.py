from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PaymentModeViewSet, TransactionViewSet, OpeningBalanceViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'payment_modes', PaymentModeViewSet, basename='payment_mode')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'opening_balances', OpeningBalanceViewSet, basename='opening_balance')

urlpatterns = [
    path('', include(router.urls)),
]
