#!/bin/bash

# Script para configurar AWS en macOS/Linux
# Uso: bash scripts/setup-aws.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AWS Setup - Registro de Participantes${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar prerequisitos
echo -e "${YELLOW}1. Verificando prerequisitos...${NC}"

check_command() {
    if command -v $1 &> /dev/null; then
        version=$($2 2>&1)
        echo -e "${GREEN}✓ $1: $version${NC}"
        return 0
    else
        echo -e "${RED}✗ $1: NO INSTALADO${NC}"
        return 1
    fi
}

missing=0
check_command "python" "python3 --version" || missing=1
check_command "node" "node --version" || missing=1
check_command "npm" "npm --version" || missing=1
check_command "git" "git --version" || missing=1
check_command "docker" "docker --version" || missing=1
check_command "aws" "aws --version" || missing=1
check_command "sam" "sam --version" || missing=1

if [ $missing -eq 1 ]; then
    echo ""
    echo -e "${RED}❌ Algunos prerequisitos no están instalados${NC}"
    echo -e "${YELLOW}Por favor instala los tools faltantes antes de continuar${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Todos los prerequisitos están instalados${NC}"
echo ""

# Verificar AWS CLI
echo -e "${YELLOW}2. Verificando configuración de AWS CLI...${NC}"

if aws sts get-caller-identity &> /dev/null; then
    identity=$(aws sts get-caller-identity)
    account=$(echo $identity | jq -r '.Account')
    arn=$(echo $identity | jq -r '.Arn')

    echo -e "${GREEN}✓ AWS CLI configurado correctamente${NC}"
    echo -e "${CYAN}  Account: $account${NC}"
    echo -e "${CYAN}  ARN: $arn${NC}"
else
    echo -e "${RED}❌ AWS CLI no está configurado${NC}"
    echo ""
    echo -e "${YELLOW}Ejecuta: aws configure${NC}"
    echo -e "${YELLOW}Necesitarás tu Access Key ID y Secret Access Key${NC}"
    exit 1
fi

echo ""

# Construir con SAM
echo -e "${YELLOW}3. Construyendo aplicación con SAM...${NC}"

if ! sam build; then
    echo -e "${RED}❌ Error al construir con SAM${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completado exitosamente${NC}"
echo ""

# Desplegar
echo -e "${YELLOW}4. Desplegando a AWS...${NC}"
echo ""
echo -e "${CYAN}Se abrirá un asistente interactivo. Sigue estos pasos:${NC}"
echo -e "${CYAN}  1. Stack Name: registro-participantes-dev${NC}"
echo -e "${CYAN}  2. Region: us-east-1${NC}"
echo -e "${CYAN}  3. Stage: dev${NC}"
echo -e "${CYAN}  4. DBMasterPassword: tu-contraseña-segura (mín 8 caracteres)${NC}"
echo ""

sam deploy --guided

echo ""
echo -e "${GREEN}✓ Despliegue completado${NC}"
echo ""

# Obtener outputs
echo -e "${YELLOW}5. Obteniendo información del despliegue...${NC}"

STACK_NAME="registro-participantes-dev"

API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
    --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
    --output text)

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}URLs del Despliegue${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${CYAN}API Backend: $API_URL${NC}"
echo -e "${CYAN}Frontend: https://$CLOUDFRONT_URL${NC}"
echo -e "${CYAN}Bucket S3: $BUCKET_NAME${NC}"
echo ""

# Guardar información
cat > .aws-config.json << EOF
{
  "ApiUrl": "$API_URL",
  "BucketName": "$BUCKET_NAME",
  "CloudFrontUrl": "$CLOUDFRONT_URL",
  "StackName": "$STACK_NAME",
  "Region": "us-east-1",
  "Stage": "dev"
}
EOF

echo -e "${GREEN}✓ Configuración guardada en .aws-config.json${NC}"
echo ""

# Desplegar Frontend
echo -e "${YELLOW}6. Desplegando Frontend...${NC}"

cd frontend

if [ ! -d "node_modules" ]; then
    echo "  Instalando dependencias..."
    npm install
fi

echo "  Construyendo..."
npm run build

echo "  Subiendo a S3..."
aws s3 sync dist/ "s3://$BUCKET_NAME/" --delete

cd ..

echo ""
echo -e "${GREEN}✓ Frontend desplegado${NC}"

# Invalidar CloudFront
echo ""
echo -e "${YELLOW}7. Invalidando cache de CloudFront...${NC}"

DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[0].Id" \
    --output text)

aws cloudfront create-invalidation \
    --distribution-id $DIST_ID \
    --paths "/*" > /dev/null

echo -e "${GREEN}✓ Cache invalidado${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Despliegue Completado${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo -e "${CYAN}1. Crea las tablas de BD en RDS Query Editor${NC}"
echo -e "${CYAN}2. Accede al frontend en:${NC}"
echo -e "${CYAN}   https://$CLOUDFRONT_URL${NC}"
echo -e "${CYAN}3. Prueba creando un participante${NC}"
echo ""
echo -e "${YELLOW}Ver logs:${NC}"
echo -e "${CYAN}  sam logs -n FastAPIFunction --stack-name $STACK_NAME --tail${NC}"
echo ""
