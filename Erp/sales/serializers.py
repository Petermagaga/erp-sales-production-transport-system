from rest_framework import serializers
from core.serializers import RoleAwareSerializer
from .models import (
    Salesperson, Customer, Product, Batch,
    Sale, Feedback, Complaint, ProductRecall
)

# =====================================================
# BASIC ENTITIES
# =====================================================

class SalespersonSerializer(RoleAwareSerializer):
    """
    Sales staff records.
    """
    class Meta:
        model = Salesperson
        fields = "__all__"

    role_field_permissions = {
        "*": {
            "read_only": ["created_at", "updated_at"],
        }
    }


class CustomerSerializer(RoleAwareSerializer):
    """
    Customers / shops.
    """
    class Meta:
        model = Customer
        fields = "__all__"

    role_field_permissions = {
        "*": {
            "read_only": ["created_at", "updated_at"],
        }
    }


class ProductSerializer(RoleAwareSerializer):
    """
    Products sold.
    Cost & margin are protected.
    """
    class Meta:
        model = Product
        fields = "__all__"

    role_field_permissions = {
        "sales": {
            "read_only": ["cost_price"],
        },
        "*": {
            "read_only": ["created_at", "updated_at"],
        }
    }


# =====================================================
# BATCH
# =====================================================

class BatchSerializer(RoleAwareSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = Batch
        fields = [
            "id",
            "product",
            "product_id",
            "batch_number",
            "manufacture_date",
            "expiry_date",
            "created_at",
        ]

    role_field_permissions = {
        "*": {
            "read_only": ["created_at"],
        }
    }


# =====================================================
# SALE (CORE TRANSACTION)
# =====================================================

class SaleSerializer(RoleAwareSerializer):
    salesperson = SalespersonSerializer(read_only=True)
    salesperson_id = serializers.PrimaryKeyRelatedField(
        queryset=Salesperson.objects.all(),
        source="salesperson",
        write_only=True
    )

    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source="customer",
        write_only=True
    )

    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = Sale
        fields = [
            "id",
            "date",
            "salesperson",
            "salesperson_id",
            "customer",
            "customer_id",
            "product",
            "product_id",
            "batch_number",
            "quantity",
            "unit_price",
            "total_amount",
            "location",
            "created_at",
        ]

    role_field_permissions = {
        # Sales can create sales but not manipulate totals
        "sales": {
            "read_only": ["total_amount", "created_at"],
            "read_only_on_update": ["date"],
        },

        # Everyone: system-managed fields
        "*": {
            "read_only": ["created_at"],
        }
    }

    def validate(self, attrs):
        """
        total_amount must always be system-calculated
        """
        attrs.pop("total_amount", None)
        return super().validate(attrs)


# =====================================================
# FEEDBACK
# =====================================================

class FeedbackSerializer(RoleAwareSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source="customer",
        write_only=True
    )

    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = Feedback
        fields = "__all__"

    role_field_permissions = {
        "*": {
            "read_only": ["created_at"],
        }
    }


# =====================================================
# COMPLAINT
# =====================================================

class ComplaintSerializer(RoleAwareSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source="customer",
        write_only=True
    )

    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = Complaint
        fields = "__all__"

    role_field_permissions = {
        # Only admin can change status
        "sales": {
            "read_only": ["status"],
        },
        "*": {
            "read_only": ["created_at"],
        }
    }


# =====================================================
# PRODUCT RECALL (HIGH RISK)
# =====================================================

class ProductRecallSerializer(RoleAwareSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source="customer",
        write_only=True
    )

    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = ProductRecall
        fields = "__all__"

    role_field_permissions = {
        # Sales can view but not modify recalls
        "sales": {
            "read_only": "__all__",
        },
        "*": {
            "read_only": ["created_at"],
        }
    }
