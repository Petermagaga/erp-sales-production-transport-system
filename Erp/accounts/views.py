from rest_framework import generics,permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view,permission_classes
from  rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    MyTokenObtainPairSerializer,
)

from .models import User

from .permissions import ModulePermission

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

@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def update_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    role = request.data.get("role")
    is_active = request.data.get("is_active")

    if role:
        user.role = role

    if is_active is not None:
        user.is_active = is_active

    user.save()
    return Response({"message": "User updated"})
