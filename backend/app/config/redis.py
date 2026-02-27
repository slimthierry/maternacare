"""Redis configuration and connection management."""

import redis.asyncio as aioredis

from app.config.settings import settings

redis_client = aioredis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
)


async def get_redis() -> aioredis.Redis:
    """Dependency that provides a Redis connection."""
    return redis_client
