import boto3
from botocore.config import Config
from .config import settings

def _make_client(endpoint: str):
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.minio_root_user,
        aws_secret_access_key=settings.minio_root_password,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )

# Internal client for bucket operations (resolves inside Docker)
internal_client = _make_client(settings.minio_endpoint)

# External client for presigned URL generation (browser-accessible)
external_client = _make_client(settings.minio_external_endpoint)


def generate_presigned_put_url(key: str, expires: int = 300) -> str:
    return external_client.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.minio_bucket, "Key": key},
        ExpiresIn=expires,
    )


def generate_presigned_get_url(key: str, filename: str) -> str:
    return external_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.minio_bucket,
            "Key": key,
            "ResponseContentDisposition": f'attachment; filename="{filename}"',
        },
        ExpiresIn=3600,
    )
