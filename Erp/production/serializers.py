from rest_framework import serializers
from core.serializers import RoleAwareSerializer
from .models import RawMaterial, FlourOutput


# =====================================================
# RAW MATERIAL
# =====================================================
class RawMaterialSerializer(RoleAwareSerializer):
    """
    Raw materials used in production.
    Sensitive cost & supplier data protected by role.
    """
    class Meta:
        model = RawMaterial
        fields = "__all__"

    role_field_permissions = {
        # Sales can view but not modify cost-related fields
        "sales": {
            "read_only": ["cost_price", "supplier"],
        },

        # Warehouse manages quantities but not cost
        "warehouse": {
            "read_only": ["cost_price"],
        },

        # Everyone: system-managed timestamps
        "*": {
            "read_only": ["created_at", "updated_at"],
        }
    }


# =====================================================
# FLOUR OUTPUT
# =====================================================
class FlourOutputSerializer(RoleAwareSerializer):
    """
    Production output per shift.
    Calculated fields are system-controlled.
    """
    class Meta:
        model = FlourOutput
        fields = "__all__"

    role_field_permissions = {
        # Calculated / protected fields
        "*": {
            "read_only": [
                "total_raw",
                "efficiency",
                "created_at",
                "updated_at",
            ],
        },

        # Once created, date & shift must not change
        "warehouse": {
            "read_only_on_update": ["date", "shift"],
        }
    }

    def validate(self, attrs):
        """
        Never trust client input for calculated fields
        """
        attrs.pop("total_raw", None)
        attrs.pop("efficiency", None)
        return super().validate(attrs)


# =====================================================
# MERGED PRODUCTION (READ-ONLY)
# =====================================================
class MergedProductionSerializer(serializers.Serializer):
    """
    Aggregated / analytics serializer.
    READ-ONLY by design.
    """
    date = serializers.DateField(read_only=True)
    shift = serializers.CharField(read_only=True)

    premix = serializers.FloatField(read_only=True)
    maize = serializers.FloatField(read_only=True)
    soya = serializers.FloatField(read_only=True)
    sugar = serializers.FloatField(read_only=True)
    sorghum = serializers.FloatField(read_only=True)

    total_raw = serializers.FloatField(read_only=True)
    flour_output = serializers.FloatField(read_only=True)
    flour_spillage = serializers.FloatField(read_only=True)

    maize_germ = serializers.FloatField(read_only=True)
    maize_chaff = serializers.FloatField(read_only=True)
    sorghum_waste = serializers.FloatField(read_only=True)

    efficiency = serializers.FloatField(read_only=True)
