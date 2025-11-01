# Script para reparar y redeployar después del error de CloudWatch Logs
# Ejecuta este script en PowerShell como administrador

Write-Host "🚀 Iniciando reparación del deploy..."
Write-Host ""

# Paso 1: Eliminar el stack fallido
Write-Host "📋 Paso 1: Eliminando stack fallido..."
Write-Host "⚠️  Escribe 'y' cuando se te pida confirmación"
Write-Host ""

sam delete --stack-name registro-participantes-dev --region us-east-1

Write-Host ""
Write-Host "✅ Stack eliminado. Esperando a que se complete..."
Write-Host "   (Esto puede tomar 1-2 minutos)"
Write-Host ""

# Paso 2: Hacer SAM build
Write-Host "🔨 Paso 2: Ejecutando sam build..."
Write-Host ""

sam build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en sam build!"
    exit 1
}

Write-Host ""
Write-Host "✅ Sam build completado exitosamente"
Write-Host ""

# Paso 3: Hacer SAM deploy
Write-Host "🚀 Paso 3: Ejecutando sam deploy..."
Write-Host ""

sam deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en sam deploy!"
    exit 1
}

Write-Host ""
Write-Host "✅✅✅ DEPLOY COMPLETADO EXITOSAMENTE! ✅✅✅"
Write-Host ""
Write-Host "📊 El stack 'registro-participantes-dev' ha sido desplegado correctamente."
Write-Host ""
Write-Host "Próximos pasos:"
Write-Host "1. Abre: troubleshooting/SOLUCION_PARAMETROS_BD.md"
Write-Host "2. Sigue los pasos para crear las tablas de la base de datos"
Write-Host ""
