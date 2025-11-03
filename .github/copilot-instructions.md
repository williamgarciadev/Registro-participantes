# Copilot Instructions - Registro de Participantes

## 🌐 Idioma
**Responder siempre en español** - Todas las interacciones, explicaciones y documentación deben estar en español.

## ✅ Instrucciones Generales de Trabajo

### Flujo de Trabajo Paso a Paso

1. **Análisis inicial:** Analiza el problema, revisa la base de código para identificar los archivos relevantes y escribe un plan en `tasks/todo.md`.

2. **Plan detallado:** El plan debe contener una lista de tareas que puedas marcar como completadas conforme avances.

3. **Aprobación:** Antes de comenzar a trabajar, consulta conmigo para que pueda verificar y aprobar el plan.

4. **Ejecución:** Comienza a ejecutar las tareas del plan, marcándolas como completadas a medida que las termines.

5. **Explicación clara:** En cada paso, proporciona una explicación general y clara de los cambios que realizaste.

6. **Cambios simples:** Haz cada tarea y cambio de código lo más simple posible. Evita cambios masivos. Cada cambio debe afectar la menor cantidad de código posible.

7. **Documentación final:** Añade una sección de revisión al final del archivo con un resumen de los cambios que realizaste y cualquier información relevante adicional.

8. **Control de versiones:** Realiza `commit` y `push` de los cambios después de cada tarea completada, siguiendo buenas prácticas en los mensajes de commit.

## 🔐 Revisión de Seguridad

Antes de confirmar cada cambio, verifica:

- ✅ No hay datos sensibles expuestos en frontend o backend
- ✅ Las APIs están protegidas contra accesos indebidos
- ✅ Los formularios tienen validación contra entradas maliciosas (XSS, SQLi)
- ✅ No hay claves, tokens ni secretos en el código (usar variables de entorno)
- ✅ Las configuraciones de CORS están correctamente establecidas
- ✅ Los endpoints sensibles requieren autenticación (cuando aplique)

## 📘 Explicación de Cambios

Después de cada tarea:

- Explica en lenguaje claro qué funcionalidad agregaste
- Muestra qué archivos cambiaste y por qué
- Enseña el flujo de cómo funciona, como si lo explicaras a un desarrollador junior
- Usa ejemplos simples o comentarios clave si es útil
- Menciona cualquier impacto en otros componentes del sistema

## 🧠 Productividad Creativa

Mientras se espera respuesta o carga:

- Usar el tiempo para pensar ideas nuevas (producto, contenido, negocios)
- Reflexionar sobre lo aprendido o lo que se puede mejorar del sistema
- Aprovechar este chat como espacio creativo y estratégico
- Puedes pedirme ayuda para lluvia de ideas, validación de conceptos o simplemente organizar tus pensamientos

---

## Architecture Overview

**Stack:** AWS Serverless (Lambda + API Gateway) + Aurora Serverless v2 + React SPA
- **Backend:** FastAPI (Python 3.11) deployed as Lambda via AWS SAM (`template.yaml`)
- **Frontend:** React 18 + TypeScript + Vite → deployed to S3 + CloudFront
- **Database:** Aurora Serverless v2 PostgreSQL with async SQLAlchemy
- **IaC:** AWS SAM (CloudFormation) for all infrastructure

### Key Architectural Decisions
1. **Dual deployment modes:** Docker Compose for local dev (`docker-compose.dev.yml`), AWS SAM for production
2. **Lambda handler wrapping:** `mangum` wraps FastAPI app for Lambda compatibility (see `backend/src/main.py`)
3. **Service layer pattern:** Controllers (`api/v1/endpoints/`) → Services (`services/`) → Models (`models/`)
4. **Async-first:** All DB operations use `AsyncSession` with `asyncpg` driver
5. **AWS Powertools:** Structured logging and X-Ray tracing built-in (`aws_lambda_powertools`)

## Critical Development Workflows

### Local Development
```bash
# Start full stack locally with hot-reload
make -f Makefile.dev docker-up

# Backend runs at http://localhost:8000 with live docs at /docs
# Frontend dev server at http://localhost:5173 (run separately with npm run dev)
```

### AWS Deployment
```bash
# Deploy backend infrastructure (creates Lambda, API Gateway, Aurora, VPC)
sam build && sam deploy --guided

# Frontend deployment (after building)
cd frontend && npm run build
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/
```

### Testing
```bash
# E2E tests with Playwright
cd frontend && npm run test:e2e

# Backend API testing via Docker
make -f Makefile.dev test-api
```

## Project-Specific Conventions

### Backend Patterns
1. **Service methods are static async:** All service layer methods in `services/` use `@staticmethod` with `AsyncSession`
   ```python
   # See backend/src/services/participante_service.py
   @staticmethod
   async def create_participante(db: AsyncSession, data: ParticipanteCreate) -> Participante:
   ```

2. **Database session dependency injection:** Use `get_db()` in route dependencies
   ```python
   # All endpoints follow this pattern
   @router.post("/")
   async def create(data: ParticipanteCreate, db: AsyncSession = Depends(get_db)):
   ```

3. **Environment config via Pydantic Settings:** All config in `backend/src/core/config.py` with `Settings` class
   - Database URL switches between local (`DATABASE_URL`) and AWS Secrets Manager (`DB_SECRET_ARN`)

### Frontend Patterns
1. **Design system with CSS custom properties:** All tokens in `frontend/src/styles/tokens.css`
   - Use semantic tokens like `--color-text-primary`, not direct colors
   - Motion timing: `--motion-fast` (150ms), `--motion-base` (250ms), `--motion-slow` (350ms)

2. **Animation classes for polish:** Apply to components for UX enhancement
   ```tsx
   // Use these utility classes for consistent animations
   <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
   <div className="animate-fade-in">
   ```

3. **React Query for server state:** All API calls through `@tanstack/react-query`
   ```typescript
   // Pattern: see frontend/src/pages/ParticipantesPage.tsx
   const { data, isLoading } = useQuery({
     queryKey: ['participantes', filters],
     queryFn: () => participantesApi.getAll(filters)
   })
   ```

4. **Form validation with Zod + React Hook Form:** Schema definition with `zodResolver`
   ```typescript
   // See frontend/src/components/ParticipanteForm.tsx
   const schema = z.object({ nombre: z.string().min(1), ... })
   const { register, handleSubmit, formState: { errors } } = useForm({
     resolver: zodResolver(schema)
   })
   ```

5. **Page header context:** Use `PageHeaderContext` to control header title/actions from any page
   ```typescript
   // Pattern in all pages
   const { setHeader, resetHeader } = usePageHeader()
   useEffect(() => {
     setHeader({ title: 'Page Title', subtitle: '...', actions: <Button /> })
     return () => resetHeader()
   }, [])
   ```

### Cross-Component Integration
- **API Gateway → Lambda:** Proxy integration at `/api/*` routes to Lambda function
- **Frontend → Backend:** Base URL configured via `VITE_API_URL` env var (points to API Gateway in prod)
- **Backend → Aurora:** Connection via Data API (serverless) or direct connection string (local)
- **CORS:** Configured in FastAPI middleware (`backend/src/main.py`) - update `CORS_ORIGINS` for production

## File Organization Patterns

### Backend Structure (FastAPI)
```
backend/src/
├── api/v1/endpoints/  # Route handlers (thin controllers)
├── models/            # SQLAlchemy ORM models
├── schemas/           # Pydantic schemas (validation + serialization)
├── services/          # Business logic layer
├── core/              # Config, settings, shared utilities
└── database/          # DB session management, engine config
```

### Frontend Structure (React)
```
frontend/src/
├── components/        # Shared components (Layout, Form, etc.)
├── pages/            # Route-level components (HomePage, ParticipantesPage)
├── services/         # API client layer (axios wrappers)
├── types/            # TypeScript type definitions
└── styles/           # Design tokens and global styles
```

## Critical Dependencies
- **mangum:** Required for Lambda deployment (wraps ASGI apps)
- **aws-lambda-powertools:** Don't remove - used for structured logging/tracing in Lambda
- **lucide-react:** Icon library - all icons imported from here
- **react-toastify:** Toast notifications - initialized in main.tsx

## Common Pitfalls
1. **Database migrations:** Use Alembic, but tables are initialized via `scripts/init-database.sql` in local dev
2. **Lambda cold starts:** First request may timeout - configure `MemorySize: 512` in SAM template
3. **CORS errors:** Update `CORS_ORIGINS` list in `backend/src/core/config.py` when deploying to new domains
4. **Aurora scaling:** In SAM template, Aurora uses `MinCapacity: 0.5` ACUs - may pause after inactivity
5. **Frontend env vars:** Must prefix with `VITE_` to be accessible in client code

## Documentation Navigation
- **Quick start:** `DOCUMENTACION/COMIENZA_AQUI.md`
- **Local setup:** `docs/DEVELOPMENT.md`
- **Deployment guide:** `deploy-docs/AWS_DEPLOYMENT_OVERVIEW.md`
- **Troubleshooting:** `troubleshooting/` directory (check by error type)
- **API reference:** `docs/API.md` or http://localhost:8000/docs in local dev
