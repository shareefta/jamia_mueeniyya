from rest_framework import viewsets, permissions, filters
from .models import Category, PaymentMode, Transaction, OpeningBalance
from .serializers import CategorySerializer, PaymentModeSerializer, TransactionSerializer, OpeningBalanceSerializer
from django_filters.rest_framework import DjangoFilterBackend

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class PaymentModeViewSet(viewsets.ModelViewSet):
    queryset = PaymentMode.objects.all().order_by('name')
    serializer_class = PaymentModeSerializer
    permission_classes = [permissions.IsAuthenticated]

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'category', 'payment_mode', 'campus', 'user', 'date']
    search_fields = ['remarks']
    ordering_fields = ['date', 'amount']

    def perform_create(self, serializer):
        # set the logged-in user as creator
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        print("Incoming data:", request.data)
        return super().create(request, *args, **kwargs)


class OpeningBalanceViewSet(viewsets.ModelViewSet):
    queryset = OpeningBalance.objects.all().order_by('-date')
    serializer_class = OpeningBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

