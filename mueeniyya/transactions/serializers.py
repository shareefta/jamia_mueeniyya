from rest_framework import serializers
from .models import Category, PaymentMode, Transaction, OpeningBalance

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class PaymentModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMode
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    user_name = serializers.CharField(source='user.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    payment_mode_name = serializers.CharField(source='payment_mode.name', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    transaction_label = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name',
            'transaction_type', 'transaction_label',
            'category', 'category_name',
            'payment_mode', 'payment_mode_name',
            'campus', 'campus_name',
            'date', 'time', 'amount', 'remarks', 'created_at'
        ]

    def get_transaction_label(self, obj):
        return dict(Transaction.TRANSACTION_TYPES).get(obj.transaction_type, obj.transaction_type)

class OpeningBalanceSerializer(serializers.ModelSerializer):
    created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = OpeningBalance
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'date']

