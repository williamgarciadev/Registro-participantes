# ⚡ Comandos Rápidos para AWS

Copia y pega estos comandos para acelerar tu flujo de trabajo.

---

## 🔧 Configuración Inicial

### Instalar AWS CLI (si no lo tienes)
```bash
# Windows (PowerShell)
# Descargar desde: https://awscli.amazonaws.com/AWSCLIV2.msi

# macOS
brew install awscli

# Linux
pip install awscli
```

### Instalar AWS SAM CLI
```bash
# Windows
# Descargar desde: https://github.com/aws/aws-sam-cli/releases

# macOS
brew install aws-sam-cli

# Linux
pip install aws-sam-cli
```

### Configurar AWS CLI
```bash
# Configuración inicial (pedir Access Key ID y Secret)
aws configure

# Verificar que funcionó
aws sts get-caller-identity
```

---

## 🚀 Despliegue Rápido

### Script Automático (Recomendado)
```bash
# macOS/Linux
bash scripts/setup-aws.sh

# Windows PowerShell
.\scripts\setup-aws.ps1
```

### Despliegue Manual Paso a Paso
```bash
# 1. Construir backend
sam build

# 2. Desplegar backend (primera vez con --guided)
sam deploy --guided
# O después (sin guided)
sam deploy

# 3. Configurar variables
export API_URL="https://xxxxx.execute-api.us-east-1.amazonaws.com/dev"
export BUCKET_NAME="registro-participantes-xxxxx"
export DIST_ID="E1234567890ABC"

# 4. Desplegar frontend
cd frontend
npm install
npm run build
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

# 5. Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

# Ver progreso
aws cloudfront get-invalidation --distribution-id $DIST_ID --id [id-de-invalidation]
```

---

## 📊 Obtener Información de Deployments

### Stack Name
```bash
# Listar todos los stacks
aws cloudformation list-stacks --query 'StackSummaries[0:5]'

# O usa el nombre fijo
STACK_NAME="registro-participantes-dev"
```

### URLs Importantes
```bash
STACK_NAME="registro-participantes-dev"

# API URL
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text

# Frontend Bucket
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text

# CloudFront URL
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
  --output text

# Todos los outputs
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs' \
  --output table
```

### Distribution ID de CloudFront
```bash
# Obtener el primer distribution ID
aws cloudfront list-distributions \
  --query "DistributionList.Items[0].Id" \
  --output text
```

### Información de Aurora
```bash
STACK_NAME="registro-participantes-dev"

# Endpoint del cluster
aws rds describe-db-clusters \
  --query 'DBClusters[0].Endpoint' \
  --output text

# Status del cluster
aws rds describe-db-clusters \
  --query 'DBClusters[0].Status' \
  --output text

# Información completa
aws rds describe-db-clusters --output table
```

### Credenciales de BD
```bash
# Obtener secreto
aws secretsmanager get-secret-value \
  --secret-id registro-participantes-dev-db-credentials \
  --query 'SecretString' | python -m json.tool

# O solo el host
aws secretsmanager get-secret-value \
  --secret-id registro-participantes-dev-db-credentials \
  --query 'SecretString' \
  --output text | jq '.host'
```

---

## 🧪 Testing

### Health Check
```bash
API_URL=$(aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

curl $API_URL/health
```

### Crear Participante (cURL)
```bash
curl -X POST $API_URL/api/v1/participantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "telefono": "+1234567890"
  }'
```

### Listar Participantes
```bash
curl $API_URL/api/v1/participantes
```

### Buscar Participantes
```bash
curl "$API_URL/api/v1/participantes/search?q=juan"
```

### Actualizar Participante
```bash
PARTICIPANTE_ID="uuid-aqui"

curl -X PUT $API_URL/api/v1/participantes/$PARTICIPANTE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos"
  }'
```

### Eliminar Participante
```bash
curl -X DELETE $API_URL/api/v1/participantes/$PARTICIPANTE_ID
```

---

## 📋 Logs y Monitoreo

### Ver Logs en Vivo
```bash
STACK_NAME="registro-participantes-dev"

# Con SAM
sam logs -n FastAPIFunction --stack-name $STACK_NAME --tail

# Con AWS CLI
aws logs tail /aws/lambda/$STACK_NAME-FastAPIFunction --follow
```

### Ver Últimos N Logs
```bash
aws logs tail /aws/lambda/registro-participantes-dev-FastAPIFunction --max-items 20
```

### Buscar en Logs
```bash
# Por palabra clave
aws logs filter-log-events \
  --log-group-name /aws/lambda/registro-participantes-dev-FastAPIFunction \
  --filter-pattern "ERROR"
```

### CloudWatch Dashboard
```bash
# Listar dashboards
aws cloudwatch list-dashboards

# Obtener detalles
aws cloudwatch get-dashboard \
  --dashboard-name registration-system \
  --query 'DashboardBody' | jq .
```

### CloudWatch Metrics
```bash
# Listar métricas
aws cloudwatch list-metrics \
  --namespace AWS/Lambda \
  --metric-name Duration

# Obtener datos
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### X-Ray Traces
```bash
# Obtener service map
aws xray get-service-graph \
  --start-time 1609459200 \
  --end-time 1609545600

# Listar traces
aws xray get-trace-summaries \
  --start-time 1609459200 \
  --end-time 1609545600
```

---

## 🗄️ Base de Datos

### Conectar a Aurora (con Query Editor)
```bash
# 1. Abre en AWS Console:
# RDS → Databases → registro-participantes → Query Editor

# O desde AWS CLI:
aws rds-data execute-statement \
  --resource-arn "arn:aws:rds:us-east-1:ACCOUNT:cluster:registro-participantes" \
  --database "participantes" \
  --secret-arn "arn:aws:secretsmanager:..." \
  --sql "SELECT * FROM participantes LIMIT 10;"
```

### Ver Tablas
```sql
-- Ejecutar en RDS Query Editor
\dt
```

### Ver Estructura de Tabla
```sql
\d+ participantes
```

### Contar Registros
```sql
SELECT COUNT(*) FROM participantes;
```

### Crear Tabla (si no existe)
```bash
# Ejecutar el script SQL
cat scripts/init-database.sql | \
  aws rds-data execute-statement \
    --resource-arn "arn:aws:rds:us-east-1:ACCOUNT:cluster:registro-participantes" \
    --database "participantes" \
    --secret-arn "arn:aws:secretsmanager:..." \
    --sql "file://scripts/init-database.sql"
```

### Backup Manual
```bash
# Crear snapshot
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier registro-participantes \
  --db-cluster-snapshot-identifier registro-participantes-manual-$(date +%Y%m%d)

# Listar snapshots
aws rds describe-db-cluster-snapshots
```

---

## 🚀 Despliegues Posteriores

### Backend - Después de cambios
```bash
# Build + Deploy
sam build && sam deploy

# O con opciones
sam build && sam deploy \
  --stack-name registro-participantes-dev \
  --region us-east-1 \
  --no-confirm-changeset
```

### Frontend - Después de cambios
```bash
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[0].Id" \
  --output text)

cd frontend

# Build
npm run build

# Upload
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

# Invalidate
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

# Esperar a que termine
aws cloudfront get-invalidation --distribution-id $DIST_ID --id [INVALIDATION_ID]
```

### Ambos - Script combinado
```bash
#!/bin/bash

# Backend
sam build && sam deploy

# Frontend
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

cd frontend
npm run build
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

echo "✓ Despliegue completado"
```

---

## 🗑️ Limpiar / Eliminar

### Eliminar Stack Completo
```bash
STACK_NAME="registro-participantes-dev"

# Avisar (CUIDADO - esto elimina TODO)
echo "Eliminando stack: $STACK_NAME"

# Eliminar
aws cloudformation delete-stack --stack-name $STACK_NAME

# Esperar a que termine
aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME

echo "Stack eliminado"
```

### Vaciar S3 Bucket
```bash
BUCKET_NAME="tu-bucket-name"

# Eliminar todos los archivos
aws s3 rm s3://$BUCKET_NAME --recursive

# O simplemente sincronizar carpeta vacía
aws s3 sync empty-folder/ s3://$BUCKET_NAME/ --delete
```

### Eliminar Snapshots de Aurora
```bash
# Listar
aws rds describe-db-cluster-snapshots

# Eliminar específico
aws rds delete-db-cluster-snapshot \
  --db-cluster-snapshot-identifier tu-snapshot-id
```

---

## 💰 Costos

### Ver Costos Actuales
```bash
# Últimos 7 días
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

### Crear Budget Alert
```bash
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

---

## 🔒 Seguridad

### Rotar Credenciales DB
```bash
# Obtener credenciales actuales
aws secretsmanager get-secret-value \
  --secret-id registro-participantes-dev-db-credentials

# Actualizar secreto
aws secretsmanager update-secret \
  --secret-id registro-participantes-dev-db-credentials \
  --secret-string '{"username":"postgres","password":"NEW-PASSWORD","...":"..."}'
```

### Habilitar Logging Detallado
```bash
# En Lambda, aumentar verbosidad
export LOG_LEVEL=DEBUG

sam deploy
```

---

## 🐛 Troubleshooting

### ¿Qué fue mal? (Ver eventos del stack)
```bash
aws cloudformation describe-stack-events \
  --stack-name registro-participantes-dev \
  --query 'StackEvents[0:5]' \
  --output table
```

### API Gateway no responde
```bash
# Verificar que Lambda existe
aws lambda list-functions | grep -i registro

# Ver última invocación
sam logs -n FastAPIFunction --tail
```

### Aurora no acepta conexiones
```bash
# Verificar status
aws rds describe-db-clusters \
  --query 'DBClusters[0].[Status,Endpoint]'

# Verificar security group
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*aurora*"
```

### Frontend no carga
```bash
# Verificar que files están en S3
aws s3 ls s3://$BUCKET_NAME/ --recursive

# Esperar propagación de CloudFront (5-10 min)
# O invalidar cache
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"
```

---

## 📈 Performance

### Ver duración promedio de Lambda
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average,Maximum
```

### Ver errores
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

---

## 💡 Tips y Tricks

### Guardar outputs en variables
```bash
# Guardar en .env para usar después
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs' \
  --output json > .aws-outputs.json

# Leer desde .env
source <(jq -r '.[] | "export \(.OutputKey)=\(.OutputValue)"' .aws-outputs.json)
```

### Crear alias para comandos frecuentes
```bash
# Agregar a ~/.bashrc o ~/.zshrc
alias aws-logs="sam logs -n FastAPIFunction --stack-name registro-participantes-dev --tail"
alias aws-api="aws cloudformation describe-stacks --stack-name registro-participantes-dev --query 'Stacks[0].Outputs[?OutputKey==\`ApiUrl\`].OutputValue' --output text"
alias aws-frontend="aws cloudformation describe-stacks --stack-name registro-participantes-dev --query 'Stacks[0].Outputs[?OutputKey==\`CloudFrontUrl\`].OutputValue' --output text"

# Uso:
# aws-logs
# aws-api
# aws-frontend
```

### Watchdog para cambios
```bash
# Monitorear cambios en vivo
watch -n 5 'aws cloudformation describe-stack-events \
  --stack-name registro-participantes-dev \
  --query "StackEvents[0:3]"'
```

---

## 📚 Documentación Oficial

- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [AWS SAM](https://aws.amazon.com/serverless/sam/)
- [Aurora Serverless](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)
- [CloudFront](https://docs.aws.amazon.com/cloudfront/)

---

**Última actualización:** 2024
**Versión:** 1.0
