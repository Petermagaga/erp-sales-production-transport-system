from rest_framework import viewsets, filters
from rest_framework.decorators import action
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum,Count
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime,timedelta

from rest_framework.views import APIView
from .filters import SaleFilter
from .models import (
    Salesperson, Customer, Product, Batch,
    Sale, Feedback, Complaint, ProductRecall
)
from .serializers import (
    SalespersonSerializer, CustomerSerializer, ProductSerializer,
    BatchSerializer, SaleSerializer, FeedbackSerializer,
    ComplaintSerializer, ProductRecallSerializer
)

# -------------------------------
# 🔹 SALES MANAGEMENT
# -------------------------------
class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related('salesperson', 'product', 'customer').order_by('-date')
    serializer_class = SaleSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SaleFilter
    search_fields = ['product__name', 'customer__shop_name', 'salesperson__name', 'location']
    ordering_fields = ['date', 'total_amount', 'quantity']

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def analytics(self, request):
        qs = self.filter_queryset(self.get_queryset())

        total_sales = qs.count()
        total_revenue = qs.aggregate(total=Sum('total_amount'))['total'] or 0

        sales_by_region = (
            qs.values('salesperson__region')
            .annotate(total=Sum('total_amount'))
            .order_by('-total')
        )

        sales_by_product = (
            qs.values('product__name')
            .annotate(total_sold=Sum('quantity'), revenue=Sum('total_amount'))
            .order_by('-revenue')
        )

        sales_by_salesperson = (
            qs.values('salesperson__name')
            .annotate(total_revenue=Sum('total_amount'))
            .order_by('-total_revenue')
        )

        return Response({
            "summary": {
                "total_sales": total_sales,
                "total_revenue": total_revenue,
            },
            "sales_by_region": sales_by_region,
            "sales_by_product": sales_by_product,
            "sales_by_salesperson": sales_by_salesperson,
        })


# -------------------------------
# 🔹 SALESPEOPLE
# -------------------------------
class SalespersonViewSet(viewsets.ModelViewSet):
    queryset = Salesperson.objects.all()
    serializer_class = SalespersonSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'region']


# -------------------------------
# 🔹 CUSTOMERS
# -------------------------------
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'shop_name', 'phone', 'email']


# -------------------------------
# 🔹 PRODUCTS
# -------------------------------
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']


# -------------------------------
# 🔹 BATCHES
# -------------------------------
class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all().select_related('product').order_by('-manufacture_date')
    serializer_class = BatchSerializer
    permission_classes = [AllowAny]


# -------------------------------
# 🔹 FEEDBACK
# -------------------------------
class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().select_related('product', 'customer')
    serializer_class = FeedbackSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['customer__name', 'sale__product__name', 'message']


# -------------------------------
# 🔹 COMPLAINTS
# -------------------------------
class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related('customer',"product")
    serializer_class = ComplaintSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['customer__name', 'description', 'status']


# -------------------------------
# 🔹 PRODUCT RECALLS
# -------------------------------
class ProductRecallViewSet(viewsets.ModelViewSet):
    queryset = ProductRecall.objects.all().select_related('product', 'batch')
    serializer_class = ProductRecallSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'batch__batch_number', 'reason']

class SalesRegionsView(APIView):
    def get(self, request):
        regions = Sale.objects.values_list("region", flat=True).distinct()
        return Response([{"id": i, "name": r} for i, r in enumerate(regions, 1)])




from django.db.models.functions import TruncWeek, TruncMonth, TruncYear

class AnalyticsView(APIView):
    def get(self, request):
        # 🧩 Extract filters
        region = request.GET.get("region")
        sales_rep = request.GET.get("sales_rep")
        filter_type = request.GET.get("filter_type", "monthly")
        start_date = parse_date(request.GET.get("start_date")) or (datetime.today() - timedelta(days=30))
        end_date = parse_date(request.GET.get("end_date")) or datetime.today()

        # 🔍 Base queryset
        sales = Sale.objects.filter(date__range=[start_date, end_date])

        if region and region.lower() != "all":
            sales = sales.filter(region__iexact=region)

        if sales_rep and sales_rep.lower() != "all":
            sales = sales.filter(sales_officer__id=sales_rep)

        # 📊 Grouping logic
        if filter_type == "weekly":
            sales_grouped = (
                sales.annotate(period=TruncWeek("date"))
                .values("period")
                .annotate(total_sales=Count("id"), total_revenue=Sum("amount"))
                .order_by("period")
            )
        elif filter_type == "yearly":
            sales_grouped = (
                sales.annotate(period=TruncYear("date"))
                .values("period")
                .annotate(total_sales=Count("id"), total_revenue=Sum("amount"))
                .order_by("period")
            )
        else:  # default monthly
            sales_grouped = (
                sales.annotate(period=TruncMonth("date"))
                .values("period")
                .annotate(total_sales=Count("id"), total_revenue=Sum("amount"))
                .order_by("period")
            )

        # 🧮 Summary
        total_sales = sales.count()
        total_revenue = sales.aggregate(Sum("amount"))["amount__sum"] or 0
        avg_sale = total_revenue / total_sales if total_sales > 0 else 0

        # 🏆 Top Products
        top_products = (
            sales.values("product__name")
            .annotate(quantity_sold=Count("id"), revenue=Sum("amount"))
            .order_by("-revenue")[:5]
        )

        # ✅ Response structure
        data = {
            "summary": {
                "total_sales": total_sales,
                "total_revenue": round(total_revenue, 2),
                "avg_sale": round(avg_sale, 2),
            },
            "analytics": [
                {
                    "period": d["period"].strftime("%b %Y" if filter_type == "monthly" else "%Y-%W" if filter_type == "weekly" else "%Y"),
                    "total_sales": d["total_sales"],
                    "total_revenue": round(d["total_revenue"] or 0, 2),
                }
                for d in sales_grouped
            ],
            "top_products": [
                {
                    "product_name": p["product__name"],
                    "quantity_sold": p["quantity_sold"],
                    "revenue": round(p["revenue"], 2),
                }
                for p in top_products
            ],
        }

        return Response(data)
