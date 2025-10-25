from rest_framework import viewsets, permissions, filters
from .models import Category, PaymentMode, Transaction, OpeningBalance, CashBook, Party
from .serializers import CategorySerializer, PaymentModeSerializer, TransactionSerializer, OpeningBalanceSerializer, CashBookSerializer, PartySerializer
from django_filters.rest_framework import DjangoFilterBackend

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class PaymentModeViewSet(viewsets.ModelViewSet):
    queryset = PaymentMode.objects.all().order_by('name')
    serializer_class = PaymentModeSerializer
    permission_classes = [permissions.IsAuthenticated]

class CashBookViewSet(viewsets.ModelViewSet):
    queryset = CashBook.objects.all().order_by('name')
    serializer_class = CashBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Optional filtering, searching, and ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campus', 'is_active']  # filter by campus or active status
    search_fields = ['name']  # search by cash book name
    ordering_fields = ['name', 'created_at']  # allow ordering by name or creation time
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check for related OpeningBalances
        if instance.openingbalance_set.exists():
            return Response(
                {"error": "Cannot delete this Cash Book. There are existing Opening Balances."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Optional: Check for related Transactions
        if instance.transaction_set.exists():
            return Response(
                {"error": "Cannot delete this Cash Book. There are existing Transactions."},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.delete()
        return Response({"success": "Cash Book deleted successfully"}, status=status.HTTP_200_OK)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = [
        'transaction_type', 'category', 'payment_mode', 'cash_book', 'user', 'date'
    ]
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

class PartyViewSet(viewsets.ModelViewSet):
    queryset = Party.objects.all().order_by('name')
    serializer_class = PartySerializer
    permission_classes = [permissions.IsAuthenticated]

