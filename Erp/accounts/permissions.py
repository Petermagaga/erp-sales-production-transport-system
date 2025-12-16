from rest_framework.permissions import BasePermission, SAFE_METHODS

class ModulePermission(BasePermission):
    """
    Hybrid Permission:
    - Admin: full access everywhere
    - Role-based access inside module
    - Read-only outside own module
    """

    MODULE_ROLES = {
        "transport": ["admin", "transporter"],
        "warehouse": ["admin", "warehouse"],
        "sales": ["admin", "sales"],
        "marketing": ["admin", "marketing"],
    }

    def has_permission(self, request, view):
        user = request.user

        # Must be authenticated
        if not user or user.is_anonymous:
            return False

        # Admin bypasses restrictions
        if user.is_superuser or user.role == "admin":
            return True

        # View must set a module_name e.g. "sales"
        module = getattr(view, "module_name", None)
        if not module:
            return False

        # Roles allowed to fully modify this module
        allowed_roles = self.MODULE_ROLES.get(module, [])

        # Allow read-only access for everyone
        if request.method in SAFE_METHODS:
            return True

        if request.method == "DELETE" and user.role != "admin":
            return False
        # Only module owners can write
        return user.role in allowed_roles

class AdminDeleteOnly(BasePermission):
    """
    Allows DELETE only for admins
    """

    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_superuser or request.user.role == "admin"
            )
        return True
