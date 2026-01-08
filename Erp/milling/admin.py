from django.contrib import admin
from .models import MillingBatch

admin.register(MillingBatch)
class MillingBatchAdmin(admin.ModelAdmin):
    list_display = (

        'batch_no',
        "date",
        'shift',
        'maize_milled_kg',
        'premix_kg',
        'bales',
        'expiry_date',
    )

    list_filter = ('shift','date','expiry_date')
    search_fields=('batch_no')

    