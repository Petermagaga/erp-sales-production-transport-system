from rest_framework import serializers
from .models import (
    Salesperson, Customer, Product, Batch,
    Sale, Feedback, Complaint, ProductRecall
)

# ===============================
# BASIC SERIALIZERS
# ===============================

class SalespersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salesperson
        fields = '__all__'


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class BatchSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Batch
        fields = ['id', 'product', 'product_id', 'batch_number', 'manufacture_date', 'expiry_date']


# ===============================
# SALES & MARKETING SERIALIZERS
# ===============================

class SaleSerializer(serializers.ModelSerializer):
    salesperson = SalespersonSerializer(read_only=True)
    salesperson_id = serializers.PrimaryKeyRelatedField(
        queryset=Salesperson.objects.all(), source='salesperson', write_only=True
    )
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Sale
        fields = [
            'id', 'date', 'salesperson', 'salesperson_id', 'customer', 'customer_id',
            'product', 'product_id', 'batch_number', 'quantity',
            'unit_price', 'total_amount', 'location', 'created_at'
        ]


class FeedbackSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Feedback
        fields = '__all__'


class ComplaintSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Complaint
        fields = '__all__'


class ProductRecallSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = ProductRecall
        fields = '__all__'
