"""Authentication service for login and registration."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user_models import User
from app.schemas.auth_schemas import LoginRequest, RegisterRequest, TokenResponse


async def login(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    """Authenticate a user and return a JWT token."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(data.password, user.hashed_password):
        raise UnauthorizedException("Invalid email or password")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role,
        name=user.name,
    )


async def register(db: AsyncSession, data: RegisterRequest) -> User:
    """Register a new user account."""
    # Check for existing email
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise ConflictException(f"User with email '{data.email}' already exists")

    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
        role=data.role,
        service=data.service,
        rpps_number=data.rpps_number,
    )

    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user
