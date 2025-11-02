#!/usr/bin/env python3
"""Script para subir frontend a S3"""

import boto3
import os
from pathlib import Path
import mimetypes
import sys

# Fix encoding en Windows
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

bucket_name = 'registro-participantes-dev-frontend-380012739300'
dist_path = Path(__file__).parent.parent / 'frontend' / 'dist'
region = 'us-east-1'

s3_client = boto3.client('s3', region_name=region)

def upload_directory(local_path, s3_prefix=''):
    """Subir todos los archivos de un directorio a S3"""
    for root, dirs, files in os.walk(local_path):
        for file in files:
            file_path = Path(root) / file
            relative_path = file_path.relative_to(local_path)
            s3_key = f"{s3_prefix}/{relative_path}".lstrip('/')

            # Determinar MIME type
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type is None:
                mime_type = 'application/octet-stream'

            # Subir archivo
            try:
                s3_client.upload_file(
                    str(file_path),
                    bucket_name,
                    s3_key,
                    ExtraArgs={'ContentType': mime_type}
                )
                print(f"[+] Uploaded: {s3_key}")
            except Exception as e:
                print(f"[-] Error uploading {s3_key}: {e}")

def main():
    if not dist_path.exists():
        print(f"Error: {dist_path} no existe")
        return

    print(f"Subiendo {dist_path} a s3://{bucket_name}/...")
    upload_directory(dist_path)
    print("¡Upload completado!")
    print(f"\nAccede a: https://d3tfsu5pihpnue.cloudfront.net/")

if __name__ == '__main__':
    main()
