from rest_framework import viewsets, permissions, filters, status
from .models import Category, PaymentMode, Transaction, OpeningBalance, CashBook
from .serializers import CategorySerializer, PaymentModeSerializer, TransactionSerializer, OpeningBalanceSerializer, CashBookSerializer
from django_filters.rest_framework import DjangoFilterBackend
from io import BytesIO
import pandas as pd
from xhtml2pdf import pisa
from django.template.loader import render_to_string
from django.db.models import Q
import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class PaymentModeViewSet(viewsets.ModelViewSet):
    queryset = PaymentMode.objects.all().order_by('name')
    serializer_class = PaymentModeSerializer
    permission_classes = [permissions.IsAuthenticated]

class CashBookViewSet(viewsets.ModelViewSet):
    serializer_class = CashBookSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campus', 'is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        user = self.request.user

        # Admin → full access
        if user.is_superuser or (user.role and user.role.name.lower() == "admin"):
            return CashBook.objects.all().order_by('name')

        # Staff → only their assigned campuses
        return CashBook.objects.filter(campus__in=user.off_campuses.all()).order_by('name')

    def perform_create(self, serializer):
        user = self.request.user
        campus = serializer.validated_data.get("campus")

        # Staff → only allowed to create CashBooks within their campuses
        if not (user.is_superuser or (user.role and user.role.name.lower() == "admin")):
            if campus not in user.off_campuses.all():
                return Response(
                    {"error": "You are not allowed to add CashBooks for this campus."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Prevent deletion if linked with balances/transactions
        if instance.openingbalance_set.exists():
            return Response(
                {"error": "Cannot delete this Cash Book. There are existing Opening Balances."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if instance.transaction_set.exists():
            return Response(
                {"error": "Cannot delete this Cash Book. There are existing Transactions."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Staff → ensure only within assigned campuses
        user = request.user
        if not (user.is_superuser or (user.role and user.role.name.lower() == "admin")):
            if instance.campus not in user.off_campuses.all():
                return Response(
                    {"error": "You are not allowed to delete this CashBook."},
                    status=status.HTTP_403_FORBIDDEN
                )

        instance.delete()
        return Response({"success": "Cash Book deleted successfully"}, status=status.HTTP_200_OK)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'transaction_type', 'category', 'payment_mode', 'cash_book', 'user', 'date'
    ]
    search_fields = ['remarks']
    ordering_fields = ['date', 'amount']

    def get_queryset(self):
        user = self.request.user

        # Admin → full access
        if user.is_superuser or (user.role and user.role.name.lower() == "admin"):
            return Transaction.objects.all().order_by('-date', '-time')

        # Staff → filter transactions by assigned campuses
        return Transaction.objects.filter(
            cash_book__campus__in=user.off_campuses.all()
        ).order_by('-date', '-time')

    def perform_create(self, serializer):
        user = self.request.user
        cash_book = serializer.validated_data.get("cash_book")

        # Staff → cannot create transactions outside their campuses
        if not (user.is_superuser or (user.role and user.role.name.lower() == "admin")):
            if not cash_book or cash_book.campus not in user.off_campuses.all():
                raise PermissionError("You are not allowed to add transactions for this campus.")

        serializer.save(user=user)
    
    def create(self, request, *args, **kwargs):
        print("Incoming data:", request.data)
        return super().create(request, *args, **kwargs)

class OpeningBalanceViewSet(viewsets.ModelViewSet):
    queryset = OpeningBalance.objects.all().order_by('-date')
    serializer_class = OpeningBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@api_view(['POST'])
def generate_report(request):
    data = request.data
    queryset = Transaction.objects.all()

    # --- Filters ---
    if data.get("campus"):
        queryset = queryset.filter(cash_book__campus_id=data["campus"])
    if data.get("cash_book"):
        queryset = queryset.filter(cash_book_id=data["cash_book"])
    if data.get("typeFilter") and data["typeFilter"] != "all":
        queryset = queryset.filter(transaction_type=data["typeFilter"])
    if data.get("categories"):
        queryset = queryset.filter(category_id__in=data["categories"])
    if data.get("modes"):
        queryset = queryset.filter(payment_mode_id__in=data["modes"])
    if data.get("users"):
        queryset = queryset.filter(user_id__in=data["users"])

    # --- Date Filter ---
    today = datetime.date.today()
    if data.get("customDateRange"):
        from_date = data["customDateRange"]["from"]
        to_date = data["customDateRange"]["to"]
        queryset = queryset.filter(date__range=[from_date, to_date])
        date_text = f"{from_date} to {to_date}"
    else:
        date_filter = data.get("dateFilter", "today")
        if date_filter == "today":
            queryset = queryset.filter(date=today)
            date_text = "Today"
        elif date_filter == "yesterday":
            yesterday = today - datetime.timedelta(days=1)
            queryset = queryset.filter(date=yesterday)
            date_text = "Yesterday"
        elif date_filter == "this_month":
            queryset = queryset.filter(date__month=today.month, date__year=today.year)
            date_text = today.strftime("%B %Y")
        elif date_filter == "single" and data.get("customDateRange"):
            queryset = queryset.filter(date=data["customDateRange"]["from"])
            date_text = data["customDateRange"]["from"]
        else:
            date_text = "All Dates"

    serializer = TransactionSerializer(queryset.order_by("date", "time"), many=True)
    df = pd.DataFrame(serializer.data)

    # Calculate totals and running balance
    total_in = sum([t['amount'] for t in serializer.data if t['transaction_type'] == 'IN'])
    total_out = sum([t['amount'] for t in serializer.data if t['transaction_type'] == 'OUT'])
    net_balance = total_in - total_out

    # Compute running balance
    running_balance = []
    balance = 0
    for t in serializer.data:
        if t['transaction_type'] == 'IN':
            balance += t['amount']
        else:
            balance -= t['amount']
        running_balance.append(balance)

    df['running_balance'] = running_balance

    # Get Campus & CashBook names
    cash_book_obj = None
    if data.get("cash_book"):
        try:
            cash_book_obj = CashBook.objects.get(id=data["cash_book"])
        except CashBook.DoesNotExist:
            pass

    format_ = data.get("format", "excel")

    # --- EXCEL ---
    if format_ == "excel":
        output = BytesIO()
        writer = pd.ExcelWriter(output, engine='openpyxl')

        # Write header info
        wb = writer.book
        ws = wb.active
        ws.title = "Report"

        # First row - Campus & Cash Book
        ws.append([f"Campus: {cash_book_obj.campus.name if cash_book_obj else ''}",
                   f"Cash Book: {cash_book_obj.name if cash_book_obj else ''}"])
        # Second row - Date
        ws.append([f"Date: {date_text}"])
        # Third row - Totals
        ws.append([f"Total In: {total_in}", f"Total Out: {total_out}", f"Net Balance: {net_balance}"])
        # Empty row
        ws.append([])

        # Table headers
        headers = ["Sl. No.", "Date & Time", "Remarks", "Party Name & Mobile", "Category",
                   "Mode", "User", "Amount", "Balance"]
        ws.append(headers)

        # Table data
        for i, row in enumerate(serializer.data, 1):
            ws.append([
                i,
                f"{row['date']} {row['time']}",
                row.get("remarks") or "",
                f"{row.get('party_name') or ''} {row.get('party_mobile_number') or ''}",
                row.get("category_name") or "",
                row.get("payment_mode_name") or "",
                row.get("user_name") or "",
                row.get("amount") or 0,
                row.get("running_balance") or 0
            ])

        writer.save()
        output.seek(0)
        response = HttpResponse(
            output,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename=report.xlsx'
        return response

    # --- PDF ---
    elif format_ == "pdf":
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 30

        # Title rows
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(30, y, f"Campus: {cash_book_obj.campus.name if cash_book_obj else ''}")
        pdf.drawString(300, y, f"Cash Book: {cash_book_obj.name if cash_book_obj else ''}")
        y -= 20
        pdf.setFont("Helvetica", 12)
        pdf.drawString(30, y, f"Date: {date_text}")
        y -= 20
        pdf.drawString(30, y, f"Total In: {total_in}   Total Out: {total_out}   Net Balance: {net_balance}")
        y -= 30

        # Table headers
        pdf.setFont("Helvetica-Bold", 10)
        headers = ["Sl. No.", "Date & Time", "Remarks", "Party", "Category",
                   "Mode", "User", "Amount", "Balance"]
        x_positions = [30, 80, 150, 250, 350, 410, 470, 520, 580]

        for i, h in enumerate(headers):
            pdf.drawString(x_positions[i], y, h)
        y -= 15
        pdf.setFont("Helvetica", 10)

        for i, row in enumerate(serializer.data, 1):
            if y < 50:  # new page
                pdf.showPage()
                y = height - 30
            pdf.drawString(x_positions[0], y, str(i))
            pdf.drawString(x_positions[1], y, f"{row['date']} {row['time']}")
            pdf.drawString(x_positions[2], y, row.get("remarks") or "")
            pdf.drawString(x_positions[3], y, f"{row.get('party_name') or ''} {row.get('party_mobile_number') or ''}")
            pdf.drawString(x_positions[4], y, row.get("category_name") or "")
            pdf.drawString(x_positions[5], y, row.get("payment_mode_name") or "")
            pdf.drawString(x_positions[6], y, row.get("user_name") or "")
            pdf.drawString(x_positions[7], y, str(row.get("amount") or 0))
            pdf.drawString(x_positions[8], y, str(row.get("running_balance") or 0))
            y -= 15

        pdf.save()
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

    return Response({"error": "Invalid format"}, status=400)