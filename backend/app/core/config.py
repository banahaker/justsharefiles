from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    minio_endpoint: str = "http://minio:9000"
    minio_external_endpoint: str = "http://localhost:9000"
    minio_root_user: str
    minio_root_password: str
    minio_bucket: str = "uploads"
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
