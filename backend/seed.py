"""Seed script: create tables and insert default admin user."""

import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config.settings import settings
from app.models import Base, User
from app.auth.security import hash_password


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("\n--- Tables created ---\n")

    # Seed admin user
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        result = await session.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": "admin@maternacare.dev"},
        )
        if result.scalar_one_or_none():
            print("Admin user already exists, skipping.")
        else:
            admin = User(
                email="admin@maternacare.dev",
                name="Administrateur",
                hashed_password=hash_password("admin123"),
                role="admin",
                service="Administration",
            )
            session.add(admin)
            await session.commit()
            print("Admin user created:")
            print(f"  email:    admin@maternacare.dev")
            print(f"  password: admin123")
            print(f"  role:     admin")

        # Seed a gynecologist for testing
        result = await session.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": "dr.dupont@maternacare.dev"},
        )
        if result.scalar_one_or_none():
            print("Gynecologist user already exists, skipping.")
        else:
            gynecologue = User(
                email="dr.dupont@maternacare.dev",
                name="Dr. Marie Dupont",
                hashed_password=hash_password("medecin123"),
                role="gynecologue",
                service="Gynécologie-Obstétrique",
                rpps_number="10000000001",
            )
            session.add(gynecologue)
            await session.commit()
            print("Gynecologist user created:")
            print(f"  email:    dr.dupont@maternacare.dev")
            print(f"  password: medecin123")
            print(f"  role:     gynecologue")

    await engine.dispose()
    print("\n--- Seed complete ---")


if __name__ == "__main__":
    asyncio.run(seed())
