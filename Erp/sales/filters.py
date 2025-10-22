import django_filters
from .models import Sale

class SaleFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    region = django_filters.CharFilter(field_name='salesperson__region', lookup_expr='icontains')
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    product = django_filters.CharFilter(field_name='product__name', lookup_expr='icontains')
    salesperson = django_filters.CharFilter(field_name='salesperson__name', lookup_expr='icontains')

    class Meta:
        model = Sale
        fields = ['region', 'location', 'salesperson', 'product', 'date_from', 'date_to']
