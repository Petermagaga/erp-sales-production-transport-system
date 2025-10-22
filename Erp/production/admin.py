# production/admin.py
from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from django.utils.html import format_html
from django.urls import reverse
from . import views
from .models import RawMaterial, FlourOutput

@admin.register(RawMaterial)
class RawMaterialAdmin(admin.ModelAdmin):
    list_display = ('date', 'shift', 'maize_kg', 'soya_kg', 'sugar_kg','sorghum_kg','premix_kg','total_raw_material')

@admin.register(FlourOutput)
class FlourOutputAdmin(admin.ModelAdmin):
    list_display = (
        'date', 'shift', 'product_name',
        'total_bags', 'spillage_kg', 'germ_kg', 'chaff_kg', 'waste_kg', 'efficiency'
    )

    def efficiency_rate_display(self, obj):
        """Display stored efficiency_rate nicely formatted."""
        if obj.efficiency_rate is not None:
            return f"{obj.efficiency_rate:.2f} %"
        return "-"

    efficiency_rate_display.short_description = "Efficiency (%)"

class ProductionAdminSite(admin.AdminSite):
    site_header = "Factory Management Dashboard"
    site_title = "Factory Admin"
    index_title = "Production Control Panel"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('upload-excel/', self.admin_view(views.upload_excel), name='upload_excel_admin'),
        ]
        return custom_urls + urls

# Create a global instance of your custom Admin site
production_admin_site = ProductionAdminSite(name='production_admin')
