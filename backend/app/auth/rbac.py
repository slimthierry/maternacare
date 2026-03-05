"""Role-Based Access Control (RBAC) for MaternaCare."""

from enum import Enum
from functools import wraps
from typing import Callable

from fastapi import HTTPException, status


class Role(str, Enum):
    """User roles in the system."""

    ADMIN = "admin"
    GYNECOLOGUE = "gynecologue"
    SAGE_FEMME = "sage_femme"
    PEDIATRE = "pediatre"
    INFIRMIER = "infirmier"
    PATIENTE = "patiente"


# Permission matrix: role -> allowed actions
ROLE_PERMISSIONS: dict[Role, set[str]] = {
    Role.ADMIN: {
        "users:read",
        "users:write",
        "users:delete",
        "patients:read",
        "patients:write",
        "patients:delete",
        "pregnancies:read",
        "pregnancies:write",
        "consultations:read",
        "consultations:write",
        "ultrasounds:read",
        "ultrasounds:write",
        "deliveries:read",
        "deliveries:write",
        "newborns:read",
        "newborns:write",
        "postpartum:read",
        "postpartum:write",
        "alerts:read",
        "alerts:write",
        "alerts:acknowledge",
        "audit:read",
        "dashboard:read",
        "fhir:read",
        "webhooks:manage",
    },
    Role.GYNECOLOGUE: {
        "patients:read",
        "patients:write",
        "pregnancies:read",
        "pregnancies:write",
        "consultations:read",
        "consultations:write",
        "ultrasounds:read",
        "ultrasounds:write",
        "deliveries:read",
        "deliveries:write",
        "newborns:read",
        "postpartum:read",
        "postpartum:write",
        "alerts:read",
        "alerts:acknowledge",
        "dashboard:read",
        "fhir:read",
    },
    Role.SAGE_FEMME: {
        "patients:read",
        "patients:write",
        "pregnancies:read",
        "consultations:read",
        "consultations:write",
        "ultrasounds:read",
        "deliveries:read",
        "deliveries:write",
        "newborns:read",
        "postpartum:read",
        "postpartum:write",
        "alerts:read",
        "alerts:acknowledge",
        "dashboard:read",
    },
    Role.PEDIATRE: {
        "patients:read",
        "pregnancies:read",
        "deliveries:read",
        "newborns:read",
        "newborns:write",
        "alerts:read",
        "alerts:acknowledge",
        "dashboard:read",
    },
    Role.INFIRMIER: {
        "patients:read",
        "pregnancies:read",
        "consultations:read",
        "consultations:write",
        "postpartum:read",
        "postpartum:write",
        "alerts:read",
        "dashboard:read",
    },
    Role.PATIENTE: {
        "pregnancies:read",
        "consultations:read",
        "ultrasounds:read",
        "alerts:read",
    },
}


def has_permission(role: Role, permission: str) -> bool:
    """Check if a role has a specific permission."""
    return permission in ROLE_PERMISSIONS.get(role, set())


def require_permissions(*permissions: str) -> Callable:
    """Decorator to require specific permissions for an endpoint."""

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get("current_user")
            if current_user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )

            user_role = Role(current_user.role)
            for permission in permissions:
                if not has_permission(user_role, permission):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Permission denied: {permission} required",
                    )

            return await func(*args, **kwargs)

        return wrapper

    return decorator
