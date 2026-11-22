import os
import boto3
from pathlib import Path
from dotenv import load_dotenv

# Go one directory above backend
env_path = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(env_path)

required = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AWS_S3_BUCKET"
]

for key in required:
    if not os.getenv(key):
        raise ValueError(f"Missing environment variable: {key}")

print("Environment variables loaded!")

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "ap-southeast-2")
)

bucket_name = os.getenv("AWS_S3_BUCKET", "onebox-objects-ayush")

try:
    s3.head_bucket(Bucket=bucket_name)
    print(f"Successfully connected to OneBox S3 bucket '{bucket_name}'!")

except Exception as e:
    print("S3 connection failed!")
    print("Error type:", type(e).__name__)
    print("Error details:", repr(e))