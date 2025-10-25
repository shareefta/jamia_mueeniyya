from django.contrib import admin
from .models import Category, PaymentMode, Transaction, OpeningBalance, CashBook

admin.site.register(Category)
admin.site.register(PaymentMode)
admin.site.register(Transaction)
admin.site.register(OpeningBalance)
admin.site.register(CashBook)