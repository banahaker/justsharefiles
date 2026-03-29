from fastapi import HTTPException
import redis.asyncio as aioredis

async def check_rate_limit(redis: aioredis.Redis, key_type: str, ip: str, limit: int) -> None:
    key = f"ratelimit:{key_type}:{ip}"
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, 60)
    if count > limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")
