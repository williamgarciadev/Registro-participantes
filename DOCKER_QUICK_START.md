# 🚀 Docker Quick Start (5 minutos)

## ✅ Requisito: Docker Instalado

Si no tienes Docker:
- [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop)
- Instala y reinicia tu computadora

Verifica:
```bash
docker --version
```

---

## 🎯 START (Copy-Paste)

### Opción 1: Comando Único (Recomendado)

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Eso es todo.** Espera 30 segundos y listo.

### Opción 2: Con Make (Si tienes Make instalado)

```bash
make -f Makefile.dev docker-up
```

---

## 🌐 Accede a:

| Lo que quieres | URL |
|---|---|
| **Frontend (React)** | http://localhost:5173 |
| **API Backend** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **Database Admin** | http://localhost:5050 |

---

## 🧪 Prueba Rápida

Abre cualquier navegador y ve a:

```
http://localhost:5173
```

Deberías ver:
- ✅ Página de inicio de la aplicación
- ✅ Botón para crear participante
- ✅ Lista de participantes (con datos de prueba)

Crea un participante nuevo → Funciona ✅

---

## 📝 Cambiar Código

Los cambios se aplican **automáticamente**:

### Frontend
```
Edita: frontend/src/
→ Ver cambios en http://localhost:5173 (recarga automática)
```

### Backend
```
Edita: backend/src/
→ Ver cambios en http://localhost:8000 (recarga automática)
```

### Base de Datos
```
Edita: scripts/init-database.sql
→ Ejecutar: docker-compose -f docker-compose.dev.yml up -d --force-recreate postgres
```

---

## 🛑 Detener Todo

```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 🔍 Ver Logs

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

Presiona `Ctrl+C` para salir.

---

## 🚨 Troubleshooting

### "Port 5432 already in use"
```bash
# Parar PostgreSQL local (si está corriendo)
# En Windows: Servicios > PostgreSQL > Detener
# En Mac: brew services stop postgresql
```

### "Backend no conecta a BD"
```bash
docker-compose -f docker-compose.dev.yml restart postgres
docker-compose -f docker-compose.dev.yml restart backend
```

### "Frontend no carga"
```bash
docker-compose -f docker-compose.dev.yml logs frontend
```

### Limpiar todo
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📚 Más Información

Lee la guía completa:
```
DESARROLLO_LOCAL_DOCKER.md
```

---

## 🎉 ¡Listo!

Ya tienes:
- ✅ Base de datos PostgreSQL
- ✅ API FastAPI
- ✅ Frontend React
- ✅ Admin de BD (pgAdmin)

Todo funcionando localmente.

---

**Próximo paso:** [Lee DESARROLLO_LOCAL_DOCKER.md para más detalles](./DESARROLLO_LOCAL_DOCKER.md)
