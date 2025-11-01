# Guía Paso a Paso: Configurar Todo en AWS

Esta es una guía detallada para desplegar el proyecto completo en AWS desde cero.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Configurar AWS](#paso-1-configurar-aws)
3. [Paso 2: Preparar el Entorno Local](#paso-2-preparar-el-entorno-local)
4. [Paso 3: Desplegar Backend con SAM](#paso-3-desplegar-backend-con-sam)
5. [Paso 4: Configurar Aurora Serverless](#paso-4-configurar-aurora-serverless)
6. [Paso 5: Crear Migraciones en BD](#paso-5-crear-migraciones-en-bd)
7. [Paso 6: Desplegar Frontend](#paso-6-desplegar-frontend)
8. [Paso 7: Verificar Todo Funciona](#paso-7-verificar-todo-funciona)
9. [Paso 8: Monitoreo y Logs](#paso-8-monitoreo-y-logs)

---

## Requisitos Previos

Asegúrate de tener instalado:

### Windows
```powershell
# Verificar Python
python --version  # Debe ser 3.11+

# Verificar Node.js
node --version    # Debe ser 18+

# Verificar Docker
docker --version

# Verificar Git
git --version
```

### macOS
```bash
# Con Homebrew
brew --version
brew install python@3.11
brew install node
brew install docker
brew install git
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv nodejs docker.io git
```

---

## Paso 1: Configurar AWS

### 1.1 Crear Cuenta AWS (si no tienes)

1. Ve a https://aws.amazon.com
2. Haz clic en "Create an AWS Account"
3. Sigue el proceso de registro
4. Verifica tu email y teléfono

### 1.2 Crear Usuario IAM para Desarrollo

⚠️ **IMPORTANTE**: No uses la cuenta root. Crea un usuario IAM.

1. Ve a AWS Console → IAM
2. Click en "Users" → "Create user"
3. Nombre: `registro-participantes-dev`
4. ✅ Habilita "Provide user access to the AWS Management Console"
5. Click "Next"
6. En "Set permissions", selecciona "Attach policies directly"
7. Busca y selecciona estas policies:
   - `AdministratorAccess` (para desarrollo, en producción usa menos permisos)
8. Click "Create user"
9. **Guarda las credenciales que te dan** (Access Key ID y Secret Access Key)

### 1.3 Crear Access Keys para CLI

1. Ve a IAM → Users → `registro-participantes-dev`
2. Click en "Security credentials"
3. Scroll a "Access keys"
4. Click "Create access key"
5. Selecciona "Command Line Interface (CLI)"
6. ✅ Confirma el checkbox
7. Click "Next"
8. **Copia y guarda en un lugar seguro:**
   - Access Key ID
   - Secret Access Key

### 1.4 Elegir Región AWS

Elige una región cercana a tus usuarios. Recomendado para América Latina:
- `us-east-1` (N. Virginia) - Más barato, muchos servicios
- `us-west-2` (Oregon) - Alternativa
- `ca-central-1` (Canadá) - Más cercano

Para esta guía usaremos **`us-east-1`**

---

## Paso 2: Preparar el Entorno Local

### 2.1 Instalar AWS CLI

#### Windows (con instalador)
```powershell
# Descargar e instalar desde:
# https://awscli.amazonaws.com/AWSCLIV2.msi

# Verificar instalación
aws --version
```

#### macOS
```bash
brew install awscli

# Verificar
aws --version
```

#### Linux
```bash
sudo apt install awscli

# O instalar desde pip
pip install awscli
```

### 2.2 Configurar AWS CLI

```bash
aws configure
```

Te pedirá:
```
AWS Access Key ID [None]: tu-access-key-id
AWS Secret Access Key [None]: tu-secret-access-key
Default region name [None]: us-east-1
Default output format [None]: json
```

**Verifica que funcionó:**
```bash
aws sts get-caller-identity
```
{
    "UserId": "AIDAVQ6UGHLSNMDQMSPNR",
    "Account": "380012739300",
    "Arn": "arn:aws:iam::380012739300:user/registro-participantes-dev"
}
Deberías ver tu ID de AWS Account y ARN del usuario.

### 2.3 Instalar AWS SAM CLI

#### Windows
```powershell
# Descargar instalador desde:
# https://github.com/aws/aws-sam-cli/releases

# O con pip:
pip install aws-sam-cli

# Verificar
sam --version
```

#### macOS
```bash
brew install aws-sam-cli

# Verificar
sam --version
```

#### Linux
```bash
pip install aws-sam-cli

# Verificar
sam --version
```

### 2.4 Instalar Herramientas Adicionales

```bash
# Docker (necesario para SAM)
docker --version

# Git
git --version

# Node.js para frontend
node --version
npm --version

# Python
python --version
```

---

## Paso 3: Desplegar Backend con SAM

### 3.1 Preparar el Código

```bash
# Navegar al proyecto
cd Registro-participantes

# Ver estructura
ls -la

# Verificar que existen estos archivos:
# - template.yaml
# - samconfig.toml
# - backend/requirements.txt
```

### 3.2 Construir la Aplicación

```bash
# Construir el proyecto SAM
sam build

# Esto descargará dependencias y preparará el código
# Deberías ver: "Build Succeeded"
```

Si hay errores, verifica:
- Docker está corriendo: `docker ps`
- Python 3.11+: `python --version`

### 3.3 Desplegar (Primera Vez - GUIDED)

```bash
sam deploy --guided
```

Te pedirá información:

```
Stack Name [sam-app]: registro-participantes-dev
AWS Region [us-east-1]: us-east-1
Parameter Stage [dev]: dev
Parameter DBMasterUsername [postgres]: postgres
Parameter DBMasterPassword: tu-contraseña-segura (mín 8 caracteres)
Confirm changes before deploy [Y/n]: Y
Allow SAM CLI IAM role creation [Y/n]: Y
Save arguments to configuration file [Y/n]: Y
SAM configuration file [samconfig.toml]: samconfig.toml
Region [us-east-1]: us-east-1
Confirm changeset [Y]: Y
```

**Esto creará:**
- VPC con subnets
- Security Groups
- Aurora Serverless Cluster
- Lambda Function
- API Gateway
- S3 Bucket para frontend
- CloudFront Distribution
- CloudWatch Logs

⏳ **Esto toma 10-15 minutos. Espera a que termine.**

### 3.4 Verificar Despliegue

Cuando termine, verás:

```
Changeset created successfully.
Stack creation in progress...
...
Stack creation completed successfully.

Stack ARN: arn:aws:cloudformation:us-east-1:...
```

Busca las outputs al final - esos son datos importantes.

---

## Paso 4: Configurar Aurora Serverless

### 4.1 Obtener Información del Cluster

```bash
# Obtener endpoint del cluster
aws rds describe-db-clusters \
  --query 'DBClusters[0].Endpoint' \
  --output text

# Obtener información de seguridad
aws rds describe-db-clusters \
  --query 'DBClusters[0].VpcSecurityGroups' \
  --output table
```

### 4.2 Obtener Credenciales de Secrets Manager

```bash
# Listar secretos
aws secretsmanager list-secrets

# Obtener detalles del secreto (reemplaza con nombre real)
aws secretsmanager get-secret-value \
  --secret-id registro-participantes-dev-db-credentials \
  --query 'SecretString' | python -m json.tool
```

Verás algo como:
```json
{
  "username": "postgres",
  "password": "tu-contraseña",
  "engine": "postgres",
  "host": "cluster-xxxxx.xxxxx.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "dbname": "participantes"
}
```

**Guarda estos datos.**

### 4.3 Verificar Conectividad (Bastion Host)

Para desarrollar localmente, hay dos opciones:

**Opción A: Usar RDS Proxy (Recomendado)**

```bash
# Crear RDS Proxy (para simplificar)
# Ver documentación de AWS RDS Proxy
```

**Opción B: Usar Query Editor (Fácil)**

1. Ve a AWS Console → RDS
2. Click en el cluster `registro-participantes`
3. Tab "Query editor"
4. Click "New query"
5. Ejecuta:

```sql
CREATE TABLE IF NOT EXISTS participantes (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    INDEX idx_email (email),
    INDEX idx_estado (estado),
    INDEX idx_fecha_registro (fecha_registro)
);
```

---

## Paso 5: Crear Migraciones en BD

### 5.1 Instalar Dependencias Locales (para generar migraciones)

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Instalar alembic si no está
pip install alembic
```

### 5.2 Crear Primera Migración

```bash
# Generar migración inicial basada en modelos
alembic revision --autogenerate -m "Initial: crear tabla participantes"

# Esto crea un archivo en alembic/versions/
# Por ejemplo: alembic/versions/2024_01_20_1030-xxxxx_initial_crear_tabla_participantes.py
```

Verifica que se generó correctamente:
```bash
ls -la alembic/versions/
```

### 5.3 Ejecutar Migraciones en AWS

Para ejecutar migraciones en Aurora desde Lambda:

```bash
# Opción A: Usar RDS Query Editor en AWS Console (manual)
# Ve a RDS → Query Editor → Nueva query
# Copia contenido de alembic/versions/[archivo].py

# Opción B: Crear una Lambda temporal para migraciones
# (Hay un template en docs/RUN_MIGRATIONS.md)

# Opción C: Usar local primero (desarrollo)
# Necesitas acceso a la DB desde tu máquina
```

**Para desarrollo inicial, usaremos RDS Query Editor.**

---

## Paso 6: Desplegar Frontend

### 6.1 Obtener URL de API

```bash
# Obtener la URL de API Gateway
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

Copia esta URL (ejemplo: `https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev`)

### 6.2 Configurar Frontend

```bash
cd frontend

# Crear archivo .env con la URL
cat > .env << EOF
VITE_API_URL=https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev
VITE_STAGE=production
EOF
```

### 6.3 Instalar Dependencias

```bash
npm install
```

Si hay problemas, intenta:
```bash
npm install --legacy-peer-deps
npm cache clean --force
```

### 6.4 Construir Frontend

```bash
npm run build

# Verifica que se creó la carpeta dist/
ls -la dist/
```

### 6.5 Obtener Bucket de S3

```bash
# Obtener nombre del bucket
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

echo $BUCKET_NAME
```

### 6.6 Subir a S3

```bash
# Subir archivos
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete

# Verificar que se subieron
aws s3 ls s3://$BUCKET_NAME/ --recursive
```

### 6.7 Invalidar CloudFront Cache

```bash
# Obtener Distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[0].Id" \
  --output text)

# Invalidar cache
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"

echo "Invalidation en progreso..."
```

### 6.8 Obtener URL del Frontend

```bash
# URL de CloudFront
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
  --output text
```

---

## Paso 7: Verificar Todo Funciona

### 7.1 Probar API Backend

```bash
# Obtener URL de API
API_URL=$(aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

# Health check
curl $API_URL/health

# Debería retornar: {"status":"healthy"}
```

### 7.2 Probar Crear Participante

```bash
curl -X POST $API_URL/api/v1/participantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "User",
    "email": "test@example.com",
    "telefono": "+1234567890"
  }'

# Debería retornar el participante creado con ID
```

### 7.3 Probar Listar Participantes

```bash
curl $API_URL/api/v1/participantes

# Debería retornar lista de participantes
```

### 7.4 Acceder al Frontend

Abre en el navegador:
```
https://d111111abcdef8.cloudfront.net
```

(Usa la URL que obtuviste en 6.8)

Deberías ver:
- Página de inicio
- Menú de navegación
- Botones funcionales

### 7.5 Crear Participante desde UI

1. Click en "Nuevo Participante"
2. Llena el formulario
3. Click "Guardar"
4. Verifica que aparece en la lista

---

## Paso 8: Monitoreo y Logs

### 8.1 Ver Logs de Lambda

```bash
# Ver logs en tiempo real
sam logs -n FastAPIFunction --stack-name registro-participantes-dev --tail

# O con AWS CLI
aws logs tail /aws/lambda/registro-participantes-dev-FastAPIFunction --follow
```

### 8.2 Ver Métricas en CloudWatch

1. Ve a AWS Console → CloudWatch
2. Click en "Dashboards"
3. Verás un dashboard automático con:
   - Invocations
   - Errors
   - Duration
   - Throttles

### 8.3 Ver Traces en X-Ray

1. Ve a AWS Console → X-Ray
2. Click en "Service map"
3. Verás el flujo: API Gateway → Lambda → Aurora

### 8.4 Crear Alarma para Errores

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name registro-participantes-errors \
  --alarm-description "Alerta si hay errores en Lambda" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

---

## Troubleshooting

### Error: "No space left on device"

```bash
# Docker está usando mucho espacio
docker system prune -a
docker volume prune
```

### Error: "Stack creation failed"

```bash
# Ver qué salió mal
aws cloudformation describe-stack-events \
  --stack-name registro-participantes-dev \
  --query 'StackEvents[0:5]'
```

### Error: "Lambda timeout"

En `template.yaml`, aumenta el timeout:
```yaml
Globals:
  Function:
    Timeout: 60  # Cambiar de 30 a 60
```

Luego:
```bash
sam build && sam deploy
```

### Error: "Cannot connect to Aurora"

1. Verifica Security Group permite conexiones desde Lambda
2. Verifica credenciales en Secrets Manager
3. Verifica Aurora está en estado "available"

```bash
aws rds describe-db-clusters \
  --query 'DBClusters[0].Status'
```

### Error: "CloudFront still loading"

Espera a que CloudFront termine de propagar (~5-10 minutos):

```bash
# Ver estado
aws cloudfront get-distribution \
  --id $DIST_ID \
  --query 'Distribution.Status'
```

---

## Próximos Pasos

✅ Proyecto desplegado en AWS

### Desarrollo Continuo

Para hacer cambios:

```bash
# Backend
sam build && sam deploy

# Frontend
cd frontend
npm run build
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### Mejoras Recomendadas

1. **Autenticación**: Agregar AWS Cognito
2. **CI/CD**: Configurar GitHub Actions
3. **Costos**: Monitoring de AWS Budgets
4. **Seguridad**: WAF en CloudFront
5. **Performance**: CloudFront caching headers

---

## Costos Estimados

| Servicio | Costo Mensual |
|----------|---------------|
| Lambda (1M requests) | $5-10 |
| Aurora Serverless v2 | $30-50 |
| API Gateway | $3-5 |
| S3 + CloudFront | $2-5 |
| **Total Desarrollo** | **$40-70/mes** |

---

## Notas Importantes

⚠️ **SEGURIDAD:**
- Nunca pushes credenciales a Git
- Usa Secrets Manager para todas las credenciales
- En producción: cambiar permisos IAM a los mínimos necesarios
- Habilita MFA en cuenta root

⚠️ **COSTOS:**
- Monitorea con AWS Budgets
- Aurora Serverless puede costar más si hay spike de traffic
- Configura alertas de costos

⚠️ **BACKUP:**
- Aurora hace backups automáticos (7 días)
- Considera aumentar a 30 días en producción
- Haz backup manual del frontend S3

---

## Soporte

Si algo no funciona:

1. Revisa los logs: `sam logs ...`
2. Verifica CloudFormation events
3. Revisa documentación oficial de AWS
4. Busca el error específico en Google

¡Felicidades! Tu aplicación está desplegada en AWS! 🎉
