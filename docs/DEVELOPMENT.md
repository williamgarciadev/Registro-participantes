# Guía de Desarrollo

Esta guía describe cómo configurar el entorno de desarrollo local.

## Requisitos

- Python 3.11+
- Node.js 18+
- Docker y Docker Compose
- PostgreSQL 15+ (opcional, se puede usar Docker)

## Configuración del Backend

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Registro-participantes
```

### 2. Configurar entorno virtual de Python

```bash
cd backend
python -m venv venv

# Activar el entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:
```bash
STAGE=dev
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/participantes
LOG_LEVEL=DEBUG
```

### 5. Iniciar PostgreSQL con Docker

```bash
docker-compose up -d postgres
```

O sin Docker:
```bash
# Instalar PostgreSQL localmente
# macOS
brew install postgresql@15
brew services start postgresql@15

# Crear base de datos
createdb participantes
```

### 6. Ejecutar migraciones

```bash
# Crear una migración inicial
alembic revision --autogenerate -m "Initial migration"

# Ejecutar migraciones
alembic upgrade head
```

### 7. Iniciar el servidor de desarrollo

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 8. Desarrollo con Docker Compose (alternativa)

```bash
docker-compose up
```

Esto iniciará tanto PostgreSQL como la API.

## Configuración del Frontend

### 1. Navegar al directorio del frontend

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:
```bash
VITE_API_URL=http://localhost:8000
VITE_STAGE=development
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## Estructura del Proyecto

```
Registro-participantes/
├── backend/
│   ├── src/
│   │   ├── api/              # Endpoints de la API
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   ├── core/             # Configuración
│   │   ├── database/         # Configuración de DB
│   │   ├── models/           # Modelos SQLAlchemy
│   │   ├── schemas/          # Schemas Pydantic
│   │   └── services/         # Lógica de negocio
│   ├── tests/                # Tests
│   ├── alembic/              # Migraciones
│   ├── requirements.txt      # Dependencias
│   └── Dockerfile            # Dockerfile para Lambda
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas
│   │   ├── services/         # Servicios API
│   │   └── types/            # Tipos TypeScript
│   ├── public/               # Archivos estáticos
│   └── package.json          # Dependencias
├── docs/                     # Documentación
└── template.yaml             # AWS SAM template
```

## Comandos Útiles

### Backend

```bash
# Ejecutar tests
pytest

# Ejecutar tests con coverage
pytest --cov=src tests/

# Formatear código
black src/

# Linting
flake8 src/

# Type checking
mypy src/

# Crear nueva migración
alembic revision --autogenerate -m "description"

# Ver historial de migraciones
alembic history

# Rollback a versión anterior
alembic downgrade -1
```

### Frontend

```bash
# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de build de producción
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

## Testing

### Backend

Crear tests en `backend/tests/`:

```python
# tests/test_participantes.py
import pytest
from httpx import AsyncClient
from src.main import app

@pytest.mark.asyncio
async def test_create_participante():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/participantes", json={
            "nombre": "Test",
            "apellido": "User",
            "email": "test@example.com"
        })
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

Ejecutar tests:
```bash
pytest
```

### Frontend

Los tests del frontend se pueden agregar usando Vitest o Jest.

## Debugging

### Backend

Usar el debugger de Python:

```python
# Agregar breakpoint
import pdb; pdb.set_trace()

# O con ipdb (más features)
import ipdb; ipdb.set_trace()
```

O usar VS Code debugger con esta configuración en `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "src.main:app",
        "--reload"
      ],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
```

### Frontend

Usar las DevTools del navegador o VS Code debugger.

## Variables de Entorno

### Backend (.env)

```bash
# Entorno
STAGE=dev

# Base de datos
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# AWS (solo para Lambda)
DB_SECRET_ARN=arn:aws:secretsmanager:...
AWS_REGION=us-east-1

# Logging
LOG_LEVEL=DEBUG
POWERTOOLS_SERVICE_NAME=registro-participantes
POWERTOOLS_LOG_LEVEL=DEBUG
```

### Frontend (.env)

```bash
# API
VITE_API_URL=http://localhost:8000

# Entorno
VITE_STAGE=development
```

## Workflow de Desarrollo

1. **Crear una rama nueva**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Hacer cambios**
   - Escribir código
   - Escribir tests
   - Ejecutar tests localmente

3. **Commit**
   ```bash
   git add .
   git commit -m "feat: agregar nueva funcionalidad"
   ```

4. **Push**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

5. **Crear Pull Request**

## Troubleshooting

### Error: Cannot connect to database

Verificar:
1. PostgreSQL está corriendo: `docker-compose ps` o `brew services list`
2. Credenciales correctas en `.env`
3. Puerto 5432 no está siendo usado por otro proceso

### Error: Module not found

Backend:
```bash
pip install -r requirements.txt
```

Frontend:
```bash
npm install
```

### Error: Alembic can't find models

Asegurarse de importar los modelos en `alembic/env.py`:
```python
from src.models.participante import Participante
```

### Error: CORS en desarrollo

Verificar que `CORS_ORIGINS` en `backend/src/core/config.py` incluye `http://localhost:3000`

## Best Practices

1. **Código**
   - Seguir PEP 8 para Python
   - Usar TypeScript strict mode
   - Escribir tests para nuevas funcionalidades
   - Documentar funciones complejas

2. **Git**
   - Commits pequeños y frecuentes
   - Mensajes descriptivos
   - No hacer commit de archivos sensibles

3. **Base de datos**
   - Siempre crear migraciones para cambios en modelos
   - No modificar migraciones ya aplicadas
   - Probar migraciones en dev antes de prod

4. **API**
   - Validar todos los inputs
   - Manejar errores apropiadamente
   - Documentar endpoints en docstrings

## Recursos

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
