# accounts/urls.py
from django.urls import path
from .views import (pending_users,approve_user,RegisterView,
                     MyTokenObtainPairView, MeView,list_users,
                     update_user,AuditLogListView, export_audit_logs_csv,
                     export_audit_logs_pdf,SignUpView)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path("pending-users/",pending_users),
    path("approve-user/<int:user_id>/",approve_user),
    path("users/",list_users),
    path("users/<int:user_id>/",update_user),
    path("audit-logs/",AuditLogListView.as_view()),
    path("audit-logs/export/csv/", export_audit_logs_csv),
    path("audit-logs/export/pdf/", export_audit_logs_pdf),
    path("signup/",SignUpView.as_view())

]
