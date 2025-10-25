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

    transaction_label = serializers.SerializerMethodField()
    
    # Add fields for Party
    party_name = serializers.CharField(source='party.name', read_only=True)
    party_mobile_number = serializers.CharField(source='party.mobile_number', read_only=True)
    party_id = serializers.PrimaryKeyRelatedField(
        queryset=Party.objects.all(), source='party', required=False, allow_null=True
    )

    # Optional: allow creating a new Party inline
    new_party_name = serializers.CharField(write_only=True, required=False)
    new_party_mobile_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'user_id',
            'transaction_type', 'transaction_label',
            'category', 'category_name',
            'payment_mode', 'payment_mode_name',
            'cash_book', 'cash_book_name',
            'date', 'time', 'amount', 'remarks', 'created_at',
            'party_id', 'party_name', 'party_mobile_number',
            'new_party_name', 'new_party_mobile_number'
        ]

    def get_transaction_label(self, obj):
        return dict(Transaction.TRANSACTION_TYPES).get(obj.transaction_type, obj.transaction_type)
    
    def create(self, validated_data):
        # Check if new Party is provided
        new_party_name = validated_data.pop('new_party_name', None)
        new_party_mobile_number = validated_data.pop('new_party_mobile_number', None)

        if new_party_name:
            party = Party.objects.create(
                name=new_party_name,
                mobile_number=new_party_mobile_number
            )
            validated_data['party'] = party

        return super().create(validated_data)


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