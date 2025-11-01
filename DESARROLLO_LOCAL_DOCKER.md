# 🐳 Desarrollo Local con Docker

Guía completa para desarrollar la aplicación **Registro de Participantes** usando Docker de forma local.

---

## 📋 Requisitos Previos

Necesitas tener instalado:

- **Docker** (v20.10+) - [Descargar](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (v1.29+) - Incluido con Docker Desktop
- **Git** - Para clonar el proyecto

### Verificar instalación

```bash
docker --version
docker-compose --version
git --version
```

Deberías ver versiones de cada comando.

---

## 🚀 Quick Start (5 minutos)

### Paso 1: Clonar el proyecto

```bash
git clone <URL_DEL_REPO>
cd Registro-participantes
```

### Paso 2: Construir las imágenes

```bash
docker-compose -f docker-compose.dev.yml build
```

**Tiempo:** 2-3 minutos (descarga imágenes base)

### Paso 3: Iniciar los servicios

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Tiempo:** 30-60 segundos

### Paso 4: Verificar que todo funciona

```bash
# Ver estado de contenedores
docker-compose -f docker-compose.dev.yml ps

# Verificar API
curl http://localhost:8000/health
```

Deberías ver:
```json
{"status":"healthy"}
```

### ✅ ¡Listo!

Accede a:

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/docs |
| **pgAdmin** | http://localhost:5050 |

---

## 🎯 Estructura del Stack

```
┌─────────────────────────────────────────┐
│         React Frontend (Port 5173)       │
│         http://localhost:5173            │
└──────────────┬──────────────────────────┘
               │
               ↓ (HTTP API calls)

┌─────────────────────────────────────────┐
│      FastAPI Backend (Port 8000)         │
│      http://localhost:8000               │
└──────────────┬──────────────────────────┘
               │
               ↓ (SQL queries)

┌─────────────────────────────────────────┐
│   PostgreSQL Database (Port 5432)        │
│   postgres://postgres:password@postgres  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   pgAdmin Web UI (Port 5050)             │
│   http://localhost:5050 (admin@example)  │
└─────────────────────────────────────────┘
```

---

## 📚 Comandos Principales

### Usando Makefile (Recomendado)

```bash
# Ver todos los comandos disponibles
make -f Makefile.dev help

# Iniciar todo
make -f Makefile.dev docker-up

# Ver logs en tiempo real
make -f Makefile.dev docker-logs

# Detener todo
make -f Makefile.dev docker-down

# Acceder al shell del backend
make -f Makefile.dev docker-bash-backend

# Acceder a la base de datos
make -f Makefile.dev docker-bash-db
```

### Usando Docker Compose directamente

```bash
# Construir imagenes
docker-compose -f docker-compose.dev.yml build

# Iniciar servicios (en background)
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Ver estado
docker-compose -f docker-compose.dev.yml ps

# Detener servicios
docker-compose -f docker-compose.dev.yml down

# Limpiar todo (incluyendo volúmenes de datos)
docker-compose -f docker-compose.dev.yml down -v

# Ejecutar comando en contenedor
docker-compose -f docker-compose.dev.yml exec backend bash
```

---

## 🔧 Desarrollo

### Frontend (React)

#### Cambiar código

Edita archivos en `frontend/src/` y verás los cambios automáticamente (hot reload).

#### Instalar dependencias nuevas

```bash
docker-compose -f docker-compose.dev.yml exec frontend npm install <package-name>
```

#### Build para producción

```bash
docker-compose -f docker-compose.dev.yml exec frontend npm run build
```

### Backend (FastAPI)

#### Cambiar código

Edita archivos en `backend/src/` y la API se recargará automáticamente.

#### Instalar dependencias nuevas

```bash
# Opción 1: Directamente en contenedor
docker-compose -f docker-compose.dev.yml exec backend pip install <package-name>

# Opción 2: Agregar a requirements.txt y rebuildar
echo "<package-name>" >> backend/requirements.txt
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend
```

#### Ver logs

```bash
docker-compose -f docker-compose.dev.yml logs -f backend
```

#### Acceder a Python shell

```bash
docker-compose -f docker-compose.dev.yml exec backend python
```

### Base de Datos (PostgreSQL)

#### Acceder a la BD con psql

```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d participantes
```

Comandos útiles en psql:
```sql
-- Ver tablas
\dt

-- Ver descripción de tabla
\d participantes

-- Contar registros
SELECT COUNT(*) FROM participantes;

-- Salir
\q
```

#### Usar pgAdmin (Interfaz Web)

1. Abre http://localhost:5050
2. Login: `admin@example.com` / `admin123`
3. Add new server:
   - Hostname: `postgres`
   - Username: `postgres`
   - Password: `postgres_dev_123`

---

## 🧪 Testing

### Probar API con curl

```bash
# Health check
curl http://localhost:8000/health

# Obtener documentación interactiva
curl http://localhost:8000/docs

# Crear participante
curl -X POST http://localhost:8000/api/v1/participantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Perez",
    "email": "juan@example.com"
  }'

# Obtener participantes
curl http://localhost:8000/api/v1/participantes

# Obtener un participante específico
curl http://localhost:8000/api/v1/participantes/1
```

### Usar Swagger UI

1. Abre http://localhost:8000/docs
2. Prueba los endpoints desde la interfaz interactiva
3. Haz clic en "Try it out" en cada endpoint

### Testing con Python

```bash
# Acceder a Python en el backend
docker-compose -f docker-compose.dev.yml exec backend python

# En el prompt de Python:
import requests

# Hacer request
response = requests.get('http://localhost:8000/health')
print(response.json())
```

---

## 🔍 Debugging

### Ver logs de todos los servicios

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Ver logs de un servicio específico

```bash
# Backend
docker-compose -f docker-compose.dev.yml logs -f backend

# Base de datos
docker-compose -f docker-compose.dev.yml logs -f postgres

# Frontend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Verificar conectividad entre servicios

```bash
# Desde el backend, verificar que puede conectar a BD
docker-compose -f docker-compose.dev.yml exec backend psql -h postgres -U postgres -d participantes -c "SELECT 1;"

# Desde el frontend, verificar que puede conectar al backend
docker-compose -f docker-compose.dev.yml exec frontend curl -s http://backend:8000/health | json_pp
```

### Limpiar contenedores y volúmenes

```bash
# Detener contenedores
docker-compose -f docker-compose.dev.yml down

# Eliminar volúmenes (BORRA DATOS DE BD)
docker-compose -f docker-compose.dev.yml down -v

# Rebuildar desde cero
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🚨 Problemas Comunes

### Problema: "Port 5432 already in use"

**Causa:** Otro servicio PostgreSQL está corriendo

**Solución:**
```bash
# Opción 1: Detener PostgreSQL local
# En Windows: Servicios > PostgreSQL > Detener
# En Mac: brew services stop postgresql
# En Linux: sudo systemctl stop postgresql

# Opción 2: Usar otro puerto en docker-compose
# Edita docker-compose.dev.yml, línea de ports:
ports:
  - "5433:5432"  # Cambiar de 5432 a 5433
```

### Problema: "ConnectionRefusedError: Cannot connect to backend"

**Causa:** El backend no está iniciado o está crasheando

**Solución:**
```bash
# Ver estado
docker-compose -f docker-compose.dev.yml ps

# Ver logs
docker-compose -f docker-compose.dev.yml logs backend

# Reiniciar
docker-compose -f docker-compose.dev.yml restart backend
```

### Problema: "FATAL: remaining connection slots are reserved"

**Causa:** Demasiadas conexiones a la BD

**Solución:**
```bash
# Reiniciar la BD
docker-compose -f docker-compose.dev.yml restart postgres

# Limpiar todo
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Problema: "Module not found" en backend

**Causa:** Dependencias no instaladas en el contenedor

**Solución:**
```bash
# Actualizar requirements.txt y rebuildar
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend
```

### Problema: "Cannot find module" en frontend

**Causa:** Dependencias no instaladas en el contenedor

**Solución:**
```bash
# Reinstalar dependencias
docker-compose -f docker-compose.dev.yml exec frontend npm install

# O rebuildar
docker-compose -f docker-compose.dev.yml build frontend
docker-compose -f docker-compose.dev.yml up -d frontend
```

---

## 🔐 Variables de Entorno

Las variables están en `.env.local`:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres_dev_123@postgres:5432/participantes

# Backend
STAGE=dev
LOG_LEVEL=DEBUG

# Frontend
VITE_API_URL=http://localhost:8000
```

**Para cambiar variables:**

1. Edita `.env.local`
2. Reinicia los contenedores: `docker-compose -f docker-compose.dev.yml up -d`

---

## 📦 Servicios y Puertos

| Servicio | Puerto | URL | Usuario/Contraseña |
|----------|--------|-----|-------------------|
| PostgreSQL | 5432 | postgres | postgres / postgres_dev_123 |
| FastAPI | 8000 | http://localhost:8000 | N/A |
| React | 5173 | http://localhost:5173 | N/A |
| pgAdmin | 5050 | http://localhost:5050 | admin@example.com / admin123 |

---

## 🎯 Workflow Típico de Desarrollo

### Día 1: Setup inicial

```bash
# Clonar proyecto
git clone <repo>
cd Registro-participantes

# Construir y iniciar
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d

# Verificar
docker-compose -f docker-compose.dev.yml ps
curl http://localhost:8000/health
```

### Días siguientes: Desarrollo

```bash
# Iniciar servicios (si están parados)
docker-compose -f docker-compose.dev.yml up -d

# Editar código (cambios se aplican automáticamente)
# Backend: edita backend/src/...
# Frontend: edita frontend/src/...

# Ver cambios
# Frontend: http://localhost:5173
# Backend: http://localhost:8000/docs

# Ver logs si hay problemas
docker-compose -f docker-compose.dev.yml logs -f

# Cuando termines
docker-compose -f docker-compose.dev.yml down
```

---

## 🚀 Deploy a AWS

Una vez que todo funciona en local, puedes deployar a AWS:

```bash
# Volver a ejecutar el script de deploy
./fix-deploy.ps1

# O manualmente
sam build
sam deploy
```

Los cambios en local se reflejarán en AWS (same code, different infrastructure).

---

## 📚 Recursos

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

---

## ✅ Checklist

- [ ] Docker y Docker Compose instalados
- [ ] Proyecto clonado localmente
- [ ] `docker-compose -f docker-compose.dev.yml build` completado
- [ ] `docker-compose -f docker-compose.dev.yml up -d` ejecutado
- [ ] `curl http://localhost:8000/health` responde
- [ ] Frontend accesible en http://localhost:5173
- [ ] Swagger Docs funcionan en http://localhost:8000/docs
- [ ] pgAdmin accesible en http://localhost:5050
- [ ] Puedes crear participantes desde frontend
- [ ] Los cambios en código se reflejan automáticamente

---

## 🆘 Soporte

Si tienes problemas:

1. Verifica los logs: `docker-compose -f docker-compose.dev.yml logs -f`
2. Ejecuta health check: `curl http://localhost:8000/health`
3. Limpia y reinicia: `docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d`
4. Consulta la sección "Problemas Comunes" arriba

---

**Última actualización:** 01 Nov 2025
**Status:** ✅ Listo para Desarrollo Local
