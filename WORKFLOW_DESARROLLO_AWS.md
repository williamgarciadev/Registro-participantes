# 🔄 Workflow: Desarrollo Local → AWS

Guía completa de cómo desarrollar localmente en Docker y luego deployar a AWS.

---

## 📋 Resumen de Fases

```
┌────────────────────────────────────────────────────┐
│ FASE 1: SETUP INICIAL (1 vez)                      │
│ - Instalar Docker                                  │
│ - Clonar proyecto                                  │
│ - docker-compose build                             │
└────────────────────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────┐
│ FASE 2: DESARROLLO (diariamente)                   │
│ - docker-compose up -d                             │
│ - Editar código                                    │
│ - Probar localmente                                │
│ - Ver cambios en tiempo real                       │
└────────────────────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────┐
│ FASE 3: TESTING (antes de commitear)               │
│ - Probar toda la funcionalidad                     │
│ - Revisar logs                                     │
│ - Testing manual/automático                        │
└────────────────────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────┐
│ FASE 4: COMMIT & PUSH                              │
│ - git add .                                        │
│ - git commit -m "..."                              │
│ - git push origin feature-branch                   │
└────────────────────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────┐
│ FASE 5: DEPLOY A AWS (opcional, bajo demanda)      │
│ - sam build                                        │
│ - sam deploy                                       │
│ - Probar en AWS                                    │
│ - Actualizar frontend si es necesario              │
└────────────────────────────────────────────────────┘
```

---

## 🎬 FASE 1: Setup Inicial (Una sola vez)

### Paso 1.1: Instalar Docker

- [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop)
- Instalar
- Reiniciar computadora
- Verificar: `docker --version`

### Paso 1.2: Clonar proyecto

```bash
git clone <URL-DEL-REPO>
cd Registro-participantes
```

### Paso 1.3: Construir imágenes

```bash
docker-compose -f docker-compose.dev.yml build
```

**Tiempo:** 2-3 minutos (primera vez)

### Paso 1.4: Iniciar servicios

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Tiempo:** 30-60 segundos

### Paso 1.5: Verificar

```bash
# Ver contenedores
docker-compose -f docker-compose.dev.yml ps

# Probar API
curl http://localhost:8000/health

# Abrir en navegador
http://localhost:5173  # Frontend
http://localhost:8000/docs  # API Docs
```

**✅ Setup completado!** Ya puedes empezar a desarrollar.

---

## 💻 FASE 2: Desarrollo (Todos los días)

### Inicio del día

```bash
# Iniciar servicios si están parados
docker-compose -f docker-compose.dev.yml up -d

# Ver estado
docker-compose -f docker-compose.dev.yml ps

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Editar código

Todos los cambios se aplican **automáticamente**:

#### Frontend (React)

```bash
# Edita archivos en: frontend/src/

# Los cambios aparecen en http://localhost:5173
# (recarga automática con HMR)
```

Ejemplo:
```bash
# Editar componente
nano frontend/src/pages/Home.tsx

# Guardar
# Ver cambios automáticamente en http://localhost:5173
```

#### Backend (FastAPI)

```bash
# Edita archivos en: backend/src/

# Los cambios aparecen en http://localhost:8000
# (uvicorn reload automático)
```

Ejemplo:
```bash
# Editar endpoint
nano backend/src/api/v1/endpoints/participantes.py

# Guardar
# Ver cambios automáticamente en http://localhost:8000/docs
```

#### Base de Datos (PostgreSQL)

```bash
# Editar schema
nano scripts/init-database.sql

# Reiniciar BD
docker-compose -f docker-compose.dev.yml down postgres
docker-compose -f docker-compose.dev.yml up -d postgres

# (O limpiar todo y reconstruir)
```

### Probar cambios

#### En Frontend

1. Abre http://localhost:5173 en navegador
2. Interactúa con la aplicación
3. Abre devtools (`F12`) si hay errores
4. Ver cambios en tiempo real

#### En Backend

1. Abre http://localhost:8000/docs (Swagger UI)
2. Prueba los endpoints interactivamente
3. Ver logs: `docker-compose -f docker-compose.dev.yml logs -f backend`
4. Cambios se aplican automáticamente

#### En Base de Datos

1. Abre http://localhost:5050 (pgAdmin)
2. Login: admin@example.com / admin123
3. Conecta a servidor `postgres`
4. Explora tablas y datos

### Fin del día

```bash
# Pausar servicios (sin eliminar datos)
docker-compose -f docker-compose.dev.yml down

# O dejarlos corriendo
# (consume recursos pero listo para mañana)
```

---

## ✅ FASE 3: Testing (Antes de Commitear)

### Testing Manual

#### Funcionalidad completada

Ejemplo: "Creé nuevo endpoint de participantes"

```bash
# 1. Verificar que el endpoint existe
curl http://localhost:8000/api/v1/participantes

# 2. Crear un nuevo participante
curl -X POST http://localhost:8000/api/v1/participantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Usuario",
    "email": "test@example.com"
  }'

# 3. Verificar que aparece en la lista
curl http://localhost:8000/api/v1/participantes

# 4. Abrir frontend y verificar
# http://localhost:5173 → Crear participante → Debe aparecer
```

#### Logs y errores

```bash
# Ver logs del backend
docker-compose -f docker-compose.dev.yml logs backend

# Ver logs de la BD
docker-compose -f docker-compose.dev.yml logs postgres

# Ver logs del frontend
docker-compose -f docker-compose.dev.yml logs frontend

# Ver todo
docker-compose -f docker-compose.dev.yml logs -f
```

#### Verificación de Salud

```bash
# Health check
curl http://localhost:8000/health

# API accesible
curl http://localhost:8000/docs

# BD conectada
docker-compose -f docker-compose.dev.yml exec backend python -c "
from src.database.session import SessionLocal
db = SessionLocal()
print('✅ BD conectada')
db.close()
"
```

### Testing Automático (Opcional)

```bash
# Acceder a contenedor de backend
docker-compose -f docker-compose.dev.yml exec backend bash

# Ejecutar tests
pytest

# O tests específicos
pytest backend/tests/test_participantes.py -v
```

### Checklist Antes de Commitear

- [ ] ¿El código funciona localmente?
- [ ] ¿Se ve bien en Frontend?
- [ ] ¿API responds correctamente?
- [ ] ¿No hay errores en logs?
- [ ] ¿La BD guarda datos correctamente?
- [ ] ¿Pasaste tests?

---

## 📝 FASE 4: Commit & Push

### Preparar commit

```bash
# Ver cambios
git status

# Revisar cambios específicos
git diff

# Preparar cambios
git add .

# Verificar lo que vas a commitear
git status
```

### Crear commit

```bash
# Commit con mensaje descriptivo
git commit -m "feat: Agregar endpoint para listar participantes

- Nuevo endpoint GET /api/v1/participantes
- Filtraje por estado
- Paginación implementada
- Tests incluidos"
```

**Convención de mensajes:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato de código
- `refactor:` Refactorización
- `test:` Tests

### Push a rama

```bash
# Enviar a tu rama de feature
git push origin feature/nuevo-endpoint

# O a main/develop
git push origin main
```

---

## 🚀 FASE 5: Deploy a AWS

### Cuando hacer deploy

- ✅ Después de testing completo
- ✅ Cuando feature está "done"
- ✅ Antes de crear PR
- ✅ O en schedule (ej: diariamente)

### Pre-deploy checklist

- [ ] ¿Todo funciona en Docker local?
- [ ] ¿Pasaste todos los tests?
- [ ] ¿Revisaste los logs?
- [ ] ¿Hiciste commit de todos los cambios?
- [ ] ¿template.yaml está actualizado si hay cambios de infraestructura?

### Deploy a AWS

```bash
# Verificar que el stack anterior fue eliminado (si es necesario)
# Ver: ACCION_INMEDIATA.md

# Build
sam build

# Deploy (con confirmaciones)
sam deploy
# Responde:
#   Changeset created successfully.
#   Deploy this changeset? [y/N]: y

# Esperar 10-15 minutos
```

### Verificar deploy en AWS

```bash
# Ver outputs
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'

# Probar API en AWS
curl https://<API-URL>/health

# Desplegar frontend (si es necesario)
cd frontend && npm run build
aws s3 sync dist/ s3://<bucket-name> --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```

### Post-deploy

- [ ] ¿API responde?
- [ ] ¿Frontend carga?
- [ ] ¿Base de datos tiene datos?
- [ ] ¿Logs en CloudWatch se ven correctos?

---

## 🔄 Ciclo Completo - Ejemplo

### Escenario: Agregar campo "teléfono" a participante

#### Día 1: Desarrollo

```bash
# 1. Iniciar todo
docker-compose -f docker-compose.dev.yml up -d

# 2. Editar modelo
# backend/src/models/participante.py
# - Agregar campo: telefono: str

# 3. Editar schema
# backend/src/schemas/participante.py
# - Agregar campo: telefono: str

# 4. Ver cambios automáticos en http://localhost:8000/docs

# 5. Editar frontend
# frontend/src/components/ParticipanteForm.tsx
# - Agregar input para teléfono

# 6. Probar en http://localhost:5173
# - Crear participante con teléfono
# - Verificar que se guarda

# 7. Revisar logs
docker-compose -f docker-compose.dev.yml logs -f

# 8. Fin del día
docker-compose -f docker-compose.dev.yml down
```

#### Día 2: Testing y commit

```bash
# 1. Iniciar de nuevo
docker-compose -f docker-compose.dev.yml up -d

# 2. Testing manual
curl http://localhost:8000/docs
# - Prueba crear participante con teléfono

# 3. Ver logs
docker-compose -f docker-compose.dev.yml logs

# 4. Commit
git add .
git commit -m "feat: Agregar campo telefono a participantes

- Actualizado modelo Participante
- Actualizado schema ParticipanteCreate
- UI actualizada con campo de teléfono
- Teléfono es requerido en creación"

# 5. Push
git push origin feature/agregar-telefono
```

#### Luego: Deploy (cuando esté listo)

```bash
# 1. Pre-deploy checklist ✅

# 2. Deploy
sam build
sam deploy

# 3. Verificar en AWS
curl https://<url-api>/health
# - Crear participante con teléfono
# - Verificar en AWS RDS

# 4. Done! 🎉
```

---

## 🛠️ Troubleshooting en Workflow

### "Mi cambio en frontend no aparece"

```bash
# 1. Verificar que archivo se guardó
git status

# 2. Ver logs de frontend
docker-compose -f docker-compose.dev.yml logs frontend

# 3. Refrescar navegador (Ctrl+F5)

# 4. Limpiar caché si es necesario
docker-compose -f docker-compose.dev.yml exec frontend npm run build
```

### "Backend crashea después de cambio"

```bash
# 1. Ver logs
docker-compose -f docker-compose.dev.yml logs backend

# 2. Leer error en logs
# Buscar "ERROR" o "Traceback"

# 3. Revertir cambio si es grave
git diff backend/src/
git checkout backend/src/main.py  # Deshacer cambio específico

# 4. Reiniciar backend
docker-compose -f docker-compose.dev.yml restart backend
```

### "DB se desincronizó"

```bash
# Opción 1: Limpiar todo
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d

# Opción 2: Solo BD
docker-compose -f docker-compose.dev.yml restart postgres
```

### "¿Cuándo commitear?"

✅ Commitear cuando:
- Acabas una feature completa
- Antes de cambiar de rama
- Antes de dormir (backup)
- Cada "milestone" pequeño (cada 30 min - 1 hora)

❌ NO commitear:
- Código que no probaste
- Cambios a mitad
- Archivos sin relación

---

## 📊 Resumen de Tiempos

| Tarea | Tiempo |
|-------|--------|
| Setup inicial (1 vez) | 10-15 min |
| Iniciar servicios cada día | 30 seg |
| Cambiar y probar código | 2-5 min |
| Commitear cambios | 1-2 min |
| Deploy a AWS | 15-20 min |

---

## 🎯 Best Practices

1. **Commitea frecuentemente** (cada 30 min - 1 hora)
2. **Prueba antes de commitear** (no romper main)
3. **Keep logs clean** (leer errores, no ignorar)
4. **Usa branches** (no desarrollar en main)
5. **Test en local primero** (no debuggear en AWS)
6. **Sincroniza regularmente** (git pull antes de empezar)

---

## 🚀 Resumen

```
1. Setup (1 vez):
   docker-compose build && up -d

2. Desarrollo (diariamente):
   - Edita código
   - Cambios aparecen en tiempo real
   - Prueba localmente

3. Testing:
   - Funciona en http://localhost:*
   - Ver logs: docker-compose logs -f

4. Commit:
   git add . && git commit && git push

5. Deploy (cuando esté listo):
   sam build && sam deploy
```

---

**Next Steps:**
- [Quick Start Docker](./DOCKER_QUICK_START.md)
- [Desarrollo Detallado](./DESARROLLO_LOCAL_DOCKER.md)
- [Deploy a AWS](./ACCION_INMEDIATA.md)

---

**Última actualización:** 01 Nov 2025
**Status:** ✅ Workflow Completo
