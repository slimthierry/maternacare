"""User schemas for API responses."""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user fields."""

    email: EmailStr
    name: str
    role: str
    service: str | None = None
    rpps_number: str | None = None


class UserCreate(UserBase):
    """Fields required to create a user."""

    password: str


class UserUpdate(BaseModel):
    """Fields that can be updated."""

    name: str | None = None
    service: str | None = None
    rpps_number: str | None = None
    role: str | None = None


class UserResponse(UserBase):
    """User response with all fields."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Paginated list of users."""

    items: list[UserResponse]
    total: int
    page: int
    page_size: int
