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

def get_content_type(file_path):
    """Obtener MIME type correcto para cada archivo"""
    ext = str(file_path).lower()

    # MIME types explícitos para archivos críticos
    mime_types = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.map': 'application/json'
    }

    # Buscar por extensión
    for ext_key, mime in mime_types.items():
        if ext.endswith(ext_key):
            return mime

    # Por defecto
    guessed, _ = mimetypes.guess_type(str(file_path))
    return guessed or 'application/octet-stream'

def upload_directory(local_path, s3_prefix=''):
    """Subir todos los archivos de un directorio a S3"""
    for root, dirs, files in os.walk(local_path):
        for file in files:
            file_path = Path(root) / file
            relative_path = file_path.relative_to(local_path)
            s3_key = f"{s3_prefix}/{relative_path}".lstrip('/').replace('\\', '/')

            # Determinar MIME type
            mime_type = get_content_type(file_path)

            # Subir archivo
            try:
                s3_client.upload_file(
                    str(file_path),
                    bucket_name,
                    s3_key,
                    ExtraArgs={'ContentType': mime_type}
                )
                print(f"[+] Uploaded: {s3_key} (type: {mime_type})")
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
