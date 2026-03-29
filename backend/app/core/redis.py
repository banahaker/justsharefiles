import redis.asyncio as aioredis
from .config import settings

redis_client: aioredis.Redis = None

async def init_redis():
    global redis_client
    redis_client = await aioredis.from_url(settings.redis_url, decode_responses=True)

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()

def get_redis() -> aioredis.Redis:
    return redis_client
