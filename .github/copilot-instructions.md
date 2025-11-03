# Copilot Instructions - Registro de Participantes# Copilot Instructions - Registro de Participantes



> **Sistema de gestión empresarial profesional** con AWS Serverless, FastAPI y React  > **Sistema de gestión empresarial profesional** con AWS Serverless, FastAPI y React  

> Última actualización: Noviembre 3, 2025> Última actualización: Noviembre 3, 2025



## 🌐 Idioma## 🌐 Idioma



**SIEMPRE responder en español** - Código, comentarios, docs y explicaciones en español, términos técnicos en inglés cuando corresponda.**SIEMPRE responder en español** - Código, comentarios, docs y explicaciones en español, términos técnicos en inglés cuando corresponda.



---## 🏗️ Arquitectura del Sistema



## 🏗️ Arquitectura del Sistema### Stack Core

- **Backend:** FastAPI + SQLAlchemy 2.0 (async) + asyncpg

### Stack Core- **Lambda Wrapper:** Mangum (convierte ASGI → Lambda handler)

- **Backend:** FastAPI + SQLAlchemy 2.0 (async) + asyncpg- **Database:** PostgreSQL 15 (local Docker) / Aurora Serverless v2 (AWS)

- **Lambda Wrapper:** Mangum (convierte ASGI → Lambda handler)- **Frontend:** React 18 + TypeScript + Vite + React Query v5

- **Database:** PostgreSQL 15 (local Docker) / Aurora Serverless v2 (AWS)- **IaC:** AWS SAM (CloudFormation)

- **Frontend:** React 18 + TypeScript + Vite + React Query v5

- **IaC:** AWS SAM (CloudFormation)### Flujo de Datos Crítico

```

### Flujo de Datos CríticoAPI Gateway → Lambda (Mangum) → FastAPI → Service Layer → SQLAlchemy (async) → PostgreSQL

``````

API Gateway → Lambda (Mangum) → FastAPI → Service Layer → SQLAlchemy (async) → PostgreSQL

```**⚠️ IMPORTANTE:** Todo el backend es async (`async`/`await`). Nunca usar sesiones síncronas de SQLAlchemy.



**⚠️ IMPORTANTE:** Todo el backend es async (`async`/`await`). Nunca usar sesiones síncronas de SQLAlchemy.## 🎯 Patrones Obligatorios



---### 1. Service Layer Pattern (Backend)

**SIEMPRE** seguir esta estructura:

## 🎯 Patrones Obligatorios

```python

### 1. Service Layer Pattern (Backend)# backend/src/services/ejemplo_service.py

**SIEMPRE** seguir esta estructura:class EjemploService:

    @staticmethod

```python    async def create_item(db: AsyncSession, data: ItemCreate) -> Item:

# backend/src/services/ejemplo_service.py        """Docstring completo con Args, Returns, Raises."""

class EjemploService:        item = Item(**data.model_dump())

    @staticmethod        db.add(item)

    async def create_item(db: AsyncSession, data: ItemCreate) -> Item:        await db.commit()

        """Docstring completo con Args, Returns, Raises."""        await db.refresh(item)

        item = Item(**data.model_dump())        return item

        db.add(item)```

        await db.commit()

        await db.refresh(item)**Reglas:**

        return item- Todos los métodos son `@staticmethod` con `AsyncSession` como primer parámetro

```- La lógica de negocio vive en services, NO en endpoints

- Docstrings en español estilo Google

**Reglas:**

- Todos los métodos son `@staticmethod` con `AsyncSession` como primer parámetro### 2. Dependency Injection (DB)

- La lógica de negocio vive en services, NO en endpoints```python

- Docstrings en español estilo Google# Endpoints

@router.post("/items")

### 2. Dependency Injection (DB)async def create_item(

```python    data: ItemCreate,

# Endpoints    db: AsyncSession = Depends(get_db)  # ← Inyección

@router.post("/items")):

async def create_item(    return await ItemService.create_item(db, data)

    data: ItemCreate,```

    db: AsyncSession = Depends(get_db)  # ← Inyección

):**❌ NUNCA** crear sesiones manualmente en endpoints.

    return await ItemService.create_item(db, data)

```### 3. Alembic Migrations

**Al modificar modelos SQLAlchemy:**

**❌ NUNCA** crear sesiones manualmente en endpoints.```bash

# Dentro del contenedor backend

### 3. Alembic Migrationsalembic revision --autogenerate -m "descripcion_cambio"

**Al modificar modelos SQLAlchemy:**alembic upgrade head

```bash```

# Dentro del contenedor backend

alembic revision --autogenerate -m "descripcion_cambio"**CRÍTICO:** `backend/alembic/env.py` está configurado para usar `postgresql+asyncpg://` y leer `DATABASE_URL` del entorno.

alembic upgrade head

```### 4. React Query Pattern (Frontend)

```typescript

**CRÍTICO:** `backend/alembic/env.py` está configurado para usar `postgresql+asyncpg://` y leer `DATABASE_URL` del entorno.// Queries GET

const { data, isLoading } = useQuery({

### 4. React Query Pattern (Frontend)  queryKey: ['items', filters],

```typescript  queryFn: () => itemsApi.getAll(filters),

// Queries GET  staleTime: 5 * 60 * 1000

const { data, isLoading } = useQuery({})

  queryKey: ['items', filters],

  queryFn: () => itemsApi.getAll(filters),// Mutations POST/PUT/DELETE con optimistic updates

  staleTime: 5 * 60 * 1000const createMutation = useMutation({

})  mutationFn: itemsApi.create,

  onSuccess: () => {

// Mutations POST/PUT/DELETE con optimistic updates    queryClient.invalidateQueries({ queryKey: ['items'] })

const createMutation = useMutation({    toast.success('Item creado')

  mutationFn: itemsApi.create,  }

  onSuccess: () => {})

    queryClient.invalidateQueries({ queryKey: ['items'] })```

    toast.success('Item creado')

  }## 🔧 Comandos Críticos

})

```### Desarrollo Local (Docker)

```bash

---# Levantar stack completo

make -f Makefile.dev docker-up

## 🔧 Comandos Críticos

# Ver logs

### Desarrollo Local (Docker)make -f Makefile.dev docker-logs-backend

```bash

# Levantar stack completo# Acceder a bash del backend

make -f Makefile.dev docker-upmake -f Makefile.dev docker-bash-backend



# Ver logs# Aplicar migrations

make -f Makefile.dev docker-logs-backenddocker exec -it registro-participantes-api alembic upgrade head

```

# Acceder a bash del backend

make -f Makefile.dev docker-bash-backend### Testing Manual API

```powershell

# Aplicar migrations# Login

docker exec -it registro-participantes-api alembic upgrade head$response = Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/auth/login/json' `

```  -Method Post -Body (@{email='admin@example.com';password='admin123'} | ConvertTo-Json) `

  -ContentType 'application/json'

### Testing Manual API$token = $response.access_token

```powershell

# Login# Usar token

$response = Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/auth/login/json' `Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/users' `

  -Method Post -Body (@{email='admin@example.com';password='admin123'} | ConvertTo-Json) `  -Headers @{Authorization="Bearer $token"}

  -ContentType 'application/json'```

$token = $response.access_token

## 🔐 Seguridad

# Usar token

Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/users' `### Checklist Antes de Commit

  -Headers @{Authorization="Bearer $token"}- ✅ Sin secretos hardcodeados (usar `backend/.env`)

```- ✅ JWT en endpoints protegidos

- ✅ Pydantic/Zod validation en ambos lados

---- ✅ SQLAlchemy parámetros preparados (automático con ORM)

- ✅ CORS configurado en `backend/src/main.py`

## 🔐 Seguridad

### Pattern de Autenticación

### Checklist Antes de Commit```python

- ✅ Sin secretos hardcodeados (usar `backend/.env`)# Endpoint protegido

- ✅ JWT en endpoints protegidosfrom src.core.security import get_current_user

- ✅ Pydantic/Zod validation en ambos lados

- ✅ SQLAlchemy parámetros preparados (automático con ORM)@router.get("/protected")

- ✅ CORS configurado en `backend/src/main.py`async def protected_route(

    current_user: User = Depends(get_current_user)

### Pattern de Autenticación):

```python    return {"user_id": current_user.id}

# Endpoint protegido```

from src.core.security import get_current_user

## 📁 Estructura de Archivos

@router.get("/protected")

async def protected_route(---

    current_user: User = Depends(get_current_user)

):## 🎯 Principios de Desarrollo Core

    return {"user_id": current_user.id}

```### 1. Code Quality Standards

```yaml

---Código:

  - Escribir código limpio, legible y bien documentado

## 📁 Estructura de Archivos  - Seguir principios SOLID y DRY

  - Implementar manejo de errores robusto

```  - Usar type hints (Python) y tipos estrictos (TypeScript)

backend/src/  

├── api/v1/endpoints/       # Controllers (thin layer)Testing:

│   ├── auth/router.py      # Login, password reset  - Escribir tests para funcionalidad nueva

│   ├── participantes.py  - Mantener cobertura mínima del 70%

│   └── users.py  - Tests unitarios + integración + E2E

├── models/                 # SQLAlchemy ORM models  

│   ├── participante.pyPerformance:

│   ├── user.py  - Optimizar queries de DB (usar índices, evitar N+1)

│   └── password_reset.py  - Implementar caching cuando sea apropiado

├── schemas/                # Pydantic schemas  - Lazy loading para componentes pesados

│   ├── participante.py  - Monitorear cold starts de Lambda

│   └── auth/```

│       └── password_reset.py

├── services/               # Business logic### 2. Security First Approach

│   ├── participante_service.pyAntes de cada commit, verificar:

│   ├── password_reset_service.py

│   └── email_service.py- ✅ **Datos sensibles:** Ningún secreto, token o credencial en el código

├── core/                   # Core functionality- ✅ **Autenticación:** Endpoints protegidos con JWT cuando corresponda

│   ├── config.py           # Settings (Pydantic)- ✅ **Validación:** Input sanitization en frontend y backend (defensa en profundidad)

│   └── security.py         # JWT, password hashing- ✅ **SQL Injection:** Usar ORM (SQLAlchemy) con parámetros preparados

├── database/- ✅ **XSS Prevention:** Sanitizar HTML, usar Content Security Policy

│   └── session.py          # AsyncSession factory- ✅ **CORS:** Configuración estricta solo para dominios permitidos

└── main.py                 # FastAPI app + Lambda handler- ✅ **Rate Limiting:** Implementado para endpoints públicos

```- ✅ **Environment Variables:** Secretos en AWS Secrets Manager, no en .env

- ✅ **Dependencies:** Auditar regularmente con `npm audit` y `pip-audit`

```

frontend/src/### 3. Workflow Metodológico

├── components/             # Shared components

│   └── Layout/```mermaid

├── pages/                  # Route componentsgraph LR

│   ├── LoginPage.tsx    A[📋 Analizar Request] --> B[📝 Plan en todo.md]

│   ├── ForgotPasswordPage.tsx    B --> C[✋ Esperar Aprobación]

│   └── ResetPasswordPage.tsx    C --> D[⚡ Implementar]

├── services/               # API clients    D --> E[🧪 Testing]

│   ├── api.ts              # Axios instance config    E --> F[📚 Documentar]

│   └── auth.ts    F --> G[💾 Commit + Push]

├── types/                  # TypeScript types    G --> H[🎉 Explicar Cambios]

├── contexts/               # React contexts```

│   └── AuthContext.tsx

└── App.tsx                 # Router setup#### Paso a Paso Detallado

```

**1. Análisis Inicial (5-10 min)**

---- Leer el request completo

- Buscar archivos relevantes con `grep_search` o `semantic_search`

## 🚀 Workflows de Desarrollo- Identificar dependencias y posibles side-effects

- Crear checklist en `tasks/todo.md`

### Desarrollo Local

**2. Plan Detallado**

**Inicio Rápido:**```markdown

```powershell## [Título de la Tarea]

# 1. Levantar stack completo

make -f Makefile.dev docker-up### Objetivo

[Descripción clara del resultado esperado]

# ✅ Backend: http://localhost:8000

# ✅ Docs: http://localhost:8000/docs### Archivos a Modificar

# ✅ Database: localhost:5432- [ ] `backend/src/api/v1/endpoints/ejemplo.py` - Agregar endpoint

- [ ] `frontend/src/pages/EjemploPage.tsx` - Crear UI

# 2. Frontend (en terminal separado)- [ ] `backend/tests/test_ejemplo.py` - Tests unitarios

cd frontend

npm install### Checklist Técnico

npm run dev- [ ] Validación de input (Pydantic/Zod)

- [ ] Manejo de errores

# ✅ Frontend: http://localhost:5173- [ ] Logging apropiado

```- [ ] Tests escritos

- [ ] Documentación actualizada

**Hot Reload:**

- Backend: Uvicorn con `--reload` (cambios Python se recargan automáticamente)### Riesgos/Consideraciones

- Frontend: Vite HMR (Hot Module Replacement)- Puede afectar el rendimiento si hay muchos registros

- Requiere migración de DB

### Testing```



**Backend:****3. Aprobación del Usuario**

```powershell> 🛑 **CRITICAL:** NO ejecutar cambios sin aprobación explícita del usuario

pytest tests/unit -v

pytest --cov=src --cov-report=html**4. Implementación Incremental**

```- Un cambio a la vez

- Commits pequeños y atómicos

**Frontend:**- Probar después de cada cambio significativo

```powershell- Marcar tareas como completadas en `todo.md`

npm run test:unit

npm run test:e2e**5. Testing Riguroso**

``````bash

# Backend

### Deploymentpytest tests/test_ejemplo.py -v --cov



**Backend (AWS SAM):**# Frontend

```powershellnpm run test:unit

sam build --use-containernpm run test:e2e

sam deploy --guided

```# Integration

curl -X POST http://localhost:8000/api/v1/ejemplo -H "Content-Type: application/json"

**Frontend (S3 + CloudFront):**```

```powershell

npm run build**6. Documentación Actualizada**

aws s3 sync dist/ s3://bucket/ --delete- Comentarios en código complejo

```- Actualizar `docs/API.md` si hay nuevos endpoints

- Agregar ejemplos de uso

---- Registrar decisiones arquitectónicas importantes



## 🐛 Common Pitfalls**7. Control de Versiones**

```bash

### 1. CORS Errors# Commit message format: tipo(scope): descripción corta

**Solución:** Configurar orígenes permitidos en `backend/src/core/config.py`

```pythongit commit -m "feat(participantes): agregar filtro por fecha de inscripción"

CORS_ORIGINS: list[str] = [git commit -m "fix(auth): corregir validación de token expirado"

    "http://localhost:5173",git commit -m "docs(api): actualizar documentación de endpoints"

    "https://app.example.com"

]# Tipos: feat, fix, docs, style, refactor, test, chore

``````



### 2. Frontend Env Vars**8. Explicación Post-Implementación**

**Solución:** Usar prefijo `VITE_````markdown

```bash## ✅ Cambios Implementados

# ✅ BIEN

VITE_API_URL=https://api.example.com### 🎯 Objetivo Alcanzado

```[Descripción del resultado]



### 3. Lambda Cold Starts### 📁 Archivos Modificados

**Solución:** Aumentar memoria en `template.yaml`1. **backend/src/api/v1/endpoints/participantes.py** (líneas 45-67)

```yaml   - Agregado endpoint GET /api/v1/participantes/stats

MemorySize: 512  # ← Aumentar de 128 a 512 MB   - Retorna estadísticas agregadas de participantes

```

2. **frontend/src/pages/DashboardPage.tsx** (líneas 12-89)

---   - Integrado componente StatsCards

   - Consume nuevo endpoint de estadísticas

## 💡 Convenciones Específicas

### 🔄 Flujo de Funcionamiento

### Naming Conventions1. Usuario accede al Dashboard

2. React Query hace fetch a /api/v1/participantes/stats

**Python:**3. Lambda procesa request y consulta Aurora

```python4. Aurora ejecuta query agregado con GROUP BY

# snake_case para variables/funciones5. Respuesta se cachea por 5 minutos

user_email = "test@example.com"6. Frontend renderiza cards con animaciones



# PascalCase para classes### 💡 Decisiones Técnicas

class ParticipanteService:- **Por qué Redis Cache:** Reducir carga en Aurora para queries frecuentes

    pass- **Por qué React Query:** Manejo automático de cache y revalidación

- **Por qué animaciones:** Mejorar UX y percepción de velocidad

# UPPER_SNAKE_CASE para constants

MAX_ITEMS_PER_PAGE = 100### 🧪 Testing Realizado

```- ✅ Tests unitarios (8 casos)

- ✅ Tests de integración (3 escenarios)

**TypeScript:**- ✅ Validación manual en localhost

```typescript- ✅ Performance test (50 req/s sin degradación)

// camelCase para variables/funciones

const userName = "John"### ⚠️ Impacto en Sistema

- **Positivo:** Dashboard 3x más rápido

// PascalCase para types/interfaces/components- **Consideraciones:** Cache invalidación cuando se crea nuevo participante

interface UserData {}- **Monitoreo:** Revisar métricas de Lambda en 24h

function UserCard() {}```



// UPPER_SNAKE_CASE para constants---

const API_BASE_URL = "https://api.example.com"

```---



### Error Handling## 🏗️ Arquitectura del Sistema



**Backend:**### Stack Tecnológico

```python

# ✅ Excepciones específicas con contexto```yaml

raise HTTPException(Backend:

    status_code=status.HTTP_404_NOT_FOUND,  Runtime: Python 3.11 (AWS Lambda)

    detail=f"Participante con email '{email}' no encontrado"  Framework: FastAPI 0.104+

)  ORM: SQLAlchemy 2.0 (Async)

```  Validation: Pydantic v2

  Database Driver: asyncpg

**Frontend:**  

```typescriptFrontend:

// ✅ Error handling con React Query + Toast  Runtime: React 18 + TypeScript 5

const mutation = useMutation({  Build Tool: Vite 5

  onError: (error: AxiosError) => {  State Management: React Query v5 (TanStack)

    toast.error(error.response?.data?.detail || 'Error')  Forms: React Hook Form + Zod

  }  UI: Tailwind CSS + Lucide Icons

})  Testing: Playwright + Vitest

```  

Infrastructure:

### Logging  IaC: AWS SAM (CloudFormation)

  Compute: Lambda (512MB memory)

**Backend:**  API: API Gateway HTTP API

```python  Database: Aurora Serverless v2 (PostgreSQL 15)

from aws_lambda_powertools import Logger  Storage: S3 (frontend assets)

  CDN: CloudFront

logger = Logger(service="api")  Secrets: AWS Secrets Manager

logger.info("Creating item", extra={"email": data.email})  Monitoring: CloudWatch + X-Ray

```  

Development:

---  Containerization: Docker + Docker Compose

  Local DB: PostgreSQL 15 (Docker)

## 🎯 Workflow Metodológico  Package Managers: pip + npm

```

**1. Análisis** (5-10 min)

- Leer request completo### Arquitectura de Capas

- Buscar archivos relevantes

- Crear checklist en `tasks/todo.md````

┌─────────────────────────────────────────────────────────────┐

**2. Plan**│                      CloudFront (CDN)                        │

- Escribir plan detallado en markdown│                    S3 Bucket (Frontend)                      │

- Identificar archivos a modificar└─────────────────────────────────────────────────────────────┘

- Listar riesgos/consideraciones                              ▲

                              │ HTTPS

**3. Aprobación**                              ▼

> 🛑 NO ejecutar cambios sin aprobación del usuario┌─────────────────────────────────────────────────────────────┐

│                    API Gateway HTTP API                      │

**4. Implementación**│                    /api/* → Lambda Proxy                     │

- Cambios pequeños y atómicos└─────────────────────────────────────────────────────────────┘

- Probar después de cada cambio                              ▲

- Commits descriptivos                              │ Invoke

                              ▼

**5. Testing**┌─────────────────────────────────────────────────────────────┐

```bash│                      Lambda Function                         │

pytest -v│  ┌──────────────────────────────────────────────────────┐  │

npm run test:unit│  │           FastAPI App (via Mangum)                    │  │

```│  │  ┌────────────────────────────────────────────────┐  │  │

│  │  │  Controllers (api/v1/endpoints/)                │  │  │

**6. Documentación**│  │  │         ↓                                       │  │  │

- Actualizar docs relevantes│  │  │  Services (services/) ← Business Logic         │  │  │

- Comentarios en código complejo│  │  │         ↓                                       │  │  │

│  │  │  Models (models/) ← SQLAlchemy ORM             │  │  │

**7. Commit**│  │  └────────────────────────────────────────────────┘  │  │

```bash│  └──────────────────────────────────────────────────────┘  │

git commit -m "feat(scope): descripción"└─────────────────────────────────────────────────────────────┘

```                              ▲

                              │ asyncpg

---                              ▼

┌─────────────────────────────────────────────────────────────┐

## 🔑 Puntos Clave│           Aurora Serverless v2 (PostgreSQL)                  │

│                     Min: 0.5 ACU                            │

1. **Todo es async** en backend - usar `await` para DB└─────────────────────────────────────────────────────────────┘

2. **Service Layer obligatorio** - nunca lógica en endpoints```

3. **Dependency Injection** - `db: AsyncSession = Depends(get_db)`

4. **React Query** para server state - cache, optimistic updates### Decisiones Arquitectónicas Clave

5. **Alembic migrations** - siempre al modificar modelos

6. **Mangum wrapper** - convierte FastAPI para Lambda#### 1. Lambda + Mangum Wrapper

7. **JWT authentication** - `get_current_user` para endpoints protegidos**Decisión:** Usar `mangum` para convertir FastAPI (ASGI) en manejador Lambda

8. **Environment variables** - `VITE_` prefix en frontend```python

9. **Español en código** - comentarios y mensajes en español# backend/src/main.py

10. **Security first** - validar en ambos ladosfrom mangum import Mangum

from fastapi import FastAPI

---

app = FastAPI()

## 📚 Documentación de Referencia# ... routes ...



**Para empezar:**# Handler para Lambda

- `DOCUMENTACION/COMIENZA_AQUI.md` - Setup inicialhandler = Mangum(app, lifespan="off")

- `docs/DEVELOPMENT.md` - Desarrollo local```



**Para deployment:****Razones:**

- `deploy-docs/AWS_DEPLOYMENT_OVERVIEW.md` - Arquitectura AWS- ✅ FastAPI no es nativamente compatible con Lambda

- `deploy-docs/AWS_QUICK_COMMANDS.md` - Comandos rápidos- ✅ Mangum maneja la conversión de eventos API Gateway

- ✅ Permite desarrollo local con Uvicorn sin cambios

**Para troubleshooting:**- ⚠️ Cold starts: primera request ~500ms, posteriores ~50ms

- `troubleshooting/` - Soluciones a errores comunes

#### 2. Service Layer Pattern

**API:****Decisión:** Separar lógica de negocio de controladores

- `docs/API.md` - Documentación de endpoints

- `http://localhost:8000/docs` - Swagger interactivo (local)**Estructura:**

```

---Controller → Valida request/response (Pydantic schemas)

    ↓

**Última actualización:** Noviembre 3, 2025  Service → Lógica de negocio (transacciones, reglas)

**Versión:** 2.0.0    ↓

Model → Acceso a datos (SQLAlchemy ORM)
```

**Beneficios:**
- Testeable: Services son funciones puras con mocks fáciles
- Reusable: Múltiples endpoints pueden usar mismo servicio
- Mantenible: Cambios de negocio aislados en services/

#### 3. Async Everywhere
**Decisión:** Todo el backend es asíncrono (`async`/`await`)

```python
# ✅ CORRECTO - Async session + async methods
@staticmethod
async def get_all(db: AsyncSession, skip: int = 0) -> List[Participante]:
    result = await db.execute(
        select(Participante).offset(skip).limit(100)
    )
    return result.scalars().all()

# ❌ INCORRECTO - Mezclar sync/async
def get_all(db: Session):  # No usar Session sync
    return db.query(Participante).all()
```

**Por qué:**
- Lambda se beneficia de I/O no bloqueante
- Aurora Serverless optimizado para conexiones async
- FastAPI async es 2-3x más rápido que sync

#### 4. Dual Environment Strategy
**Desarrollo Local:**
```bash
# Docker Compose con hot-reload
docker-compose -f docker-compose.dev.yml up

# Backend: http://localhost:8000 (Uvicorn con --reload)
# Frontend: http://localhost:5173 (Vite dev server)
# Database: PostgreSQL en contenedor
```

**Producción AWS:**
```bash
# SAM deploy - Infrastructure as Code
sam build && sam deploy

# Lambda + API Gateway + Aurora Serverless v2
# Frontend en S3 + CloudFront
```

**Ventajas:**
- Paridad ambiente dev/prod (mismo PostgreSQL 15)
- Desarrollo rápido sin costos de AWS
- Deploy reproducible con SAM template

---

## 📐 Convenciones de Proyecto

### Backend (FastAPI + SQLAlchemy)

#### 1. Service Layer Pattern
**SIEMPRE usar este patrón:**

```python
# ✅ services/participante_service.py
class ParticipanteService:
    @staticmethod
    async def create_participante(
        db: AsyncSession, 
        data: ParticipanteCreate
    ) -> Participante:
        """
        Crea un nuevo participante con validación de duplicados.
        
        Args:
            db: Sesión asíncrona de base de datos
            data: Datos validados del participante
            
        Returns:
            Participante creado con ID asignado
            
        Raises:
            ValueError: Si email ya existe
        """
        # Verificar duplicado
        existing = await db.execute(
            select(Participante).where(Participante.email == data.email)
        )
        if existing.scalar_one_or_none():
            raise ValueError(f"Email {data.email} ya está registrado")
        
        # Crear participante
        participante = Participante(**data.model_dump())
        db.add(participante)
        await db.commit()
        await db.refresh(participante)
        return participante
```

**Reglas:**
- Todos los métodos son `@staticmethod` con `AsyncSession`
- Docstrings completos (Google style)
- Levantar excepciones específicas (no genéricas)
- Manejar transacciones con `await db.commit()`

#### 2. Dependency Injection para DB
```python
# ✅ api/v1/endpoints/participantes.py
from database.session import get_db

@router.post("/", response_model=ParticipanteResponse)
async def create_participante(
    data: ParticipanteCreate,
    db: AsyncSession = Depends(get_db)  # ← Inyección de dependencia
):
    """Endpoint para crear participante."""
    participante = await ParticipanteService.create_participante(db, data)
    return participante
```

**NO hacer:**
```python
# ❌ NUNCA crear sesión manualmente en endpoint
@router.post("/")
async def create_participante(data: ParticipanteCreate):
    db = AsyncSessionLocal()  # ❌ MAL
    try:
        participante = await ParticipanteService.create_participante(db, data)
        await db.commit()
        return participante
    finally:
        await db.close()
```

#### 3. Configuración con Pydantic Settings
```python
# ✅ core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/db"
    DB_SECRET_ARN: str | None = None  # Para Aurora Serverless
    
    # AWS
    AWS_REGION: str = "us-east-1"
    
    # Security
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**Uso en código:**
```python
from core.config import settings

# ✅ Acceder a config
engine = create_async_engine(settings.DATABASE_URL)
```

#### 4. Estructura de Modelos SQLAlchemy
```python
# ✅ models/participante.py
from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from database.session import Base

class Participante(Base):
    __tablename__ = "participantes"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Required fields
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    
    # Optional fields
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    # Timestamps automáticos
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<Participante {self.email}>"
```

**Reglas:**
- Usar `Mapped[]` para type hints (SQLAlchemy 2.0 style)
- Índices en campos que se usan en WHERE/JOIN
- `created_at`/`updated_at` automáticos con `func.now()`
- Constraints de DB (unique, not null) en modelo

#### 5. Schemas Pydantic para Validación
```python
# ✅ schemas/participante.py
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime

class ParticipanteBase(BaseModel):
    """Schema base compartido."""
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telefono: str | None = Field(None, pattern=r'^\+?[\d\s-]{10,20}$')

class ParticipanteCreate(ParticipanteBase):
    """Schema para crear (sin ID)."""
    
    @field_validator('nombre')
    @classmethod
    def nombre_no_vacio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Nombre no puede ser solo espacios')
        return v.strip().title()  # Capitalizar

class ParticipanteUpdate(BaseModel):
    """Schema para actualizar (todos opcionales)."""
    nombre: str | None = Field(None, min_length=2, max_length=100)
    email: EmailStr | None = None
    telefono: str | None = None

class ParticipanteResponse(ParticipanteBase):
    """Schema para respuestas (incluye ID y timestamps)."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Para convertir desde ORM
```

**Naming convention:**
- `*Base`: Campos compartidos
- `*Create`: Para POST (sin ID, campos requeridos)
- `*Update`: Para PUT/PATCH (todos opcionales)
- `*Response`: Para respuestas (incluye ID, timestamps, relaciones)

### Frontend (React + TypeScript)

#### 1. Design System con CSS Variables
```css
/* ✅ styles/tokens.css */
:root {
  /* Colores semánticos */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  
  /* Texto */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  
  /* Backgrounds */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Timing */
  --motion-fast: 150ms;
  --motion-base: 250ms;
  --motion-slow: 350ms;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

**Uso en componentes:**
```tsx
// ✅ Usar tokens semánticos
<button style={{
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-primary)',
  transition: `all var(--motion-base)`,
  boxShadow: 'var(--shadow-md)'
}}>
  Guardar
</button>

// ❌ NO hardcodear colores
<button style={{ backgroundColor: '#3b82f6' }}>  {/* MAL */}
```

#### 2. Animaciones para UX Premium
```css
/* ✅ styles/animations.css */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slide-up var(--motion-base) ease-out;
}

.animate-fade-in {
  animation: fade-in var(--motion-base) ease-out;
}

.animate-scale-in {
  animation: scale-in var(--motion-base) ease-out;
}
```

**Aplicar en componentes:**
```tsx
// ✅ Animar entrada de componentes
<div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
  <ParticipanteCard participante={data} />
</div>

// ✅ Stagger múltiples items
{participantes.map((p, index) => (
  <div
    key={p.id}
    className="animate-fade-in"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <ParticipanteRow data={p} />
  </div>
))}
```

#### 3. React Query para Server State
```typescript
// ✅ pages/ParticipantesPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { participantesApi } from '@/services/participantes'

export default function ParticipantesPage() {
  const queryClient = useQueryClient()
  
  // GET - Lista con auto-refetch y cache
  const { data, isLoading, error } = useQuery({
    queryKey: ['participantes', filters],  // Cache key único
    queryFn: () => participantesApi.getAll(filters),
    staleTime: 5 * 60 * 1000,  // 5 min cache
    refetchOnWindowFocus: true  // Refetch al volver a pestaña
  })
  
  // POST - Crear con optimistic update
  const createMutation = useMutation({
    mutationFn: participantesApi.create,
    onMutate: async (newData) => {
      // Cancelar refetch automáticos
      await queryClient.cancelQueries({ queryKey: ['participantes'] })
      
      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData(['participantes'])
      
      // Optimistic update
      queryClient.setQueryData(['participantes'], (old: any) => ({
        ...old,
        data: [...old.data, { ...newData, id: 'temp-id' }]
      }))
      
      return { previousData }
    },
    onError: (err, newData, context) => {
      // Rollback en caso de error
      queryClient.setQueryData(['participantes'], context?.previousData)
      toast.error('Error al crear participante')
    },
    onSuccess: () => {
      // Invalidar cache para refetch
      queryClient.invalidateQueries({ queryKey: ['participantes'] })
      toast.success('Participante creado exitosamente')
    }
  })
  
  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {data && <ParticipantesList data={data} />}
      
      <button onClick={() => createMutation.mutate(formData)}>
        {createMutation.isPending ? 'Guardando...' : 'Crear'}
      </button>
    </div>
  )
}
```

**Reglas React Query:**
- `queryKey` descriptivo y único (incluir filtros/params)
- `staleTime` para reducir refetch innecesarios
- Optimistic updates para UX instantánea
- Invalidate queries después de mutations
- Manejar `isLoading`, `isPending`, `error` en UI

#### 4. Forms con React Hook Form + Zod
```typescript
// ✅ components/ParticipanteForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema de validación
const participanteSchema = z.object({
  nombre: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre muy largo'),
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  telefono: z.string()
    .regex(/^\+?[\d\s-]{10,20}$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  fecha_nacimiento: z.string()
    .refine((date) => {
      const age = (Date.now() - new Date(date).getTime()) / 31557600000
      return age >= 18
    }, 'Debe ser mayor de 18 años')
})

type ParticipanteFormData = z.infer<typeof participanteSchema>

export default function ParticipanteForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ParticipanteFormData>({
    resolver: zodResolver(participanteSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: ''
    }
  })
  
  const onSubmitForm = async (data: ParticipanteFormData) => {
    try {
      await onSubmit(data)
      reset()  // Limpiar form después de éxito
      toast.success('Participante guardado')
    } catch (error) {
      toast.error('Error al guardar')
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label htmlFor="nombre">Nombre completo</label>
        <input
          {...register('nombre')}
          id="nombre"
          className={errors.nombre ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm mt-1">
            {errors.nombre.message}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className={errors.email ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">
            {errors.email.message}
          </p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
```

**Ventajas:**
- Validación en cliente antes de enviar
- Type-safe (TypeScript infiere tipos de Zod)
- Mensajes de error personalizados
- Performance optimizado (solo re-render campos modificados)

#### 5. Page Header Context Pattern
```typescript
// ✅ contexts/PageHeaderContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

interface PageHeaderConfig {
  title: string
  subtitle?: string
  actions?: ReactNode
}

const PageHeaderContext = createContext<{
  header: PageHeaderConfig | null
  setHeader: (config: PageHeaderConfig) => void
  resetHeader: () => void
}>({ header: null, setHeader: () => {}, resetHeader: () => {} })

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeaderState] = useState<PageHeaderConfig | null>(null)
  
  const setHeader = (config: PageHeaderConfig) => setHeaderState(config)
  const resetHeader = () => setHeaderState(null)
  
  return (
    <PageHeaderContext.Provider value={{ header, setHeader, resetHeader }}>
      {children}
    </PageHeaderContext.Provider>
  )
}

export const usePageHeader = () => useContext(PageHeaderContext)
```

**Uso en páginas:**
```typescript
// ✅ pages/ParticipantesPage.tsx
import { usePageHeader } from '@/contexts/PageHeaderContext'
import { Plus } from 'lucide-react'

export default function ParticipantesPage() {
  const { setHeader, resetHeader } = usePageHeader()
  
  useEffect(() => {
    setHeader({
      title: 'Participantes',
      subtitle: 'Gestiona todos los participantes del sistema',
      actions: (
        <button className="btn-primary">
          <Plus size={20} />
          Nuevo Participante
        </button>
      )
    })
    
    return () => resetHeader()  // Cleanup al desmontar
  }, [setHeader, resetHeader])
  
  return <div>{/* Contenido de la página */}</div>
}
```

---

---

## 🗂️ Organización de Archivos

### Estructura Backend (FastAPI)
```
backend/src/
├── api/v1/
│   └── endpoints/       # Controllers (thin layer)
│       ├── auth.py      # Login, register, refresh token
│       ├── participantes.py  # CRUD participantes
│       └── users.py     # Gestión de usuarios
│
├── models/              # SQLAlchemy ORM models
│   ├── participante.py  # Tabla participantes
│   ├── user.py          # Tabla users
│   └── base.py          # Base class compartida
│
├── schemas/             # Pydantic schemas
│   ├── participante.py  # Create/Update/Response schemas
│   ├── auth/
│   │   ├── login.py     # LoginRequest/TokenResponse
│   │   └── register.py
│   └── user/
│       └── user.py
│
├── services/            # Business logic
│   ├── participante_service.py
│   ├── auth_service.py
│   └── user_service.py
│
├── core/                # Core functionality
│   ├── config.py        # Settings (Pydantic)
│   ├── security.py      # JWT, password hashing
│   └── exceptions.py    # Custom exceptions
│
├── database/            # DB configuration
│   ├── session.py       # AsyncSession factory
│   └── base.py          # Declarative base
│
└── main.py              # FastAPI app + Lambda handler
```

### Estructura Frontend (React)
```
frontend/src/
├── components/          # Shared components
│   ├── Layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── ParticipanteForm.tsx
│   ├── ParticipanteCard.tsx
│   └── ui/              # Generic UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
│
├── pages/               # Route components
│   ├── HomePage.tsx
│   ├── ParticipantesPage.tsx
│   ├── LoginPage.tsx
│   └── NotFoundPage.tsx
│
├── services/            # API clients
│   ├── api.ts           # Axios instance config
│   ├── participantes.ts # participantesApi.getAll(), create()
│   └── auth.ts          # authApi.login(), register()
│
├── types/               # TypeScript types
│   ├── participante.ts
│   ├── user.ts
│   └── api.ts           # Response types
│
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── PageHeaderContext.tsx
│
├── hooks/               # Custom hooks
│   ├── useAuth.ts
│   └── useDebounce.ts
│
├── utils/               # Utility functions
│   ├── format.ts        # Date/number formatting
│   └── validation.ts
│
├── styles/              # Global styles
│   ├── tokens.css       # Design system tokens
│   ├── animations.css   # Animation keyframes
│   └── global.css       # Reset, base styles
│
├── App.tsx              # Router setup
└── main.tsx             # React root + providers
```

### Reglas de Organización

**Backend:**
- Un archivo por modelo, servicio y controller
- Schemas agrupados por dominio (`auth/`, `user/`)
- Tests espejo la estructura: `tests/api/v1/endpoints/test_participantes.py`
- Migrations en `alembic/versions/`

**Frontend:**
- Componentes compartidos en `components/`
- Componentes de ruta en `pages/`
- Un servicio API por recurso
- Colocar tipos cerca de su uso (o en `types/` si es compartido)

---

## 🚀 Workflows de Desarrollo

### Desarrollo Local

#### Inicio Rápido
```powershell
# 1. Clonar repositorio
git clone <repo-url>
cd Registro-participantes

# 2. Levantar stack completo
make -f Makefile.dev docker-up

# ✅ Backend: http://localhost:8000
# ✅ Docs interactivos: http://localhost:8000/docs
# ✅ Database: localhost:5432

# 3. Frontend (en terminal separado)
cd frontend
npm install
npm run dev

# ✅ Frontend: http://localhost:5173
```

#### Hot Reload
- **Backend:** Uvicorn con `--reload` (cambios Python se recargan automáticamente)
- **Frontend:** Vite HMR (Hot Module Replacement)
- **Database:** PostgreSQL persiste datos en volumen Docker

#### Debugging
```python
# Backend - Agregar breakpoints con debugpy
# En backend/src/main.py
import debugpy
debugpy.listen(("0.0.0.0", 5678))
print("⏳ Waiting for debugger attach...")
debugpy.wait_for_client()
```

```typescript
// Frontend - Usar React DevTools + debugger statement
function ParticipantesList() {
  const { data } = useQuery(...)
  
  debugger  // ← Pausa ejecución en Chrome DevTools
  
  return <div>...</div>
}
```

### Testing

#### Backend (pytest)
```powershell
# Tests unitarios
cd backend
pytest tests/unit -v

# Tests de integración
pytest tests/integration -v

# Con coverage
pytest --cov=src --cov-report=html

# Test específico
pytest tests/api/v1/endpoints/test_participantes.py::test_create_participante -v
```

#### Frontend (Vitest + Playwright)
```powershell
cd frontend

# Tests unitarios (componentes)
npm run test:unit

# Tests E2E (Playwright)
npm run test:e2e

# E2E con UI interactiva
npm run test:e2e -- --ui

# E2E en modo debug
npm run test:e2e -- --debug
```

#### Test Pyramid
```
         /\      E2E (Playwright)
        /  \     ↑ 10% - Flujos críticos completos
       /    \    
      /------\   Integration Tests
     /        \  ↑ 30% - API + DB + Services
    /          \ 
   /------------\ Unit Tests
  /              \ ↑ 60% - Funciones puras, componentes
```

### Deployment

#### 1. Backend (AWS SAM)
```powershell
# Build Lambda package
sam build --use-container

# Deploy a AWS
sam deploy --guided

# Outputs importantes:
# - ApiUrl: https://xxx.execute-api.us-east-1.amazonaws.com
# - FunctionArn: arn:aws:lambda:...
```

**Checklist pre-deploy:**
- ✅ Tests pasando (`pytest`)
- ✅ Secrets en AWS Secrets Manager (no en .env)
- ✅ CORS_ORIGINS actualizado con dominio de producción
- ✅ Aurora Serverless v2 en región correcta
- ✅ VPC configurado si hay recursos privados

#### 2. Frontend (S3 + CloudFront)
```powershell
cd frontend

# Build optimizado
npm run build  # Output: dist/

# Upload a S3
aws s3 sync dist/ s3://mi-bucket-frontend/ --delete

# Invalidar cache de CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

**Checklist pre-deploy:**
- ✅ Tests E2E pasando
- ✅ `VITE_API_URL` apunta a API Gateway de producción
- ✅ Build sin warnings (`npm run build`)
- ✅ Assets optimizados (imágenes comprimidas)

#### 3. CI/CD (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest
      
      - name: SAM Deploy
        run: |
          sam build --use-container
          sam deploy --no-confirm-changeset
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  
  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build
        run: |
          cd frontend
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to S3
        run: |
          aws s3 sync frontend/dist/ s3://${{ secrets.S3_BUCKET }}/ --delete
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_ID }} \
            --paths "/*"
```

---

## 🔧 Dependencias Críticas

### Backend
```toml
# pyproject.toml o requirements.txt

# Core framework
fastapi = "^0.104.0"
uvicorn[standard] = "^0.24.0"
pydantic = "^2.4.0"
pydantic-settings = "^2.0.0"

# Database
sqlalchemy = "^2.0.0"
asyncpg = "^0.29.0"      # PostgreSQL async driver
alembic = "^1.12.0"      # Migrations

# Lambda deployment
mangum = "^0.17.0"       # ⚠️ CRITICAL para Lambda

# AWS
aws-lambda-powertools = "^2.26.0"  # Logging + Tracing
boto3 = "^1.28.0"        # AWS SDK

# Security
python-jose[cryptography] = "^3.3.0"  # JWT
passlib[bcrypt] = "^1.7.4"            # Password hashing
python-multipart = "^0.0.6"            # Form data

# Testing
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
httpx = "^0.25.0"        # Async HTTP client para tests
```

**⚠️ NO REMOVER:**
- `mangum`: Sin esto, Lambda no puede ejecutar FastAPI
- `aws-lambda-powertools`: Provee structured logging y X-Ray tracing
- `asyncpg`: Driver más rápido para PostgreSQL async

### Frontend
```json
{
  "dependencies": {
    // Core
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    
    // State management
    "@tanstack/react-query": "^5.8.0",  // Server state
    
    // Forms
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    
    // UI
    "lucide-react": "^0.292.0",  // ⚠️ Icons - todos importar de aquí
    "react-toastify": "^9.1.3",   // Notifications
    
    // HTTP
    "axios": "^1.6.0"
  },
  "devDependencies": {
    // Build
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    
    // TypeScript
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    
    // Testing
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    
    // Styling
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

**⚠️ NO REMOVER:**
- `lucide-react`: Librería de iconos estándar del proyecto
- `react-toastify`: Inicializado en `main.tsx`, usado en todo el proyecto
- `@tanstack/react-query`: Core para manejo de server state

---

## 🚨 Common Pitfalls y Soluciones

### 1. Lambda Cold Starts
**Problema:** Primera request tarda 3-5 segundos
```
Error: Task timed out after 3.00 seconds
```

**Soluciones:**
```yaml
# template.yaml
Resources:
  ApiFunction:
    Properties:
      MemorySize: 512  # ← Aumentar de 128 a 512 MB
      Timeout: 30      # ← Aumentar timeout
      Environment:
        Variables:
          DB_CONNECTION_POOL_SIZE: 5  # ← Pool pequeño para Lambda
```

```python
# backend/src/database/session.py
# ✅ Configurar pool para Lambda
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=5,           # Pequeño para Lambda (no más de 10)
    max_overflow=0,        # Sin overflow
    pool_pre_ping=True,    # Verificar conexión antes de usar
    pool_recycle=3600      # Reciclar conexiones cada hora
)
```

### 2. CORS Errors
**Problema:**
```
Access to fetch at 'https://api.example.com' from origin 'https://app.example.com' 
has been blocked by CORS policy
```

**Solución:**
```python
# backend/src/core/config.py
class Settings(BaseSettings):
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",           # Local dev
        "https://app.example.com",         # Producción
        "https://d1234567890.cloudfront.net"  # CloudFront
    ]
```

```python
# backend/src/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Aurora Serverless Auto-Pause
**Problema:** Primera query después de inactividad tarda 30+ segundos
```
Error: Could not connect to server: Connection timed out
```

**Solución 1 - Deshabilitar auto-pause:**
```yaml
# template.yaml
DBCluster:
  Properties:
    ServerlessV2ScalingConfiguration:
      MinCapacity: 0.5  # ← Cambiar a 0.5+ para evitar pausa
      MaxCapacity: 1
```

**Solución 2 - Warming con EventBridge:**
```yaml
# template.yaml
KeepWarmRule:
  Type: AWS::Events::Rule
  Properties:
    ScheduleExpression: rate(5 minutes)  # Ping cada 5 min
    Targets:
      - Arn: !GetAtt ApiFunction.Arn
        Input: '{"httpMethod": "GET", "path": "/health"}'
```

### 4. Frontend Env Vars No Disponibles
**Problema:**
```typescript
console.log(import.meta.env.API_URL)  // undefined
```

**Solución:**
```bash
# ❌ MAL - Env vars deben tener prefijo VITE_
API_URL=https://api.example.com

# ✅ BIEN
VITE_API_URL=https://api.example.com
```

```typescript
// ✅ Acceder correctamente
const apiUrl = import.meta.env.VITE_API_URL

// ✅ Con type safety
// frontend/src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}
```

### 5. Database Migrations en Producción
**Problema:** Ejecutar migrations manualmente es propenso a errores

**Solución - Automatizar con Lambda Container Command:**
```yaml
# template.yaml
MigrationFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: backend/
    Handler: src.scripts.run_migrations.handler
    Environment:
      Variables:
        DB_SECRET_ARN: !Ref DatabaseSecret
    Events:
      Manual:
        Type: Api
        Properties:
          Path: /admin/migrate
          Method: POST
```

```python
# backend/src/scripts/run_migrations.py
from alembic import command
from alembic.config import Config

def handler(event, context):
    """Run Alembic migrations - llamar manualmente después de deploy."""
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    return {"statusCode": 200, "body": "Migrations completed"}
```

**Workflow:**
```bash
# 1. Deploy código nuevo
sam deploy

# 2. Ejecutar migrations
curl -X POST https://api.example.com/admin/migrate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📚 Documentación y Recursos

### Navegación Rápida

#### Para empezar:
- **Setup inicial:** `DOCUMENTACION/COMIENZA_AQUI.md`
- **Desarrollo local:** `docs/DEVELOPMENT.md`
- **Quick start Docker:** `DOCKER_QUICK_START.md`

#### Para deployment:
- **Overview de AWS:** `deploy-docs/AWS_DEPLOYMENT_OVERVIEW.md`
- **Checklist de deploy:** `deploy-docs/AWS_DEPLOYMENT_CHECKLIST.md`
- **Comandos rápidos:** `deploy-docs/AWS_QUICK_COMMANDS.md`

#### Para troubleshooting:
- **Error de Aurora:** `troubleshooting/SOLUCION_AURORA_VERSION.md`
- **Logs de CloudWatch:** `troubleshooting/SOLUCION_CLOUDWATCH_LOGS.md`
- **Parámetros de BD:** `troubleshooting/SOLUCION_PARAMETROS_BD.md`

#### Referencia API:
- **Docs estáticas:** `docs/API.md`
- **Docs interactivas:** http://localhost:8000/docs (local)
- **ReDoc:** http://localhost:8000/redoc (local)

### Comandos Útiles

```powershell
# Desarrollo local
make -f Makefile.dev docker-up      # Levantar stack
make -f Makefile.dev docker-down    # Bajar stack
make -f Makefile.dev docker-logs    # Ver logs

# Base de datos
make -f Makefile.dev db-migrate     # Correr migrations
make -f Makefile.dev db-shell       # Conectar a PostgreSQL

# Testing
make -f Makefile.dev test-api       # Tests backend
cd frontend && npm run test:e2e     # Tests E2E

# AWS
sam build --use-container           # Build Lambda
sam deploy --guided                 # Deploy interactivo
sam logs -n ApiFunction --tail      # Ver logs en tiempo real

# Frontend
cd frontend
npm run dev                          # Dev server
npm run build                        # Build producción
npm run preview                      # Preview build local
```

---

## 🎨 Mejores Prácticas Específicas del Proyecto

### 1. Naming Conventions

**Python (Backend):**
```python
# Variables y funciones: snake_case
user_email = "test@example.com"
def get_participante_by_id(participante_id: int):
    pass

# Classes: PascalCase
class ParticipanteService:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_PARTICIPANTES_PER_PAGE = 100
DATABASE_TIMEOUT_SECONDS = 30

# Private methods: _prefix
def _validate_internal_data(data):
    pass
```

**TypeScript (Frontend):**
```typescript
// Variables y funciones: camelCase
const userName = "John Doe"
function getUserById(id: number) {}

// Types y interfaces: PascalCase
interface ParticipanteData {
  id: number
  nombre: string
}

// Components: PascalCase
function ParticipanteCard() {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com"
const MAX_RETRIES = 3

// Files: kebab-case o PascalCase para components
// ✅ participante-form.tsx o ParticipanteForm.tsx
```

### 2. Error Handling

**Backend:**
```python
# ✅ Excepciones específicas con contexto
from fastapi import HTTPException, status

class ParticipanteService:
    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Participante:
        participante = await db.execute(
            select(Participante).where(Participante.email == email)
        )
        result = participante.scalar_one_or_none()
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participante con email '{email}' no encontrado"
            )
        
        return result
```

**Frontend:**
```typescript
// ✅ Error handling con React Query + Toast
const deleteMutation = useMutation({
  mutationFn: participantesApi.delete,
  onError: (error: AxiosError) => {
    if (error.response?.status === 404) {
      toast.error('Participante no encontrado')
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para eliminar')
    } else {
      toast.error('Error al eliminar participante')
    }
    console.error('Delete error:', error)  // Log detallado
  },
  onSuccess: () => {
    toast.success('Participante eliminado exitosamente')
    queryClient.invalidateQueries({ queryKey: ['participantes'] })
  }
})
```

### 3. Logging

**Backend (Structured Logging):**
```python
# ✅ Usar AWS Powertools Logger
from aws_lambda_powertools import Logger

logger = Logger(service="participantes-api")

@router.post("/")
async def create_participante(data: ParticipanteCreate, db: AsyncSession = Depends(get_db)):
    logger.info("Creating participante", extra={
        "email": data.email,
        "nombre": data.nombre
    })
    
    try:
        participante = await ParticipanteService.create_participante(db, data)
        logger.info("Participante created successfully", extra={
            "participante_id": participante.id
        })
        return participante
    except Exception as e:
        logger.error("Failed to create participante", extra={
            "error": str(e),
            "email": data.email
        })
        raise
```

**Frontend (Console + Sentry):**
```typescript
// ✅ Logging consistente
const logger = {
  info: (message: string, meta?: object) => {
    console.log(`[INFO] ${message}`, meta)
  },
  error: (message: string, error: Error, meta?: object) => {
    console.error(`[ERROR] ${message}`, error, meta)
    // TODO: Enviar a Sentry en producción
  },
  warn: (message: string, meta?: object) => {
    console.warn(`[WARN] ${message}`, meta)
  }
}

// Uso
logger.info('Fetching participantes', { filters })
logger.error('Failed to delete', error, { participanteId })
```

### 4. Performance Optimization

**Backend - Query Optimization:**
```python
# ✅ Usar eager loading para relaciones
from sqlalchemy.orm import selectinload

@staticmethod
async def get_with_eventos(db: AsyncSession, participante_id: int):
    result = await db.execute(
        select(Participante)
        .options(selectinload(Participante.eventos))  # ← Evita N+1
        .where(Participante.id == participante_id)
    )
    return result.scalar_one_or_none()

# ✅ Índices en columnas frecuentes
class Participante(Base):
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, index=True)  # Para ORDER BY
```

**Frontend - Code Splitting:**
```typescript
// ✅ Lazy load páginas pesadas
import { lazy, Suspense } from 'react'

const ParticipantesPage = lazy(() => import('@/pages/ParticipantesPage'))
const ReportesPage = lazy(() => import('@/pages/ReportesPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/participantes" element={<ParticipantesPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
      </Routes>
    </Suspense>
  )
}
```

### 5. Security Checklist

**Antes de cada PR/deploy:**
- [ ] No hay API keys, passwords o secrets en código
- [ ] Variables de entorno usadas para configuración sensible
- [ ] Endpoints protegidos con autenticación cuando corresponda
- [ ] Input validation en frontend Y backend (defense in depth)
- [ ] SQL queries usan parámetros preparados (no string concatenation)
- [ ] Passwords hasheados con bcrypt (nunca plain text)
- [ ] JWT con expiración razonable (<= 60 min)
- [ ] CORS configurado solo para dominios permitidos
- [ ] Rate limiting en endpoints públicos
- [ ] HTTPS enforced en producción
- [ ] Dependencies actualizadas (`npm audit`, `pip-audit`)

---

## 💡 Tips y Trucos

### 1. Hot Reload Rápido
```python
# backend/src/main.py
# ✅ Para desarrollo, deshabilitar validaciones pesadas
import os

DEBUG = os.getenv("DEBUG", "false").lower() == "true"

if DEBUG:
    # Skip expensive validations
    pass
```

### 2. Mock de APIs en Frontend
```typescript
// ✅ Mock API para desarrollo sin backend
// frontend/src/services/mocks.ts
export const mockParticipantes = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, nombre: 'María García', email: 'maria@example.com' },
]

// Usar en desarrollo
const USE_MOCKS = import.meta.env.DEV && false  // Toggle aquí

export async function getAll() {
  if (USE_MOCKS) return mockParticipantes
  
  const response = await api.get('/participantes')
  return response.data
}
```

### 3. Database Seeding
```python
# backend/src/scripts/seed.py
"""Poblar base de datos con datos de prueba."""
async def seed_database():
    async with AsyncSessionLocal() as db:
        # Crear usuarios de prueba
        usuarios = [
            User(email="admin@example.com", hashed_password=get_password_hash("admin123")),
            User(email="user@example.com", hashed_password=get_password_hash("user123")),
        ]
        db.add_all(usuarios)
        
        # Crear participantes
        participantes = [
            Participante(nombre="Juan Pérez", email="juan@test.com", telefono="+1234567890"),
            Participante(nombre="María García", email="maria@test.com", telefono="+0987654321"),
        ]
        db.add_all(participantes)
        
        await db.commit()
        print("✅ Database seeded successfully")

# Ejecutar: python -m src.scripts.seed
```

### 4. VS Code Snippets
```json
// .vscode/snippets.json
{
  "FastAPI Endpoint": {
    "prefix": "fapi-endpoint",
    "body": [
      "@router.${1:get}(\"/${2:path}\")",
      "async def ${3:function_name}(",
      "    db: AsyncSession = Depends(get_db)",
      ") -> ${4:ResponseModel}:",
      "    \"\"\"${5:Description}\"\"\"",
      "    ${6:# TODO: Implementation}",
      "    $0"
    ]
  },
  "React Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export default function ${1:Component}({ $3 }: ${1:Component}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  )",
      "}"
    ]
  }
}
```

---

## 🤝 Contribución y Colaboración

### Pull Request Template
```markdown
## 📝 Descripción
[Descripción clara de los cambios]

## 🎯 Motivación y Contexto
[¿Por qué es necesario este cambio? ¿Qué problema resuelve?]

## 🧪 Testing Realizado
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración pasando
- [ ] Tests E2E pasando
- [ ] Probado manualmente en localhost

## 📸 Screenshots (si aplica)
[Agregar capturas de pantalla de cambios visuales]

## ✅ Checklist
- [ ] Código sigue las convenciones del proyecto
- [ ] Comentarios agregados para lógica compleja
- [ ] Documentación actualizada
- [ ] No hay secrets en el código
- [ ] CORS configurado correctamente
- [ ] Migrations creadas (si cambió DB schema)
- [ ] Build exitoso sin warnings

## 📊 Impacto
- **Performance:** [Mejoró/Sin cambios/Empeoró - explicar]
- **Breaking changes:** [Sí/No - detallar si aplica]
- **Dependencias nuevas:** [Listar si aplica]
```

### Code Review Checklist
**Para reviewer:**
- [ ] Código legible y bien documentado
- [ ] Tests adecuados y pasando
- [ ] No hay vulnerabilidades de seguridad
- [ ] Performance aceptable
- [ ] Sigue convenciones del proyecto
- [ ] Sin código duplicado innecesario
- [ ] Error handling apropiado
- [ ] Logs útiles agregados

---

## 🏁 Resumen Ejecutivo

### Stack en Una Línea
**AWS Serverless (Lambda + Aurora) + FastAPI + React + TypeScript**

### Comandos Más Usados
```powershell
# Desarrollo
make -f Makefile.dev docker-up                    # Levantar todo
cd frontend && npm run dev                        # Frontend dev
make -f Makefile.dev docker-logs                  # Ver logs

# Testing
pytest -v                                         # Backend tests
cd frontend && npm run test:e2e                   # E2E tests

# Deploy
sam build --use-container && sam deploy           # Backend a AWS
cd frontend && npm run build && aws s3 sync...    # Frontend a S3
```

### Archivos Más Importantes
```
template.yaml                    # Infraestructura AWS (SAM)
backend/src/main.py             # FastAPI app + Lambda handler
backend/src/core/config.py      # Configuración centralizada
frontend/src/App.tsx            # Router principal
frontend/src/services/api.ts    # Cliente HTTP
docker-compose.dev.yml          # Desarrollo local
```

### Cuando Algo No Funciona
1. **Check logs:** CloudWatch (prod) o Docker logs (local)
2. **Verify config:** Settings correctos en `.env` o Secrets Manager
3. **Test connection:** `curl http://localhost:8000/health`
4. **Check DB:** Conexión a Aurora/PostgreSQL funcionando
5. **CORS issues:** Verificar `CORS_ORIGINS` en `config.py`

---

**¿Preguntas? ¿Mejoras? Abre un issue o PR!** 🚀
