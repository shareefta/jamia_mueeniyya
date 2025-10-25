from django.db import models
from django.conf import settings
from accounts.models import OffCampus

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class PaymentMode(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class CashBook(models.Model):
    name = models.CharField(max_length=100, unique=True)
    campus = models.ForeignKey(OffCampus, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.campus})" if self.campus else self.name

class Party(models.Model):
    name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.mobile_number})" if self.mobile_number else self.name

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('IN', 'Cash In'),
        ('OUT', 'Cash Out'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=3, choices=TRANSACTION_TYPES)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    payment_mode = models.ForeignKey(PaymentMode, on_delete=models.SET_NULL, null=True)
    cash_book = models.ForeignKey(CashBook, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    time = models.TimeField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    remarks = models.TextField(blank=True, null=True)
    party = models.ForeignKey(Party, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions")
    created_at = models.DateTimeField(auto_now_add=True)
    party_name = models.CharField(max_length=100, blank=True, null=True)
    party_mobile_number = models.CharField(max_length=15, blank=True, null=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.date})"

class OpeningBalance(models.Model):
    cash_book = models.ForeignKey(CashBook, on_delete=models.CASCADE, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.cash_book} - {self.amount}"



