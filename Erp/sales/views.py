from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.dateparse import parse_date
from django.db.models import Sum, Count
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.db.models.functions import TruncWeek, TruncMonth, TruncYear

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

from accounts.permissions import ModulePermission

class SaleViewSet(viewsets.ModelViewSet):
    queryset = (
        Sale.objects
        .select_related("salesperson", "product", "customer")
        .order_by("-date")
    )
    serializer_class = SaleSerializer

    permission_classes = [ModulePermission]
    module_name = "sales"

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_class = SaleFilter
    search_fields = [
        "product__name",
        "customer__shop_name",
        "salesperson__name",
        "location"
    ]
    ordering_fields = ["date", "total_amount", "quantity"]


    @action(
        detail=False,
        methods=["get"],
        permission_classes=[ModulePermission]  # READ-ONLY enforced
    )
    def analytics(self, request):
        qs = self.filter_queryset(self.get_queryset())

        total_sales = qs.count()
        total_revenue = qs.aggregate(total=Sum("total_amount"))["total"] or 0

        return Response({
            "summary": {
                "total_sales": total_sales,
                "total_revenue": total_revenue,
            },
            "sales_by_region": qs.values("salesperson__region")
                .annotate(total=Sum("total_amount"))
                .order_by("-total"),

            "sales_by_product": qs.values("product__name")
                .annotate(
                    total_sold=Sum("quantity"),
                    revenue=Sum("total_amount")
                )
                .order_by("-revenue"),

            "sales_by_salesperson": qs.values("salesperson__name")
                .annotate(total_revenue=Sum("total_amount"))
                .order_by("-total_revenue"),
        })


class SalespersonViewSet(viewsets.ModelViewSet):
    queryset = Salesperson.objects.all()
    serializer_class = SalespersonSerializer

    permission_classes = [ModulePermission]
    module_name = "sales"

    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "region"]

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    permission_classes = [ModulePermission]
    module_name = "sales"

    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "shop_name", "phone", "email"]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("name")
    serializer_class = ProductSerializer

    permission_classes = [ModulePermission]
    module_name = "sales"

    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "category"]

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.select_related("product").order_by("-manufacture_date")
    serializer_class = BatchSerializer

    permission_classes = [ModulePermission]
    module_name = "sales"

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.select_related("product", "customer")
    serializer_class = FeedbackSerializer

    permission_classes = [ModulePermission]
    module_name = "sales"

    filter_backends = [filters.SearchFilter]
    search_fields = ["customer__name", "sale__product__name", "message"]

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.select_related("customer", "product")
    serializer_class = ComplaintSerializer

    permission_classes = [ModulePermission]
    module_name = "sales"

    filter_backends = [filters.SearchFilter]
    search_fields = ["customer__name", "description", "status"]

class ProductRecallViewSet(viewsets.ModelViewSet):
    queryset = ProductRecall.objects.select_related("product", "batch")
    serializer_class = ProductRecallSerializer

    permission_classes = [ModulePermission]
    module_name = "sales"

    filter_backends = [filters.SearchFilter]
    search_fields = ["product__name", "batch__batch_number", "reason"]


class SalesRegionsView(APIView):
    permission_classes = [ModulePermission]
    module_name = "sales"

    def get(self, request):
        regions = Sale.objects.values_list("location", flat=True).distinct()
        return Response([
            {"id": i, "name": r}
            for i, r in enumerate(regions, 1)
        ])


@method_decorator(cache_page(60 * 15), name="dispatch")
class AnalyticsView(APIView):
    permission_classes = [ModulePermission]
    module_name = "sales"

    def get(self, request):
        region = request.GET.get("region")
        sales_rep = request.GET.get("sales_rep")
        filter_type = request.GET.get("filter_type", "monthly")

        start = parse_date(request.GET.get("start_date")) or (
            datetime.today() - timedelta(days=30)
        )
        end = parse_date(request.GET.get("end_date")) or datetime.today()

        sales = Sale.objects.filter(date__range=[start, end])

        if region:
            sales = sales.filter(location__iexact=region)

        if sales_rep:
            sales = sales.filter(salesperson__id=sales_rep)

        if filter_type == "weekly":
            grouped = sales.annotate(period=TruncWeek("date"))
        elif filter_type == "yearly":
            grouped = sales.annotate(period=TruncYear("date"))
        else:
            grouped = sales.annotate(period=TruncMonth("date"))

        grouped = grouped.values("period").annotate(
            total_sales=Count("id"),
            total_revenue=Sum("total_amount"),
        ).order_by("period")

        analytics = [{
            "period": d["period"].strftime("%Y-%m"),
            "total_sales": d["total_sales"],
            "total_revenue": d["total_revenue"] or 0,
        } for d in grouped]

        total_sales = sales.count()
        total_revenue = sales.aggregate(Sum("total_amount"))["total_amount__sum"] or 0

        return Response({
            "summary": {
                "total_sales": total_sales,
                "total_revenue": total_revenue,
                "avg_sale": round(total_revenue / total_sales, 2) if total_sales else 0,
            },
            "analytics": analytics,
            "top_products": sales.values("product__name")
                .annotate(
                    quantity_sold=Count("id"),
                    revenue=Sum("total_amount")
                )
                .order_by("-revenue")[:5],
        })
