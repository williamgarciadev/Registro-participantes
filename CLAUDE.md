# CLAUDE.md - Instrucciones para Claude Code

## 🎯 Descripción del Proyecto

**Nombre:** Registro de Participantes
**Stack:** FastAPI (Python) + Aurora Serverless v2 (PostgreSQL) + React + AWS Serverless
**Tipo:** Aplicación web para registro y gestión de participantes
**Estado:** En despliegue (SAM deployment en progreso)

## 📋 Estructura del Proyecto

```
Registro-participantes/
│
├── 📋 DOCUMENTACION/
│   ├── COMIENZA_AQUI.md          ← PUNTO DE ENTRADA para usuarios
│   ├── INDEX.md                  ← Índice completo de docs
│   ├── ESTATUS_ACTUAL.md         ← Estado actual del proyecto
│   ├── RESUMEN_DOCUMENTACION.md  ← Resumen de toda doc
│   └── SETUP_AYUDA.txt           ← Guía visual en texto
│
├── 🚀 deploy-docs/
│   ├── AHORA_EJECUTA.md          ← Acción inmediata (sam deploy)
│   ├── PASOS_AHORA.md            ← Pasos después de delete
│   ├── AWS_DEPLOYMENT_OVERVIEW.md ← Arquitectura y diagramas
│   ├── AWS_DEPLOYMENT_CHECKLIST.md ← Checklist de 10 fases
│   └── AWS_QUICK_COMMANDS.md     ← Comandos copy-paste
│
├── 🆘 troubleshooting/
│   ├── SOLUCION_AURORA_VERSION.md    ← Error versión Aurora
│   ├── SOLUCION_PARAMETROS_BD.md     ← Parámetros faltantes BD
│   ├── ERROR_ARREGLADO.md            ← Error config file
│   ├── URGENTE_ESTADO_DELETE.md      ← Stack en DELETE
│   ├── TU_SITUACION_ACTUAL.md        ← Guía personalizada
│   └── RESOLVIENDO_DEPLOY.md         ← Atascado en sam deploy
│
├── 📚 docs/
│   ├── AWS_SETUP_STEP_BY_STEP.md    ← 10 pasos detallados
│   ├── DEVELOPMENT.md               ← Setup local
│   ├── API.md                       ← Endpoints API
│   └── DEPLOYMENT.md                ← Despliegues futuros
│
├── 🐍 backend/
│   ├── src/
│   │   ├── api/v1/endpoints/participantes.py
│   │   ├── models/participante.py
│   │   ├── schemas/participante.py
│   │   ├── services/participante_service.py
│   │   ├── database/session.py
│   │   ├── core/config.py
│   │   └── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── ⚛️ frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── 🛠️ scripts/
│   ├── setup-aws.sh              ← Deploy automático (Linux/macOS)
│   ├── setup-aws.ps1             ← Deploy automático (Windows)
│   └── init-database.sql         ← Crear tablas BD
│
├── 🏗️ INFRAESTRUCTURA
│   ├── template.yaml             ← AWS SAM CloudFormation
│   ├── samconfig.toml            ← Configuración SAM
│   └── .gitignore
│
└── 📄 ARCHIVOS PRINCIPALES
    ├── README.md                 ← Overview del proyecto
    ├── CLAUDE.md                 ← Este archivo
    ├── Makefile                  ← Comandos de desarrollo
    └── deploy.sh                 ← Script de deploy legacy
```

## 🚀 Cómo Empezar (Para Desarrolladores)

### 1. Punto de Entrada para Usuarios
```
→ Abre: DOCUMENTACION/COMIENZA_AQUI.md
```

### 2. Punto de Entrada para Desarrolladores
```
→ Abre: docs/DEVELOPMENT.md (para setup local)
→ Abre: docs/API.md (para endpoints)
```

### 3. Si Algo Falla
```
→ Consulta: troubleshooting/ (búsca por error)
→ O lee: deploy-docs/AWS_QUICK_COMMANDS.md
```

## 🔄 Flujo de Trabajo Actual

### Estado Actual (01 Nov 2025)

**✅ Completado:**
- Template.yaml arreglado (sin EngineVersion problemática)
- Sam build exitoso
- Credenciales agregadas a samconfig.toml
- Documentación completa

**⏳ En Progreso:**
- Sam deploy (10-15 minutos)

**⏳ Pendiente:**
- Crear tablas en BD (después de deploy)
- Desplegar frontend
- Subir a S3 y invalidar CloudFront

### Comando Siguiente
```bash
sam deploy
```

**Tiempo estimado:** 10-15 minutos

## 📊 Arquitectura en AWS

```
┌─────────────────────────────────────────────┐
│         CloudFront (CDN Global)             │
│  https://d123456789.cloudfront.net          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│    S3 Bucket (Frontend React)               │
│  registro-participantes-xxxxx               │
└──────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         API Gateway                         │
│  https://xxxxx.execute-api.us-east-1...     │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│    AWS Lambda (FastAPI)                     │
│    Runtime: Python 3.11                     │
│    Memory: 512 MB                           │
│    Timeout: 30 seg                          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Aurora Serverless v2 (PostgreSQL)          │
│  Database: participantes                    │
│  Min: 0.5 ACU | Max: 1 ACU                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  VPC (Networking)                           │
│  - 2 Public Subnets                         │
│  - 2 Private Subnets (para Aurora)          │
│  - Security Groups configurados             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  CloudWatch Logs & X-Ray (Monitoring)       │
│  - Logs de Lambda                           │
│  - Traces distribuidos                      │
└─────────────────────────────────────────────┘
```

## 🔑 Credenciales y Configuración

### Database
```
Host: ${AuroraCluster.Endpoint.Address} (creado en deploy)
Port: 5432
Database: participantes
Username: postgres
Password: ChangeMe123! (en samconfig.toml)

⚠️ IMPORTANTE: Cambiar contraseña en producción
```

### AWS
```
Region: us-east-1
Cuenta: 380012739300
IAM Role: creado automáticamente por SAM
```

### Variables de Entorno
```
DB_SECRET_ARN: Almacenado en AWS Secrets Manager
STAGE: dev (configurable)
LOG_LEVEL: INFO
```

## 🛠️ Herramientas Requeridas

- **Python 3.11+** - Backend
- **Node.js 18+** - Frontend
- **AWS CLI** - Acceso a AWS
- **AWS SAM CLI** - Despliegue
- **Docker** - Para SAM local testing
- **Git** - Control de versiones

## 📝 Convenciones del Proyecto

### Naming
- **Archivos de docs:** MAYUSCULAS_CON_GUIONES.md
- **Carpetas especiales:** minusculas-con-guiones/
- **Código:** camelCase (JS) / snake_case (Python)

### Commits
```
Format: type: descripción

types:
  feat:   Nueva característica
  fix:    Corrección de bug
  docs:   Cambios en documentación
  refactor: Refactorización
  test:   Agregar/actualizar tests
  chore:  Tareas de mantenimiento
```

### Ramas
```
Main: claude/fastapi-aurora-serverless-setup-[ID]
(Rama de desarrollo con todos los cambios)
```

## 🎯 Tareas Inmediatas

### Para El Usuario Ahora
1. Ejecutar `sam deploy`
2. Esperar 10-15 minutos
3. Cuando vea "Stack creation completed successfully":
   - Copiar URLs de output
   - Abrir `troubleshooting/SOLUCION_PARAMETROS_BD.md`
   - Seguir próximos pasos

### Para Desarrolladores
1. Review de la arquitectura: `deploy-docs/AWS_DEPLOYMENT_OVERVIEW.md`
2. Setup local: `docs/DEVELOPMENT.md`
3. Testing: `docs/API.md`

## 📚 Documentación por Caso de Uso

| Necesitas | Documento |
|-----------|-----------|
| Empezar desde cero | DOCUMENTACION/COMIENZA_AQUI.md |
| Entender arquitectura | deploy-docs/AWS_DEPLOYMENT_OVERVIEW.md |
| Paso a paso detallado | docs/AWS_SETUP_STEP_BY_STEP.md |
| Ver estado actual | DOCUMENTACION/ESTATUS_ACTUAL.md |
| Error específico | troubleshooting/ (busca por nombre) |
| Comandos rápidos | deploy-docs/AWS_QUICK_COMMANDS.md |
| Desarrollo local | docs/DEVELOPMENT.md |
| API endpoints | docs/API.md |
| Despliegues futuros | docs/DEPLOYMENT.md |

## 🔐 Seguridad

### Credenciales
- ⚠️ **NO commitir credenciales reales**
- Usar AWS Secrets Manager para producción
- Variables de entorno para valores sensibles
- .gitignore está configurado correctamente

### Permisos IAM
- Lambda: permisos VPC, RDS, Secrets Manager, X-Ray
- API Gateway: acceso a Lambda
- CloudFront: acceso a S3

### Networking
- Lambda en VPC privada
- Aurora en subnets privadas
- Solo entrada desde Lambda al DB
- API Gateway es punto de entrada público

## 🔄 Ciclo de Desarrollo

### Desarrollo Local
```bash
cd frontend && npm run dev
cd backend && python -m uvicorn src.main:app --reload
```

### Testing
```bash
sam local start-api
pytest backend/tests/
```

### Despliegue
```bash
sam build
sam deploy
```

### Monitoreo
```bash
sam logs -n FastAPIFunction --tail
```

## 📞 Contacto / Soporte

### Documentación
- Índice: `DOCUMENTACION/INDEX.md`
- Resumen: `DOCUMENTACION/RESUMEN_DOCUMENTACION.md`

### Errores Comunes
- Busca en: `troubleshooting/`
- O revisa: `deploy-docs/AWS_QUICK_COMMANDS.md`

### Código de Error
- Aurora version: `troubleshooting/SOLUCION_AURORA_VERSION.md`
- Parámetros BD: `troubleshooting/SOLUCION_PARAMETROS_BD.md`
- Config file: `troubleshooting/ERROR_ARREGLADO.md`

## 📊 Métricas y Monitoreo

### CloudWatch
```
Logs: /aws/lambda/registro-participantes-dev-api
Metrics: Invocations, Duration, Errors
Alarms: Configuradas en template.yaml (opcional)
```

### X-Ray
```
Service Map: Visualizar llamadas distribuidas
Traces: Debug de requests end-to-end
Analytics: Análisis de rendimiento
```

## 🎓 Recursos Externos

### AWS
- [SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Aurora Serverless v2](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/aurora-serverless.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

### Python/FastAPI
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)

### React
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ✅ Checklist Final

- [ ] Entiendo la estructura del proyecto
- [ ] Sé dónde está la documentación
- [ ] Conozco cómo desplegar (sam deploy)
- [ ] Sé dónde reportar errores (troubleshooting/)
- [ ] Entiendo la arquitectura (AWS)
- [ ] Tengo acceso a AWS Console

## 🚀 Siguientes Pasos

1. **Inmediato:** `sam deploy` (10-15 min)
2. **Cuando termine:** Crear tablas en BD (5 min)
3. **Luego:** Desplegar frontend (5 min)
4. **Final:** Testear en navegador

---

**Última actualización:** 01 Nov 2025
**Versión:** 1.0 Pro
**Estado:** ✅ Proyecto organizado y documentado profesionalmente

Para empezar, abre: **`DOCUMENTACION/COMIENZA_AQUI.md`**
