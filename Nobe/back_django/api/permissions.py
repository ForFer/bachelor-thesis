from rest_framework import permissions


class IsGetOrHasToken(permissions.BasePermission):
    """
        If the method is POST with valid token, or GET, request is valid
    """

    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        elif request.method == 'POST':
            return request.user and request.user.is_authenticated
