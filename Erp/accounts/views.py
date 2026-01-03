from rest_framework import generics,permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view,permission_classes
from  rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    MyTokenObtainPairSerializer,
    AuditLogSerializer,
)

from .models import User,Company
from auditt.models import AuditLog
import csv
from django.http import HttpResponse

from .permissions import ModulePermission

from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

from rest_framework.views import APIView
from rest_framework import status 

class RegisterView(generics.CreateAPIView):
    queryset=User.objects.all()
    permission_classes=[permissions.AllowAny]
    serializer_class= RegisterSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class=UserSerializer
    permission_classes=[permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    

class MyTokenObtainPairView(TokenObtainPairView):

    serializer_class=MyTokenObtainPairSerializer
    permission_classes=[permissions.AllowAny]


@api_view(['GET'])
@permission_classes([IsAdminUser])
def pending_users(request):
    users=User.objects.filter(is_active=False)
    data=[{
        "id":u.id,
        "username":u.username,
        "email":u.email,
        "role":u.role,
        "created_at":u.date_joined,
    }for u in users]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_user(request,user_id):
    try:
        user=User.objects.get(id=user_id)
        user.is_active = True
        user.save()
        return Response({"message":"User approved"})
    except User.DoesNotExist:
        return Response({"error": "User not found"},status=404)
    

@api_view(["GET"])
@permission_classes([IsAdminUser])
def list_users(request):
    users=User.objects.all().order_by("-date_joined")
    serializer= UserSerializer(users,many=True)
    return Response(serializer.data)

from .utils import log_action

@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def update_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    old_data = {
        "role": user.role,
        "is_active": user.is_active,
    }

    role = request.data.get("role")
    is_active = request.data.get("is_active")

    if role:
        user.role = role

    if is_active is not None:
        user.is_active = is_active

    user.save()

    log_action(
        user=request.user,
        action="UPDATE",
        module="users",
        model_name="User",
        object_id=user.id,
        old_data=old_data,
        new_data={
            "role": user.role,
            "is_active": user.is_active,
        },
        request=request,
    )

    return Response({"message": "User updated"})


class AuditLogListView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        qs = AuditLog.objects.all().order_by("-created_at")

        action = self.request.query_params.get("action")
        module = self.request.query_params.get("module")
        user = self.request.query_params.get("user")

        if action:
            qs = qs.filter(action=action)
        if module:
            qs = qs.filter(module=module)
        if user:
            qs = qs.filter(user__email__icontains=user)

        return qs
    

@api_view(["GET"])
@permission_classes([IsAdminUser])
def export_audit_logs_csv(request):
    logs = AuditLog.objects.all().order_by("-created_at")

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="audit_logs.csv"'

    writer = csv.writer(response)
    writer.writerow([
        "User",
        "Action",
        "Module",
        "Model",
        "Object ID",
        "Old Data",
        "New Data",
        "IP Address",
        "Date",
    ])

    for log in logs:
        writer.writerow([
            log.user.email if log.user else "",
            log.action,
            log.module,
            log.model_name,
            log.object_id,
            log.old_data,
            log.new_data,
            log.ip_address,
            log.created_at,
        ])

    return response


@api_view(["GET"])
@permission_classes([IsAdminUser])
def export_audit_logs_pdf(request):
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="audit_logs.pdf"'

    doc = SimpleDocTemplate(response, pagesize=A4)

    logs = AuditLog.objects.all().order_by("-created_at")[:500]

    data = [["User", "Action", "Module", "Date"]]

    for log in logs:
        data.append([
            log.user.email if log.user else "",
            log.action,
            log.module,
            log.created_at.strftime("%Y-%m-%d %H:%M"),
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.grey),
        ("GRID", (0,0), (-1,-1), 0.5, colors.black),
        ("FONTSIZE", (0,0), (-1,-1), 8),
    ]))

    doc.build([table])
    return response

class SignUpView(APIView):
    permission_classes=[]


    def post(self,request):
        company=Company.objects.create(
            name=request.data["company_name"]

        )

        user=User.objects.create_user(
            username=request.data["email"],
            email=request.data["email"],
            password=request.data["password"],
            role="admin",
            company=company
        )


        return Response({"success":True},status=status.HTTP_201_CREATED)