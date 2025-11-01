# Guía de Despliegue

Esta guía describe cómo desplegar el sistema de registro de participantes en AWS.

## Requisitos Previos

1. **AWS CLI configurado**
   ```bash
   aws configure
   ```

2. **AWS SAM CLI instalado**
   ```bash
   # macOS
   brew install aws-sam-cli

   # Windows (con Chocolatey)
   choco install aws-sam-cli

   # Linux
   pip install aws-sam-cli
   ```

3. **Python 3.11+**
   ```bash
   python --version
   ```

4. **Node.js 18+**
   ```bash
   node --version
   npm --version
   ```

## Despliegue del Backend

### 1. Construir la aplicación

```bash
sam build
```

### 2. Desplegar por primera vez

```bash
sam deploy --guided
```

Esto te pedirá:
- Stack Name: `registro-participantes-dev`
- AWS Region: `us-east-1`
- Parameter Stage: `dev`
- Parameter DBMasterUsername: `postgres`
- Parameter DBMasterPassword: `tu-contraseña-segura` (mínimo 8 caracteres)
- Confirm changes before deploy: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Save arguments to configuration file: `Y`

### 3. Despliegues posteriores

```bash
sam build && sam deploy
```

### 4. Obtener la URL de la API

```bash
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

## Configurar la Base de Datos

### 1. Crear las tablas iniciales

Primero, necesitas acceder a la base de datos Aurora. Puedes hacerlo de dos formas:

#### Opción A: Usando RDS Query Editor

1. Ve a RDS Console → Query Editor
2. Conecta usando el secreto creado
3. Ejecuta las migraciones de Alembic

#### Opción B: Bastion Host

1. Crear un EC2 bastion en la misma VPC
2. Conectar al bastion
3. Ejecutar migraciones desde el bastion

### 2. Ejecutar migraciones

```bash
# Local (si tienes acceso a la DB)
cd backend
alembic upgrade head
```

## Despliegue del Frontend

### 1. Configurar variables de entorno

Crear archivo `frontend/.env`:

```bash
VITE_API_URL=https://tu-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
VITE_STAGE=production
```

### 2. Construir el frontend

```bash
cd frontend
npm install
npm run build
```

### 3. Obtener el nombre del bucket

```bash
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

echo $BUCKET_NAME
```

### 4. Subir archivos a S3

```bash
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete
```

### 5. Invalidar caché de CloudFront

```bash
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?DomainName=='$BUCKET_NAME.s3.amazonaws.com']].Id" \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

### 6. Obtener URL de CloudFront

```bash
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
  --output text
```

## Script de Despliegue Completo

Crear un script `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Desplegando Backend..."
sam build
sam deploy

echo "📦 Construyendo Frontend..."
cd frontend
npm run build

echo "📤 Subiendo a S3..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

echo "🔄 Invalidando CloudFront..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?DomainName=='$BUCKET_NAME.s3.amazonaws.com']].Id" \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Despliegue completado!"
echo ""
echo "API URL:"
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text

echo ""
echo "Frontend URL:"
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
  --output text
```

Dar permisos de ejecución:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Monitoreo y Logs

### CloudWatch Logs

Ver logs de Lambda:

```bash
sam logs -n FastAPIFunction --stack-name registro-participantes-dev --tail
```

### X-Ray

1. Ve a AWS X-Ray Console
2. Visualiza traces y service map
3. Identifica cuellos de botella

### CloudWatch Metrics

Ver métricas:
- Lambda invocations
- API Gateway requests
- Aurora connections
- CloudFront requests

## Rollback

Si algo sale mal:

```bash
# Rollback del backend
aws cloudformation rollback-stack --stack-name registro-participantes-dev

# Restaurar versión anterior del frontend
aws s3 sync s3://$BUCKET_NAME-backup/ s3://$BUCKET_NAME/ --delete
```

## Limpieza

Para eliminar todos los recursos:

```bash
# Eliminar stack de CloudFormation
sam delete --stack-name registro-participantes-dev

# Vaciar bucket de S3
aws s3 rm s3://$BUCKET_NAME --recursive
```

## Ambientes

### Desarrollo (dev)

```bash
sam deploy --config-env default
```

### Producción (prod)

```bash
sam deploy --config-env prod
```

## Troubleshooting

### Error: Lambda timeout

Incrementar timeout en `template.yaml`:
```yaml
Globals:
  Function:
    Timeout: 60  # Incrementar de 30 a 60
```

### Error: VPC Lambda no puede acceder a Internet

Verificar que:
1. Lambda está en subnets privadas
2. NAT Gateway está configurado
3. Route tables están correctamente configuradas

### Error: Aurora no acepta conexiones

Verificar:
1. Security Group permite conexiones desde Lambda SG
2. Aurora está en modo disponible
3. Credenciales en Secrets Manager son correctas

## Costos Estimados

### Desarrollo (uso bajo)
- Lambda: ~$5/mes
- Aurora Serverless v2: ~$40/mes (0.5 ACU mínimo)
- API Gateway: ~$3/mes
- CloudFront + S3: ~$2/mes
- **Total: ~$50/mes**

### Producción (uso medio)
- Lambda: ~$20/mes
- Aurora Serverless v2: ~$80/mes (1 ACU promedio)
- API Gateway: ~$10/mes
- CloudFront + S3: ~$5/mes
- **Total: ~$115/mes**

## Optimización de Costos

1. **Aurora Serverless v2**: Ajustar `MinCapacity` a 0.5 ACU en dev
2. **Lambda**: Ajustar memoria según uso real
3. **CloudFront**: Usar cache agresivo
4. **Logs**: Configurar retención a 7 días en dev, 30 en prod
