from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PaymentModeViewSet, TransactionViewSet, OpeningBalanceViewSet, CashBookViewSet, generate_report

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'payment_modes', PaymentModeViewSet, basename='payment_mode')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'opening_balances', OpeningBalanceViewSet, basename='opening_balance')
router.register(r'cash_books', CashBookViewSet, basename='cash_book')

urlpatterns = [
    path('', include(router.urls)),
    path("generate_report/", generate_report, name="generate_report"),
]
