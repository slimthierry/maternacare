"""Custom exception classes for MaternaCare."""

from fastapi import HTTPException, status


class MaternaCareException(HTTPException):
    """Base exception for MaternaCare."""

    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundException(MaternaCareException):
    """Resource not found."""

    def __init__(self, resource: str, identifier: str | int):
        super().__init__(
            detail=f"{resource} with identifier '{identifier}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class UnauthorizedException(MaternaCareException):
    """Authentication failed."""

    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ForbiddenException(MaternaCareException):
    """Permission denied."""

    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class ConflictException(MaternaCareException):
    """Resource conflict (e.g., duplicate IPP)."""

    def __init__(self, detail: str):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_409_CONFLICT,
        )


class ValidationException(MaternaCareException):
    """Business logic validation error."""

    def __init__(self, detail: str):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
