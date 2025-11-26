from rest_framework import viewsets, filters
from rest_framework.decorators import action
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum,Count
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime,timedelta
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
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
        regions = Sale.objects.values_list("location", flat=True).distinct()
        return Response([{"id": i, "name": r} for i, r in enumerate(regions, 1)])




from django.db.models.functions import TruncWeek, TruncMonth, TruncYear
@method_decorator(cache_page(60 * 15), name="dispatch")
class AnalyticsView(APIView):
    def get(self, request):
        region = request.GET.get("region")
        sales_rep = request.GET.get("sales_rep")
        filter_type = request.GET.get("filter_type", "monthly")

        start_date = parse_date(request.GET.get("start_date")) or (datetime.today() - timedelta(days=30))
        end_date = parse_date(request.GET.get("end_date")) or datetime.today()

        sales = Sale.objects.filter(date__range=[start_date, end_date])

        # Fix filters
        if region:
            sales = sales.filter(region__iexact=region)

        if sales_rep:
            sales = sales.filter(salesperson__id=sales_rep)

        # Grouping
        if filter_type == "weekly":
            grouped = sales.annotate(period=TruncWeek("date"))
        elif filter_type == "yearly":
            grouped = sales.annotate(period=TruncYear("date"))
        else:
            grouped = sales.annotate(period=TruncMonth("date"))

        grouped = (
            grouped.values("period")
            .annotate(
                total_sales=Count("id"),
                total_revenue=Sum("amount"),
            )
            .order_by("period")
        )

        analytics = []
        for d in grouped:
            period = d["period"]
            if filter_type == "weekly":
                period_str = period.strftime("%Y-W%W")
            elif filter_type == "yearly":
                period_str = period.strftime("%Y")
            else:
                period_str = period.strftime("%b %Y")

            analytics.append({
                "period": period_str,
                "total_sales": d["total_sales"],
                "total_revenue": d["total_revenue"] or 0,
            })

        # Summary
        total_sales = sales.count()
        total_revenue = sales.aggregate(Sum("total_amount"))["total_amount__sum"] or 0
        avg_sale = round(total_revenue / total_sales, 2) if total_sales else 0

        # Top products
        top_products = sales.values("product__name").annotate(
            quantity_sold=Count("id"),
            revenue=Sum("amount")
        ).order_by("-revenue")[:5]

        top_products_formatted = [
            {
                "product_name": p["product__name"],
                "quantity_sold": p["quantity_sold"],
                "revenue": p["revenue"] or 0
            }
            for p in top_products
        ]

        return Response({
            "summary": {
                "total_sales": total_sales,
                "total_revenue": total_revenue,
                "avg_sale": avg_sale,
            },
            "analytics": analytics,
            "top_products": top_products_formatted,
        })