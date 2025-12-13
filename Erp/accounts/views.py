from rest_framework import generics,permissions
from rest_framework_simplejwt.views import TokenObtainPairView


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