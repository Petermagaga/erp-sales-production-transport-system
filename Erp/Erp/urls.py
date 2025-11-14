from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    # 🔐 Auth endpoints
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 👤 User-related endpoints (register, profile, etc.)
    path('api/accounts/', include('accounts.urls')),

    # 🧾 Sales module
    path('api/sales/', include('sales.urls')),

    #production
    path('api/production/', include('production.urls')),

    #transport
    
    path('api/transport/',include('transport.urls')),
    path("api/",include('warehouse.urls')),

]
