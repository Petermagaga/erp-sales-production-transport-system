from rest_framework.permissions import BasePermission


class IsExecutive(BasePermission):
    """
    CEO/Admin/Superv

    """

    def has_permission(self,request,view):
        user=request.user

        return (
            user.is_authenticated and
            (
                user.is_superuser or user.role== "admin"
            )
        )
    

    