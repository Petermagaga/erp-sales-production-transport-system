from rest_framework import serializers
from .models import Material, DailyInventory, WarehouseAnalytics

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = "__all__"


class DailyInventorySerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source="material.name", read_only=True)
    calculated_closing = serializers.SerializerMethodField()

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

    def get_calculated_closing(self, obj):
        return obj.calculate_totals()


class WarehouseAnalyticsSerializer(serializers.ModelSerializer):
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
