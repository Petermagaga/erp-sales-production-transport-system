from django.contrib import admin
from .models import  Material, DailyInventory, WarehouseAnalytics




@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "unit")
    list_filter = ("category", "unit")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(DailyInventory)
class DailyInventoryAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "material",
        "opening_balance",
        "raw_in",
        "shift_1",
        "shift_2",
        "shift_3",
        "closing_balance",
        "created_at",
    )
    list_filter = ( "material", "date")
    search_fields = ("material__name", )
    ordering = ("-date",)


@admin.register(WarehouseAnalytics)
class WarehouseAnalyticsAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "total_raw_in",
        "total_output",
        "total_waste",
        "efficiency_rate",
    )
    list_filter = ("total_raw_in", "date")
    search_fields = ("warehouse__categories",)
    ordering = ("-date",)
