from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Vehicle, TransportRecord


# ================================
# VEHICLE ADMIN
# ================================
@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "plate_number",
        "name",
        "category",
        "driver_name",
        "active",
        "created_at",
    )
    list_filter = ("category", "active")
    search_fields = ("plate_number", "name", "driver_name")
    ordering = ("plate_number",)
    readonly_fields = ("created_at",)


# ================================
# TRANSPORT RECORD ADMIN
# ================================
@admin.register(TransportRecord)
class TransportRecordAdmin(admin.ModelAdmin):
    list_display = (
        "vehicle",
        "date",
        "company",
        "branch",
        "fuel_cost",
        "service_cost",
        "status",
        "created_by",
        "approved_by",
    )

    list_filter = (
        "status",
        "company",
        "branch",
        "date",
        "vehicle__category",
    )

    search_fields = (
        "vehicle__plate_number",
        "vehicle__name",
        "created_by__username",
    )

    ordering = ("-date",)
    date_hierarchy = "date"

    readonly_fields = (
        "created_at",
        "approved_at",
    )

    fieldsets = (
        ("Vehicle Info", {
            "fields": ("vehicle", "date")
        }),
        ("Costs", {
            "fields": ("fuel_cost", "service_cost")
        }),
        ("Details", {
            "fields": ("mechanical_issues",)
        }),
        ("Ownership", {
            "fields": ("company", "branch", "created_by")
        }),
        ("Approval Workflow", {
            "fields": ("status", "approved_by", "approved_at")
        }),
        ("System", {
            "fields": ("created_at",)
        }),
    )

    def get_queryset(self, request):
        """
        Ensure company-based filtering still applies in admin
        """
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(company=request.user.company)
