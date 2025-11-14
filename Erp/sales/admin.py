from django.contrib import admin
from .models import *

from django.contrib import admin

# Customize the admin site text
admin.site.site_header = "Unibrain Industries Administration"
admin.site.site_title = "Unibrain Admin Portal"
admin.site.index_title = "Welcome to Unibrain Industries Admin"

admin.site.register([Salesperson, Customer, Product, Batch, Sale, Feedback, Complaint, ProductRecall])
