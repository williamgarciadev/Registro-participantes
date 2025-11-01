#!/bin/bash
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stack name
STACK_NAME=${STACK_NAME:-"registro-participantes-dev"}

echo -e "${GREEN}🚀 Iniciando despliegue de Registro de Participantes${NC}"
echo ""

# Desplegar Backend
echo -e "${YELLOW}📦 Construyendo Backend...${NC}"
sam build

echo -e "${YELLOW}🚀 Desplegando Backend a AWS...${NC}"
sam deploy

# Obtener outputs de CloudFormation
echo -e "${YELLOW}📋 Obteniendo información de despliegue...${NC}"

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

echo -e "${GREEN}✅ Backend desplegado exitosamente${NC}"
echo -e "API URL: ${API_URL}"
echo ""

# Desplegar Frontend
echo -e "${YELLOW}📦 Construyendo Frontend...${NC}"
cd frontend

# Crear archivo .env con la URL de la API
cat > .env << EOF
VITE_API_URL=${API_URL}
VITE_STAGE=production
EOF

npm install
npm run build

echo -e "${YELLOW}📤 Subiendo Frontend a S3...${NC}"
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

# Invalidar caché de CloudFront
echo -e "${YELLOW}🔄 Invalidando caché de CloudFront...${NC}"
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Origins.Items[].DomainName, '$BUCKET_NAME')].Id" \
  --output text)

if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" > /dev/null
  echo -e "${GREEN}✅ Caché de CloudFront invalidado${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✅ ¡Despliegue completado exitosamente!${NC}"
echo ""
echo "================================================"
echo -e "${GREEN}📍 URLs del Sistema${NC}"
echo "================================================"
echo -e "API Backend:  ${YELLOW}${API_URL}${NC}"
echo -e "Frontend:     ${YELLOW}https://${CLOUDFRONT_URL}${NC}"
echo -e "API Docs:     ${YELLOW}${API_URL}/docs${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}📊 Para ver los logs:${NC}"
echo "  sam logs -n FastAPIFunction --stack-name $STACK_NAME --tail"
echo ""
echo -e "${YELLOW}🗑️  Para eliminar el stack:${NC}"
echo "  sam delete --stack-name $STACK_NAME"
echo ""
