from rest_framework import serializers
from .models import Category, PaymentMode, CashBook, Transaction, OpeningBalance, Party


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
# PARTY SERIALIZER
# ----------------------------------------------------------------------
class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ['id', 'name', 'mobile_number']


# ----------------------------------------------------------------------
# TRANSACTION SERIALIZER
# ----------------------------------------------------------------------
class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    category_name = serializers.CharField(source='category.name', read_only=True)
    payment_mode_name = serializers.CharField(source='payment_mode.name', read_only=True)

    cash_book_name = serializers.CharField(source='cash_book.name', read_only=True)
    cash_book = serializers.PrimaryKeyRelatedField(
        queryset=CashBook.objects.all()
    )
    
    party_name = serializers.CharField(source='party.name', read_only=True)
    party_mobile = serializers.CharField(source='party.mobile_number', read_only=True)

    transaction_label = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'user_id',
            'transaction_type', 'transaction_label',
            'category', 'category_name',
            'payment_mode', 'payment_mode_name',
            'cash_book', 'cash_book_name',
            'date', 'time', 'amount', 'remarks', 'created_at'
            'party', 'party_name', 'party_mobile'
        ]

    def get_transaction_label(self, obj):
        return dict(Transaction.TRANSACTION_TYPES).get(obj.transaction_type, obj.transaction_type)


# ----------------------------------------------------------------------
# OPENING BALANCE SERIALIZER
# ----------------------------------------------------------------------
class OpeningBalanceSerializer(serializers.ModelSerializer):
    cash_book_name = serializers.CharField(source='cash_book.name', read_only=True)

    class Meta:
        model = OpeningBalance
        fields = [
            'id', 'cash_book', 'cash_book_name', 'amount', 'date', 'created_by'
        ]
        read_only_fields = ['date', 'created_by', 'cash_book_name']