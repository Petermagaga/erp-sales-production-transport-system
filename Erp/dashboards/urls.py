from django.urls import path
from .views import ExecutiveDashboardView



urlpatterns = [
    path("executive/",ExecutiveDashboardView.as_view()),
]
