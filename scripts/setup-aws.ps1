# Script para configurar AWS en Windows PowerShell
# Uso: .\setup-aws.ps1

Write-Host "========================================" -ForegroundColor Green
Write-Host "AWS Setup - Registro de Participantes" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar prerequisitos
Write-Host "1. Verificando prerequisitos..." -ForegroundColor Yellow

$prereqs = @{
    "Python" = "python --version"
    "Node.js" = "node --version"
    "NPM" = "npm --version"
    "Git" = "git --version"
    "Docker" = "docker --version"
    "AWS CLI" = "aws --version"
    "AWS SAM" = "sam --version"
}

$missing = @()

foreach ($tool in $prereqs.GetEnumerator()) {
    try {
        $result = Invoke-Expression $tool.Value 2>&1
        Write-Host "✓ $($tool.Key): $result" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ $($tool.Key): NO INSTALADO" -ForegroundColor Red
        $missing += $tool.Key
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Faltan instalar: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Por favor instala los tools faltantes antes de continuar." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✓ Todos los prerequisitos están instalados" -ForegroundColor Green
Write-Host ""

# Configurar AWS CLI
Write-Host "2. Verificando configuración de AWS CLI..." -ForegroundColor Yellow

try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "✓ AWS CLI configurado correctamente" -ForegroundColor Green
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "  ARN: $($identity.Arn)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ AWS CLI no está configurado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ejecuta: aws configure" -ForegroundColor Yellow
    Write-Host "Necesitarás tu Access Key ID y Secret Access Key" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Construir con SAM
Write-Host "3. Construyendo aplicación con SAM..." -ForegroundColor Yellow

sam build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir con SAM" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completado exitosamente" -ForegroundColor Green
Write-Host ""

# Desplegar
Write-Host "4. Desplegando a AWS..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Se abrirá un asistente interactivo. Sigue estos pasos:" -ForegroundColor Cyan
Write-Host "  1. Stack Name: registro-participantes-dev" -ForegroundColor Gray
Write-Host "  2. Region: us-east-1" -ForegroundColor Gray
Write-Host "  3. Stage: dev" -ForegroundColor Gray
Write-Host "  4. DBMasterPassword: tu-contraseña-segura (mín 8 caracteres)" -ForegroundColor Gray
Write-Host ""

sam deploy --guided

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Despliegue completado" -ForegroundColor Green
Write-Host ""

# Obtener outputs
Write-Host "5. Obteniendo información del despliegue..." -ForegroundColor Yellow

$stackName = "registro-participantes-dev"

$apiUrl = aws cloudformation describe-stacks `
    --stack-name $stackName `
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' `
    --output text

$bucketName = aws cloudformation describe-stacks `
    --stack-name $stackName `
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' `
    --output text

$cloudFrontUrl = aws cloudformation describe-stacks `
    --stack-name $stackName `
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' `
    --output text

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "URLs del Despliegue" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "API Backend: $apiUrl" -ForegroundColor Cyan
Write-Host "Frontend: https://$cloudFrontUrl" -ForegroundColor Cyan
Write-Host "Bucket S3: $bucketName" -ForegroundColor Cyan
Write-Host ""

# Guardar información
$config = @{
    "ApiUrl" = $apiUrl
    "BucketName" = $bucketName
    "CloudFrontUrl" = $cloudFrontUrl
    "StackName" = $stackName
    "Region" = "us-east-1"
    "Stage" = "dev"
}

$config | ConvertTo-Json | Out-File -FilePath ".aws-config.json" -Encoding UTF8

Write-Host "✓ Configuración guardada en .aws-config.json" -ForegroundColor Green
Write-Host ""

# Desplegar Frontend
Write-Host "6. Desplegando Frontend..." -ForegroundColor Yellow

cd frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "  Instalando dependencias..."
    npm install
}

Write-Host "  Construyendo..."
npm run build

Write-Host "  Subiendo a S3..."
aws s3 sync dist/ "s3://$bucketName/" --delete

Write-Host ""
Write-Host "✓ Frontend desplegado" -ForegroundColor Green

# Invalidar CloudFront
Write-Host ""
Write-Host "7. Invalidando cache de CloudFront..." -ForegroundColor Yellow

$distId = aws cloudfront list-distributions `
    --query "DistributionList.Items[0].Id" `
    --output text

aws cloudfront create-invalidation `
    --distribution-id $distId `
    --paths "/*" | Out-Null

Write-Host "✓ Cache invalidado" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Despliegue Completado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Crea las tablas de BD en RDS Query Editor" -ForegroundColor Gray
Write-Host "2. Accede al frontend en:" -ForegroundColor Gray
Write-Host "   https://$cloudFrontUrl" -ForegroundColor Cyan
Write-Host "3. Prueba creando un participante" -ForegroundColor Gray
Write-Host ""
Write-Host "Ver logs:" -ForegroundColor Yellow
Write-Host "  sam logs -n FastAPIFunction --stack-name $stackName --tail" -ForegroundColor Gray
Write-Host ""
