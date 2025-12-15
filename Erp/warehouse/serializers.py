from rest_framework import serializers
from core.serializers import RoleAwareSerializer
from .models import Material, DailyInventory, WarehouseAnalytics


# =====================================================
# MATERIAL
# =====================================================

class MaterialSerializer(RoleAwareSerializer):
    """
    Raw / packaging materials in warehouse.
    """

    class Meta:
        model = Material
        fields = "__all__"

    role_field_permissions = {
        # Warehouse staff can manage materials
        "warehouse": {},

        # Sales / others → read-only
        "sales": {
            "read_only": "__all__",
        },

        "*": {
            "read_only": ["created_at"],
        }
    }


# =====================================================
# DAILY INVENTORY
# =====================================================

class DailyInventorySerializer(RoleAwareSerializer):
    """
    Daily stock movements per material.
    """

    material_name = serializers.CharField(
        source="material.name",
        read_only=True
    )

    calculated_closing = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DailyInventory
        fields = [
            "id",
            "date",
            "material",
            "material_name",
            "opening_balance",
            "raw_in",
            "shift_1",
            "shift_2",
            "shift_3",
            "closing_balance",
            "calculated_closing",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "material_name",
            "calculated_closing",
            "created_at",
        ]

    role_field_permissions = {
        # Warehouse team: enter daily figures
        "warehouse": {
            "read_only_on_update": ["date", "material"],
        },

        # Everyone else: read-only
        "sales": {
            "read_only": "__all__",
        },
        "transport": {
            "read_only": "__all__",
        },

        "*": {
            "read_only": ["created_at"],
        }
    }

    # 🔒 Always calculate closing on server
    def get_calculated_closing(self, obj):
        return obj.calculate_totals()

    # 🔐 Optional hard validation (recommended)
    def validate(self, attrs):
        opening = attrs.get("opening_balance", getattr(self.instance, "opening_balance", 0))
        raw_in = attrs.get("raw_in", getattr(self.instance, "raw_in", 0))
        shift_total = (
            attrs.get("shift_1", getattr(self.instance, "shift_1", 0)) +
            attrs.get("shift_2", getattr(self.instance, "shift_2", 0)) +
            attrs.get("shift_3", getattr(self.instance, "shift_3", 0))
        )

        if opening + raw_in < shift_total:
            raise serializers.ValidationError(
                "Shift output cannot exceed available stock."
            )

        return attrs


# =====================================================
# WAREHOUSE ANALYTICS
# =====================================================

class WarehouseAnalyticsSerializer(RoleAwareSerializer):
    """
    Read-only KPI snapshots.
    """

    class Meta:
        model = WarehouseAnalytics
        fields = [
            "id",
            "date",
            "total_raw_in",
            "total_output",
            "total_waste",
            "efficiency_rate",
        ]

        read_only_fields = "__all__"

    role_field_permissions = {
        # Everyone can view
        "*": {
            "read_only": "__all__",
        }
    }
