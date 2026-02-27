"""Authentication schemas."""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    name: str


class RegisterRequest(BaseModel):
    """User registration request."""

    email: EmailStr
    password: str
    name: str
    role: str
    service: str | None = None
    rpps_number: str | None = None
