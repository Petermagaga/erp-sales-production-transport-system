from django.contrib import admin
from .models import *

admin.site.register([Salesperson, Customer, Product, Batch, Sale, Feedback, Complaint, ProductRecall])
