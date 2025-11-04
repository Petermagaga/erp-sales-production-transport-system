from rest_framework import serializers
from .models import Warehouse,Material,DailyInventory,WarehouseAnalytics

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model= Warehouse
        fields="__all__"

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model=Material
        fields="__all__"

class DailyInventorySerializer(serializers.ModelSerializer):
    warehouse_name=serializers.CharField(source="Warehouse.categories",read_only=True)
    material_name=serializers.CharField(source="material_name",read_only=True)
    calculated_closing= serializers.SerializerMethodField()

    class Meta:
        model=DailyInventory
        fields=[
            "id",
            "date",
            "warehouse",
            "warehouse_name",
            "material",
            "material_name",
            "opening_balance",
            "raw_in",
            "shift_1",
            "shift_2",
            "shift_3",
            "closing_balance",
            "calculated_closing"
            "created_at"
        ]
        def get_calculated_closing(self,obj):
            return obj.calculate_closing()
        

class WarehousinAnalyticsSerializer(serializers.ModelSerializer):
    warehouse_name=serializers.CharField(source="warehouse.categories",read_only=True)

    class Meta:
        model=WarehouseAnalytics
        fields=[
            "id",
            "date",
            "warehouse",
            "warehouse_name",
            "total_raw_in",
            "total_output",
            "total_waste",
            "efficiency_rate",
        ]
