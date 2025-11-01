# 📋 Resumen del Despliegue en AWS

## 🎯 Visión General

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA FINAL EN AWS                   │
└─────────────────────────────────────────────────────────────────┘

                              USUARIOS
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
            ┌──────────────┐        ┌──────────────┐
            │  CloudFront  │        │  API Gateway │
            │   (CDN)      │        │   (REST API) │
            └────────┬─────┘        └──────┬───────┘
                     │                     │
                     ▼                     ▼
            ┌──────────────┐        ┌──────────────┐
            │  S3 Bucket   │        │    Lambda    │
            │  (Frontend)  │        │   (Python)   │
            │   React      │        │   FastAPI    │
            └──────────────┘        └──────┬───────┘
                                           │
                    ┌──────────────────────┴─────┐
                    │                            │
                    ▼                            ▼
            ┌──────────────┐          ┌──────────────────┐
            │ Secrets      │          │ Aurora Serverless│
            │ Manager      │          │  v2 (PostgreSQL) │
            │ (DB Creds)   │          │   (Base de Datos)│
            └──────────────┘          └──────────────────┘
                    ▲                            │
                    │            ┌───────────────┘
                    └────────────┘

            ┌──────────────────────────────────────────┐
            │     CloudWatch + X-Ray (Monitoreo)       │
            └──────────────────────────────────────────┘
```

---

## 📦 Componentes Creados

### 1️⃣ Frontend (React + Vite)
- **Ubicación:** S3 + CloudFront
- **Archivos:** HTML, CSS, JavaScript estáticos
- **URL:** `https://d123456.cloudfront.net`
- **Función:** Interfaz para crear, ver, editar y eliminar participantes

### 2️⃣ Backend (FastAPI)
- **Ubicación:** AWS Lambda
- **Runtime:** Python 3.11
- **Ubicación de código:** `/backend/src`
- **URL:** `https://api123456.execute-api.us-east-1.amazonaws.com/dev`
- **Función:** Procesar requests, validar datos, acceder a BD

### 3️⃣ Base de Datos (Aurora Serverless v2)
- **Tipo:** PostgreSQL 15
- **Ubicación:** VPC privada
- **Auto-scaling:** 0.5 - 1 ACU
- **Nombre:** `participantes`
- **Tabla principal:** `participantes`
- **Backup:** Automático (7 días)

### 4️⃣ Networking (VPC)
- **VPC CIDR:** 10.0.0.0/16
- **Subnets Públicas:** Para API Gateway y NAT
- **Subnets Privadas:** Para Aurora y Lambda
- **Security Groups:** Controlar tráfico entre componentes

### 5️⃣ Monitoreo (CloudWatch + X-Ray)
- **Logs:** Todos los eventos de Lambda
- **Métricas:** Invocaciones, duración, errores
- **Tracing:** X-Ray para seguimiento distribuido
- **Alertas:** CloudWatch Alarms para errores

---

## 🔄 Flujo de Datos

```
USUARIO ACCEDE A FRONTEND
        │
        ├─→ CloudFront carga HTML/CSS/JS desde S3
        │
        ▼
USUARIO INTERACTÚA CON FORMULARIO
        │
        ├─→ JavaScript envía request al backend
        │
        ▼
API GATEWAY RECIBE REQUEST
        │
        ├─→ Valida y enruta a Lambda
        │
        ▼
LAMBDA PROCESA REQUEST
        │
        ├─→ Valida datos con Pydantic
        ├─→ Obtiene credenciales de Secrets Manager
        ├─→ Conecta a Aurora
        ├─→ Ejecuta operación SQL
        │
        ▼
AURORA PROCESA QUERY
        │
        ├─→ Valida integridad de datos
        ├─→ Almacena/recupera datos
        │
        ▼
LAMBDA DEVUELVE RESPUESTA
        │
        ├─→ JSON con datos del participante
        │
        ▼
FRONTEND ACTUALIZA UI
        │
        └─→ Usuario ve el resultado
```

---

## 📊 Tabla de Servicios

| Servicio | Nombre en AWS | Costo/Mes | Función |
|----------|---------------|-----------|---------|
| **Compute** | AWS Lambda | $5-10 | Ejecutar código |
| **Database** | Aurora Serverless v2 | $30-50 | Almacenar datos |
| **API** | API Gateway | $3-5 | Enrutador HTTP |
| **Storage** | S3 + CloudFront | $2-5 | Servir frontend |
| **Monitoring** | CloudWatch + X-Ray | $1-2 | Logs y métricas |
| **Security** | Secrets Manager | $0.50 | Credenciales |
| **Total Desarrollo** | | **$40-70** | |

---

## 🚀 Proceso de Despliegue (Paso a Paso)

### Fase 1: Preparación (10 min)
```
✓ Instalar herramientas
✓ Configurar AWS CLI
✓ Verificar credenciales
```

### Fase 2: Despliegue Backend (30 min)
```
✓ sam build
✓ sam deploy --guided
↓
Crea: VPC, Aurora, Lambda, API Gateway, S3, CloudFront
```

### Fase 3: Configurar BD (5 min)
```
✓ Abrir RDS Query Editor
✓ Ejecutar init-database.sql
✓ Crear tablas e índices
```

### Fase 4: Despliegue Frontend (15 min)
```
✓ npm install
✓ npm run build
✓ aws s3 sync
↓
Carga archivos React a S3
```

### Fase 5: Invalidar Cache (2 min)
```
✓ aws cloudfront create-invalidation
↓
Frontend disponible globalmente
```

### Fase 6: Testing (10 min)
```
✓ Probar health check
✓ Crear participante
✓ Acceder al frontend
```

**Total:** ~1.5 horas para despliegue completo

---

## 🔐 Seguridad

### Lo que está configurado:
- ✅ S3 bucket privado con CloudFront OAI
- ✅ Lambda en VPC privada
- ✅ Aurora en subnets privadas
- ✅ Credenciales en Secrets Manager (no hardcoded)
- ✅ API Gateway con CORS habilitado
- ✅ X-Ray tracing para monitoreo

### Lo que deberías hacer:
- 🔒 Cambiar CORS de `*` a dominios específicos
- 🔒 Implementar autenticación (AWS Cognito)
- 🔒 Habilitar WAF en CloudFront
- 🔒 Configurar backup diario en Aurora
- 🔒 Usar KMS para encriptación

---

## 💾 Datos Guardados en AWS

### Secrets Manager
```
nombre: registro-participantes-dev-db-credentials
contiene:
  - username: postgres
  - password: tu-contraseña
  - host: cluster-xxxxx.xxxxx.us-east-1.rds.amazonaws.com
  - port: 5432
  - dbname: participantes
```

### Aurora Database
```
Host: cluster-xxxxx.xxxxx.us-east-1.rds.amazonaws.com
Base de datos: participantes
Tabla: participantes
Registros: Los que crees mediante la UI
```

### S3 Bucket
```
Bucket: registro-participantes-[account-id]-frontend-[random]
Contenido: index.html, CSS, JS desde npm run build
```

---

## 📈 Escalabilidad

| Componente | Escalabilidad | Límite |
|-----------|---------------|--------|
| Lambda | Automática | 1000 req/seg |
| Aurora | Auto-scaling 0.5-1 ACU | Aumentar ACU |
| S3 | Ilimitado | Buckets por región |
| API Gateway | Automática | Aumentar throttling |

Para escalar:
1. Aurora: Aumentar `MaxCapacity` en `template.yaml`
2. Lambda: Aumentar `MemorySize`
3. S3/CloudFront: Ya escalan automáticamente

---

## 🔧 Estructura de Archivos en AWS

```
AWS Account
├── CloudFormation
│   └── Stack: registro-participantes-dev
│       ├── VPC
│       ├── Security Groups
│       ├── RDS Aurora Cluster
│       ├── Lambda Function
│       ├── API Gateway
│       ├── S3 Buckets
│       ├── CloudFront Distribution
│       └── CloudWatch Logs
│
├── Secrets Manager
│   └── registro-participantes-dev-db-credentials
│
├── RDS
│   └── DB Cluster: registro-participantes
│
├── Lambda
│   └── registro-participantes-dev-FastAPIFunction
│
├── API Gateway
│   └── registro-participantes-dev-api
│
├── S3
│   └── Bucket: registro-participantes-[account-id]-frontend-[random]
│
├── CloudFront
│   └── Distribution: [XXXXX].cloudfront.net
│
└── CloudWatch
    ├── Log Groups: /aws/lambda/...
    ├── Dashboards: Automático
    └── Alarms: (Configurar)
```

---

## 📝 Configuración en template.yaml

```yaml
# Antes de desplegar, verifica:

Globals:
  Function:
    Timeout: 30          # Segundos (aumentar si es necesario)
    MemorySize: 512      # MB (aumentar para mejor performance)
    Runtime: python3.11

Parameters:
  Stage: dev             # Cambiar a prod para producción
  DBMasterUsername: postgres
  DBMasterPassword: ****

Resources:
  AuroraCluster:
    ServerlessV2ScalingConfiguration:
      MinCapacity: 0.5   # Cambiar si necesitas más capacidad
      MaxCapacity: 1     # Cambiar si necesitas más capacidad
```

---

## 💰 Optimización de Costos

### Desarrollo (Costo Mínimo)
- Lambda: 128 MB
- Aurora: 0.5 ACU mínimo
- No habilites logs verbosos
- Usa S3 Intelligent-Tiering

### Producción (Balance)
- Lambda: 512-1024 MB
- Aurora: 1-2 ACU
- CloudWatch logs: 7-30 días retención
- CloudFront: Habilita compresión

### Monitoreo de Costos
```bash
# Ver costos diarios
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Establecer presupuesto
aws budgets create-budget \
  --account-id 123456789012 \
  --budget BudgetName=Monthly,BudgetLimit=100,TimeUnit=MONTHLY
```

---

## 🔄 CI/CD (Automatización)

Para futuros despliegues automáticos:

### GitHub Actions (Recomendado)
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: sam build && sam deploy
      - name: Deploy Frontend
        run: npm run build && aws s3 sync dist/ s3://$BUCKET/
```

---

## ✅ Checklist Final

Después de desplegar, asegúrate de:

- [ ] Frontend carga sin errores
- [ ] API responde a requests
- [ ] Base de datos almacena datos
- [ ] Logs aparecen en CloudWatch
- [ ] Traces aparecen en X-Ray
- [ ] CloudFront está propagado (5-10 min)
- [ ] Domain name es accesible globalmente
- [ ] HTTPS funciona (CloudFront lo provee)

---

## 📚 Documentación Relacionada

- [AWS_SETUP_STEP_BY_STEP.md](./docs/AWS_SETUP_STEP_BY_STEP.md) - Guía detallada paso a paso
- [AWS_DEPLOYMENT_CHECKLIST.md](./AWS_DEPLOYMENT_CHECKLIST.md) - Checklist interactivo
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Despliegues posteriores
- [docs/API.md](./docs/API.md) - Documentación de API
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Desarrollo local

---

## 🎉 ¡Listo!

Tu aplicación está completamente desplegada en AWS y lista para uso.

**URLs Importantes:**
- Frontend: `https://your-cloudfront-url`
- API: `https://your-api-gateway-url/api/v1`
- Docs: `https://your-api-gateway-url/docs`

**Próximos Pasos:**
1. Realizar tests en producción
2. Configurar dominio custom (Route 53)
3. Implementar autenticación
4. Configurar CI/CD
5. Monitorear costos

¡A disfrutar! 🚀
