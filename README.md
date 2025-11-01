# Registro de Participantes

Sistema de registro de participantes construido con arquitectura serverless en AWS.

## 🚀 Stack Tecnológico

### Backend
- **Python 3.11** - Lenguaje de programación
- **FastAPI** - Framework web moderno y de alto rendimiento
- **AWS Lambda** - Computación serverless
- **API Gateway** - Gestión de APIs
- **Aurora Serverless v2 (PostgreSQL)** - Base de datos serverless con auto-scaling

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático
- **S3 + CloudFront** - Hosting y CDN

### Infraestructura
- **AWS SAM** - Infrastructure as Code
- **CloudWatch** - Logs y métricas
- **AWS X-Ray** - Tracing distribuido

## 📁 Estructura del Proyecto

```
Registro-participantes/
│
├── 📋 DOCUMENTACION/
│   ├── COMIENZA_AQUI.md              ← PUNTO DE ENTRADA
│   ├── INDEX.md                      ← Índice completo
│   ├── ESTATUS_ACTUAL.md
│   ├── RESUMEN_DOCUMENTACION.md
│   └── SETUP_AYUDA.txt
│
├── 🚀 deploy-docs/
│   ├── AHORA_EJECUTA.md              ← Acción inmediata
│   ├── PASOS_AHORA.md
│   ├── AWS_DEPLOYMENT_OVERVIEW.md    ← Arquitectura
│   ├── AWS_DEPLOYMENT_CHECKLIST.md
│   └── AWS_QUICK_COMMANDS.md         ← Referencia rápida
│
├── 🆘 troubleshooting/
│   ├── SOLUCION_AURORA_VERSION.md
│   ├── SOLUCION_PARAMETROS_BD.md
│   ├── ERROR_ARREGLADO.md
│   ├── URGENTE_ESTADO_DELETE.md
│   ├── TU_SITUACION_ACTUAL.md
│   └── RESOLVIENDO_DEPLOY.md
│
├── 📚 docs/
│   ├── AWS_SETUP_STEP_BY_STEP.md    ← 10 pasos detallados
│   ├── DEVELOPMENT.md                ← Setup local
│   ├── API.md                        ← Endpoints
│   └── DEPLOYMENT.md                 ← Despliegues futuros
│
├── 🐍 backend/
│   ├── src/
│   │   ├── api/                      ← Endpoints de la API
│   │   ├── models/                   ← Modelos de datos
│   │   ├── services/                 ← Lógica de negocio
│   │   ├── database/                 ← Configuración BD
│   │   ├── core/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── ⚛️ frontend/
│   ├── src/
│   │   ├── components/               ← Componentes React
│   │   ├── pages/                    ← Páginas
│   │   ├── services/                 ← Servicios API
│   │   ├── types/                    ← TypeScript types
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── 🛠️ scripts/
│   ├── setup-aws.sh                  ← Deploy automático (Linux/macOS)
│   ├── setup-aws.ps1                 ← Deploy automático (Windows)
│   └── init-database.sql             ← Crear tablas
│
├── 🏗️ template.yaml                  ← AWS SAM CloudFormation
├── 📄 CLAUDE.md                      ← Instrucciones para Claude
├── 📄 README.md                      ← Este archivo
├── 📄 Makefile                       ← Comandos de desarrollo
└── 📄 .gitignore
```

### 📖 Explicación de Carpetas

- **DOCUMENTACION/** → Documentos para usuarios
- **deploy-docs/** → Guías de despliegue en AWS
- **troubleshooting/** → Soluciones de errores
- **docs/** → Documentación técnica (desarrollo)
- **backend/** → Código Python FastAPI
- **frontend/** → Código React TypeScript
- **scripts/** → Scripts de automatización

## 🏗️ Arquitectura

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   CloudFront    │  (CDN)
└────────┬────────┘
         │
    ┌────┴────┐
    │    S3   │  (Frontend estático)
    └─────────┘

    ┌─────────────┐
    │ API Gateway │  (REST API)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Lambda    │  (FastAPI)
    └──────┬──────┘
           │
    ┌──────▼──────────┐
    │  Aurora         │  (PostgreSQL)
    │  Serverless v2  │
    └─────────────────┘

    ┌─────────────────┐
    │   CloudWatch    │  (Logs y Métricas)
    └─────────────────┘

    ┌─────────────────┐
    │     X-Ray       │  (Tracing)
    └─────────────────┘
```

## 🔧 Requisitos Previos

- AWS CLI configurado
- AWS SAM CLI instalado
- Python 3.11+
- Node.js 18+
- Docker (para desarrollo local)

## 🚀 Inicio Rápido

### 1. Desarrollo Local

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Despliegue en AWS

**OPCIÓN A: Automatizado (Recomendado)**

```bash
# macOS/Linux
bash scripts/setup-aws.sh

# Windows PowerShell
.\scripts\setup-aws.ps1
```

**OPCIÓN B: Manual**

```bash
# Backend
sam build
sam deploy --guided

# Frontend
cd frontend
npm run build
aws s3 sync dist/ s3://bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

## 📚 Documentación

### 🚀 Empezar Aquí

| Documento | Descripción |
|-----------|-------------|
| **[CLAUDE.md](./CLAUDE.md)** | ⭐ Instrucciones para Claude Code (Lee primero) |
| **[DOCUMENTACION/COMIENZA_AQUI.md](./DOCUMENTACION/COMIENZA_AQUI.md)** | 🚀 Guía de inicio - elige opción A o B |
| **[DOCUMENTACION/INDEX.md](./DOCUMENTACION/INDEX.md)** | 📑 Índice completo de toda la documentación |

### 🚀 Despliegue en AWS

| Documento | Descripción |
|-----------|-------------|
| **[deploy-docs/AHORA_EJECUTA.md](./deploy-docs/AHORA_EJECUTA.md)** | ⚡ Acción inmediata (sam deploy) |
| **[deploy-docs/AWS_DEPLOYMENT_OVERVIEW.md](./deploy-docs/AWS_DEPLOYMENT_OVERVIEW.md)** | 🏗️ Arquitectura y componentes |
| **[deploy-docs/AWS_DEPLOYMENT_CHECKLIST.md](./deploy-docs/AWS_DEPLOYMENT_CHECKLIST.md)** | ✅ Checklist interactivo |
| **[deploy-docs/AWS_QUICK_COMMANDS.md](./deploy-docs/AWS_QUICK_COMMANDS.md)** | ⚡ Comandos copy-paste |
| **[docs/AWS_SETUP_STEP_BY_STEP.md](./docs/AWS_SETUP_STEP_BY_STEP.md)** | 📖 10 pasos detallados |

### 🆘 Solución de Errores

| Error | Solución |
|-------|----------|
| **Aurora version 15.4 no encontrada** | [troubleshooting/SOLUCION_AURORA_VERSION.md](./troubleshooting/SOLUCION_AURORA_VERSION.md) |
| **Parámetros BD faltantes** | [troubleshooting/SOLUCION_PARAMETROS_BD.md](./troubleshooting/SOLUCION_PARAMETROS_BD.md) |
| **Stack en DELETE_IN_PROGRESS** | [troubleshooting/URGENTE_ESTADO_DELETE.md](./troubleshooting/URGENTE_ESTADO_DELETE.md) |
| **Otras soluciones** | [troubleshooting/](./troubleshooting/) |

### 💻 Desarrollo

| Documento | Descripción |
|-----------|-------------|
| **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** | 💻 Setup local (backend + frontend) |
| **[docs/API.md](./docs/API.md)** | 📡 Endpoints de la API con ejemplos |
| **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** | 🚀 Despliegues posteriores e integración CI/CD |

## 📊 Modelo de Datos

### Participante

```json
{
  "id": "uuid",
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "fecha_registro": "datetime",
  "estado": "activo|inactivo",
  "metadata": {}
}
```

## 🔐 Variables de Entorno

### Backend

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
AWS_REGION=us-east-1
LOG_LEVEL=INFO
```

### Frontend

```bash
VITE_API_URL=https://api.example.com
VITE_STAGE=production
```

## 📝 Licencia

MIT

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.
