from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .core.config import settings
from .core.db import init_db, close_db, get_pool
from .core.redis import init_redis, close_redis
from .routers.files import router as files_router

scheduler = AsyncIOScheduler()

async def cleanup_expired_files():
    pool = get_pool()
    if pool:
        async with pool.acquire() as conn:
            deleted = await conn.execute("DELETE FROM shared_files WHERE expires_at < NOW()")
            print(f"Cleanup: {deleted}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await init_redis()
    scheduler.add_job(cleanup_expired_files, "interval", hours=1)
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown()
    await close_db()
    await close_redis()

app = FastAPI(title="SecureShare", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files_router, prefix="/api/files")
