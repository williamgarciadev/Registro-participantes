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
.
├── backend/                 # Código del backend FastAPI
│   ├── src/
│   │   ├── api/            # Endpoints de la API
│   │   ├── models/         # Modelos de datos
│   │   ├── services/       # Lógica de negocio
│   │   ├── database/       # Configuración de base de datos
│   │   └── utils/          # Utilidades
│   ├── tests/              # Tests unitarios
│   ├── requirements.txt    # Dependencias de Python
│   └── Dockerfile          # Dockerfile para desarrollo local
├── frontend/               # Código del frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios API
│   │   └── utils/         # Utilidades
│   ├── public/            # Archivos estáticos
│   └── package.json       # Dependencias de Node.js
├── infrastructure/        # Infraestructura como código
│   ├── template.yaml     # AWS SAM template
│   └── samconfig.toml    # Configuración de SAM
└── docs/                 # Documentación adicional
```

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

### Backend Local

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### Frontend Local

```bash
cd frontend
npm install
npm run dev
```

### Deploy a AWS

```bash
# Deploy completo (backend + infraestructura)
sam build
sam deploy --guided

# Deploy del frontend
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name/
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

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
