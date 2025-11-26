from django.db import models
from django.utils import timezone


# ================================
# 1️⃣  COMMON BASE MODELS
# ================================
class TimeStampedModel(models.Model):
    """Abstract base model with created/updated timestamps."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ================================
# 2️⃣  SALES & MARKETING ENTITIES
# ================================
class Salesperson(TimeStampedModel):
    """Company sales and marketing personnel."""
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.region})" if self.region else self.name


class Customer(TimeStampedModel):
    """Stores customer or shop details."""
    CATEGORY_CHOICES = [
        ('walk_in', 'Walk-in Customer'),
        ('retail', 'Retail Shop'),
        ('wholesale', 'Wholesale'),
    ]

    name = models.CharField(max_length=100)
    shop_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    location = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='retail')

    def __str__(self):
        return f"{self.shop_name} ({self.location})"


class Product(TimeStampedModel):
    """Product catalog."""
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True, null=True)
    unit = models.CharField(max_length=20, default='pcs')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name}"


class Batch(TimeStampedModel):
    """Tracks production batches."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=50, unique=True)
    manufacture_date = models.DateField()
    expiry_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - Batch {self.batch_number}"


# ================================
# 3️⃣  SALES TRACKING
# ================================
class Sale(TimeStampedModel):
    date = models.DateField(default=timezone.now)
    salesperson = models.ForeignKey(Salesperson, on_delete=models.SET_NULL, null=True, related_name='sales')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name='sales')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='sales')
    batch_number = models.ForeignKey(Batch ,blank=True, null=True,on_delete=models.SET_NULL,related_name="sales")
    quantity = models.PositiveIntegerField(default=1)

    # Auto-filled fields
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    location = models.CharField(max_length=100, blank=True, null=True)

    def save(self, *args, **kwargs):
        # 1️⃣ Copy price automatically from Product
        if self.product:
            self.unit_price = self.product.unit_price

        # 2️⃣ Auto calculate total
        self.total_amount = self.quantity * self.unit_price

        super().save(*args, **kwargs)

# ================================
# 4️⃣  MARKETING & FEEDBACK
# ================================
class Feedback(TimeStampedModel):
    """Customer or market feedback (merged from product + marketing)."""
    FEEDBACK_TYPE_CHOICES = [
        ('product', 'Product Feedback'),
        ('market', 'Market Feedback'),
    ]
    VISIBILITY_CHOICES = [
        ('good', 'Good'),
        ('average', 'Average'),
        ('poor', 'Poor'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES)
    shelf_visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    remark = models.TextField(blank=True, null=True)
    feedback_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.product} - {self.feedback_type}"


# ================================
# 5️⃣  COMPLAINTS & RECALLS
# ================================
class Complaint(TimeStampedModel):
    """Tracks customer complaints and resolutions."""
    STATUS_CHOICES = [
        ('open', 'Open'),
        
        ('pending', 'Pending'),

        ('closed', 'Closed'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name='complaints')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='complaints')
    batch_number = models.ForeignKey(Batch, blank=True, null=True,on_delete=models.SET_NULL,related_name="complaints")
    description = models.TextField()
    effect_assessed = models.TextField(blank=True, null=True)
    resolution = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    reported_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"Complaint: {self.product} ({self.customer})"


class ProductRecall(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='recalls')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name='recalls')

    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='recalls')

    quantity_recalled = models.PositiveIntegerField()
    amount_value = models.DecimalField(max_digits=12, decimal_places=2)
    recall_reason = models.TextField(blank=True, null=True)
    resolved = models.BooleanField(default=False)
    resolution_notes = models.TextField(blank=True, null=True)
    recall_date = models.DateField(default=timezone.now)
    resolved_date = models.DateField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Auto-calculate amount_value = product.price * quantity_recalled
        if self.product and self.quantity_recalled:
            self.amount_value = self.product.price * self.quantity_recalled

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Recall {self.product.name} - Batch {self.batch}"
