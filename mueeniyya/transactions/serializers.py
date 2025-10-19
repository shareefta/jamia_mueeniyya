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
    class Meta:
        model = Transaction
        fields = '__all__'

class OpeningBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningBalance
        fields = '__all__'

