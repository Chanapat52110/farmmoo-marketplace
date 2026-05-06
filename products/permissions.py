from rest_framework.permissions import BasePermission


class IsSeller(BasePermission):
    """Grants access to users with role 'seller' or legacy 'farmer'."""

    message = 'ต้องเป็นผู้ขายเท่านั้น'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role in ('seller', 'farmer')
        )
