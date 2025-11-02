#!/usr/bin/env python3
"""Script para invalidar caché de CloudFront"""

import boto3
import sys

# CloudFront Domain
cloudfront_domain = 'd3tfsu5pihpnue.cloudfront.net'

# Obtener CloudFront client
cf_client = boto3.client('cloudfront', region_name='us-east-1')

try:
    # Listar distribuciones
    response = cf_client.list_distributions()

    distribution_id = None
    for dist in response['DistributionList']['Items']:
        # Buscar la distribución que apunta a nuestro dominio
        if any(cloudfront_domain in alias or dist['DomainName'] == cloudfront_domain
               for alias in dist.get('Aliases', {}).get('Items', [])):
            distribution_id = dist['Id']
            break
        # También buscar por el domain name
        if cloudfront_domain in dist['DomainName']:
            distribution_id = dist['Id']
            break

    if not distribution_id:
        # Si no encontramos por dominio, buscar por bucket en el origen
        for dist in response['DistributionList']['Items']:
            if 'registro-participantes-dev-frontend' in str(dist.get('Origins', {}).get('Items', [])):
                distribution_id = dist['Id']
                break

    if not distribution_id:
        print("Error: No se encontró la distribución de CloudFront")
        print("Distribuciones disponibles:")
        for dist in response['DistributionList']['Items']:
            print(f"  - {dist['Id']}: {dist['DomainName']}")
        sys.exit(1)

    print(f"Distribution ID encontrado: {distribution_id}")

    # Crear invalidación
    print("Invalidando caché...")
    invalidation = cf_client.create_invalidation(
        DistributionId=distribution_id,
        InvalidationBatch={
            'Paths': {
                'Quantity': 1,
                'Items': ['/*']
            },
            'CallerReference': str(int(__import__('time').time()))
        }
    )

    print(f"[+] Invalidación creada: {invalidation['Invalidation']['Id']}")
    print(f"[+] Estado: {invalidation['Invalidation']['Status']}")
    print(f"\nEl caché será limpiado en 1-2 minutos.")

except Exception as e:
    print(f"[-] Error: {e}")
    sys.exit(1)
