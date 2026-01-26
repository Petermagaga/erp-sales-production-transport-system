from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied

class ModulePermission(BasePermission):
    MODULE_ROLES = {
        "transport": ["admin", "transporter"],
        "warehouse": ["admin", "warehouse"],
        "sales": ["admin", "sales"],
        "marketing": ["admin", "marketing"],
        "milling": ["admin", "milling"],   # ✅ ADD THIS
        "production": ["admin", "production"],
    }

    def has_permission(self, request, view):
        user = request.user

        # 🔐 Authentication check → 401
        if not user or user.is_anonymous:
            return False

        # 👑 Admin full access
        if user.is_superuser or user.role == "admin":
            return True

        module = getattr(view, "module_name", None)
        if not module:
            raise PermissionDenied("Module not defined")

        allowed_roles = self.MODULE_ROLES.get(module)

        if allowed_roles is None:
            raise PermissionDenied(f"No permissions configured for module '{module}'")

        # 👀 Read-only allowed
        if request.method in SAFE_METHODS:
            return True

        # 🧨 Delete protection
        if request.method == "DELETE":
            raise PermissionDenied("Only admins can delete")

        # ✍️ Write permission
        if user.role not in allowed_roles:
            raise PermissionDenied("You do not have permission to modify this module")

        return True

class IsownerOrAdmin(BasePermission):
    """
    object-level permission:
    -Admin: full access
    Owner: edit/delete
    Others: read-only   
    """
    def has_object_permission(self,request,view,obj):
        user=request.user
        
        if user.is_superuser or user.role =="admin":
            return True
        if request.method in SAFE_METHODS:
            return True
        
        return hasattr(obj,"created_by") and obj.created_by ==user



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


from rest_framework.permissions import BasePermission, SAFE_METHODS

class ApprovalWorkflowPermission(BasePermission):
    """
    - Draft: owner can edit
    - Pending: owner cannot edit
    - Approved: locked (admin only)
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin override
        if user.is_superuser or user.role == "admin":
            return True

        # Read-only always allowed
        if request.method in SAFE_METHODS:
            return True

        # Draft → owner can edit
        if obj.status == "draft":
            return obj.created_by == user

        # Pending or Approved → no edits
        return False



class BaseModulePermission(BasePermission):
    """
    🔐 Smart module permission system

    - Admin: full access
    - Read-only for authenticated users
    - Write access based on module → role mapping
    - NEVER returns 401 for permission errors
    """

    MODULE_ROLES = {
        "sales": ["admin", "sales"],
        "warehouse": ["admin", "warehouse"],
        "production": ["admin", "production"],
        "milling": ["admin", "milling"],
        "transport": ["admin", "transporter"],
        "marketing": ["admin", "marketing"],
    }

    def has_permission(self, request, view):
        user = request.user

        # 🔐 Authentication check → 401
        if not user or user.is_anonymous:
            return False

        # 👑 Admin override
        if user.is_superuser or user.role == "admin":
            return True

        # 🔍 Auto-detect module
        module = getattr(view, "module_name", None)

        if not module:
            # Missing module should NEVER break auth
            raise PermissionDenied("Module not specified for this endpoint")

        allowed_roles = self.MODULE_ROLES.get(module)

        if not allowed_roles:
            # Module not configured → safe failure
            raise PermissionDenied(
                f"Access rules not configured for module '{module}'"
            )

        # 👀 Read-only always allowed
        if request.method in SAFE_METHODS:
            return True

        # ❌ Delete locked to admin
        if request.method == "DELETE":
            raise PermissionDenied("Only admins may delete records")

        # ✍️ Write access
        if user.role not in allowed_roles:
            raise PermissionDenied(
                f"Role '{user.role}' cannot modify '{module}' module"
            )

        return True
