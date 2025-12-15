from rest_framework import serializers

class RoleAwareSerializer(serializers.ModelSerializer):
    """
    Field-level RBAC:
    - Hide fields
    - Make fields read-only
    - Enforce write protection
    """

    role_field_permissions = {
        # Example:
        # "sales": {
        #     "read_only": ["cost_price"],
        #     "exclude": ["internal_notes"],
        #     "read_only_on_update": ["status"],
        # },
        # "*": {
        #     "read_only": ["created_at"],
        # }
    }

    def get_user(self):
        request = self.context.get("request")
        return request.user if request and request.user.is_authenticated else None

    def get_user_role(self):
        user = self.get_user()
        return user.role if user else None

    def is_admin(self):
        user = self.get_user()
        return user and user.role == "admin"

    def get_role_config(self):
        if self.is_admin():
            return {}

        role = self.get_user_role()
        return (
            self.role_field_permissions.get(role)
            or self.role_field_permissions.get("*", {})
            or {}
        )

    def get_fields(self):
        fields = super().get_fields()

        config = self.get_role_config()

        # ❌ Remove fields
        for field in config.get("exclude", []):
            fields.pop(field, None)

        # 🔒 Always read-only
        for field in config.get("read_only", []):
            if field in fields:
                fields[field].read_only = True

        # 🔒 Read-only only on UPDATE
        if self.instance is not None:
            for field in config.get("read_only_on_update", []):
                if field in fields:
                    fields[field].read_only = True

        return fields

    def validate(self, attrs):
        config = self.get_role_config()

        forbidden_fields = set(
            config.get("read_only", [])
            + (
                config.get("read_only_on_update", [])
                if self.instance is not None else []
            )
        )

        for field in forbidden_fields:
            if field in attrs:
                raise serializers.ValidationError({
                    field: "You do not have permission to modify this field."
                })

        return attrs
