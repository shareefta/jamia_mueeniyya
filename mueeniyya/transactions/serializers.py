from rest_framework import serializers
from .models import Category, PaymentMode, CashBook, Transaction, OpeningBalance


# ----------------------------------------------------------------------
# CATEGORY SERIALIZER
# ----------------------------------------------------------------------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'is_active', 'created_at']


# ----------------------------------------------------------------------
# PAYMENT MODE SERIALIZER
# ----------------------------------------------------------------------
class PaymentModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMode
        fields = ['id', 'name', 'is_active', 'created_at']


# ----------------------------------------------------------------------
# CASH BOOK SERIALIZER
# ----------------------------------------------------------------------
class CashBookSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.name', read_only=True)

    class Meta:
        model = CashBook
        fields = ['id', 'name', 'campus', 'campus_name', 'is_active', 'created_at']


# ----------------------------------------------------------------------
# TRANSACTION SERIALIZER
# ----------------------------------------------------------------------
class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    category_name = serializers.CharField(source='category.name', read_only=True)
    payment_mode_name = serializers.CharField(source='payment_mode.name', read_only=True)

    # ✅ Updated for CashBook
    cash_book_name = serializers.CharField(source='cash_book.name', read_only=True)
    cash_book_id = serializers.PrimaryKeyRelatedField(
        source='cash_book',
        queryset=CashBook.objects.all(),
        write_only=True
    )

    transaction_label = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'user_id',
            'transaction_type', 'transaction_label',
            'category', 'category_name',
            'payment_mode', 'payment_mode_name',
            'cash_book_id', 'cash_book_name',
            'date', 'time', 'amount', 'remarks', 'created_at'
        ]

    def get_transaction_label(self, obj):
        return dict(Transaction.TRANSACTION_TYPES).get(obj.transaction_type, obj.transaction_type)


# ----------------------------------------------------------------------
# OPENING BALANCE SERIALIZER
# ----------------------------------------------------------------------
class OpeningBalanceSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    cash_book_name = serializers.CharField(source='cash_book.name', read_only=True)

    class Meta:
        model = OpeningBalance
        fields = [
            'id', 'cash_book', 'cash_book_name',
            'amount', 'date', 'created_by', 'created_by_name'
        ]