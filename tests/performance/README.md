# 🧪 Tests de Performance y Notificaciones

Este directorio contiene tests de carga con K6 para probar el sistema de participantes y el sistema de notificaciones en tiempo real.

## 📋 Requisitos Previos

1. **K6 instalado:**
   - **Windows (Chocolatey):** `choco install k6`
   - **macOS (Homebrew):** `brew install k6`
   - **Linux:** Ver [k6.io/docs/getting-started/installation](https://k6.io/docs/getting-started/installation/)

2. **Backend y Frontend corriendo:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Usuario admin creado:**
   - Email: `admin@example.com`
   - Password: `admin123`

## 🔔 Test del Sistema de Notificaciones

Este test crea participantes mediante el API y te permite ver las notificaciones aparecer en tiempo real en el frontend.

### Ejecución Rápida

**Windows (PowerShell):**
```powershell
.\tests\performance\run-notification-test.ps1
```

**Linux/Mac:**
```bash
chmod +x tests/performance/run-notification-test.sh
./tests/performance/run-notification-test.sh
```

### Ejecución Personalizada

**Con parámetros (PowerShell):**
```powershell
# 5 usuarios virtuales, 1 minuto de duración, sin limpiar participantes
.\tests\performance\run-notification-test.ps1 -VirtualUsers 5 -Duration "1m" -Cleanup

# 10 usuarios, 2 minutos, limpiar participantes después de crearlos
.\tests\performance\run-notification-test.ps1 -VirtualUsers 10 -Duration "2m" -Cleanup
```

**Directamente con K6:**
```bash
# Test básico
BASE_URL="http://localhost:8000" VUS=3 DURATION="30s" k6 run tests/performance/k6/participantes.js

# Test de carga más intenso
BASE_URL="http://localhost:8000" VUS=20 DURATION="3m" k6 run tests/performance/k6/participantes.js

# Con limpieza automática
BASE_URL="http://localhost:8000" VUS=5 DURATION="1m" CLEANUP="true" k6 run tests/performance/k6/participantes.js
```

**Con K6 en Docker (sin instalar K6):**
```powershell
# Windows PowerShell - Test para ver notificaciones en tiempo real
$scriptPath = (Resolve-Path tests\performance\k6).ProviderPath

docker run --rm `
  --network registro-participantes_app-network `
  -e BASE_URL=http://backend-lb `
  -e VUS=3 `
  -e DURATION=30s `
  -v "${scriptPath}:/scripts" `
  grafana/k6 run /scripts/participantes.js

# Test de carga más intenso
docker run --rm `
  --network registro-participantes_app-network `
  -e BASE_URL=http://backend-lb `
  -e VUS=100 `
  -e DURATION=1m `
  -v "${scriptPath}:/scripts" `
  grafana/k6 run /scripts/participantes.js
```

```bash
# Linux/Mac - Test básico
docker run --rm \
  --network registro-participantes_app-network \
  -e BASE_URL=http://backend-lb \
  -e VUS=3 \
  -e DURATION=30s \
  -v "$(pwd)/tests/performance/k6:/scripts" \
  grafana/k6 run /scripts/participantes.js
```

## 🎯 Cómo Funciona el Test

### Flujo del Test

1. **Autenticación:** Cada usuario virtual hace login con las credenciales de admin
2. **Operaciones aleatorias:**
   - 55% probabilidad: Listar participantes
   - 30% probabilidad: Buscar participantes
   - 15% probabilidad: **Crear participante** (genera notificación 🔔)
3. **Limpieza opcional:** Si `CLEANUP=true`, elimina los participantes creados

### Métricas Incluidas

- ✅ **Login exitosos:** Cantidad de autenticaciones correctas
- 📝 **Participantes creados:** Cantidad de participantes nuevos
- ⚠️ **Fallos en cleanup:** Errores al eliminar participantes de prueba
- 📊 **HTTP stats:** Requests totales, fallos, tiempos de respuesta (P95, P99)

### Thresholds (Umbrales)

- **http_req_failed:** < 2% de requests fallidos
- **http_req_duration (P95):** < 350ms
- **http_req_duration (P99):** < 500ms

## 🌐 Ver las Notificaciones en Tiempo Real

1. **Abre el frontend:** http://localhost:3000
2. **Login:** `admin@example.com` / `admin123`
3. **Observa el icono de la campana** en la barra superior derecha
4. **Ejecuta el test** con el script
5. **Mira cómo aparecen las notificaciones:**
   - Badge rojo con el contador de notificaciones no leídas
   - Click en la campana para abrir el panel
   - Timestamps relativos: "hace 2 segundos", "hace 1 minuto"
   - Persistencia: recarga la página y las notificaciones siguen ahí

## 📊 Ejemplo de Salida

```
╔════════════════════════════════════════════════════════════════╗
║           📊 RESUMEN DEL TEST DE PARTICIPANTES                ║
╠════════════════════════════════════════════════════════════════╣
║  🔐 Login exitosos:        45/45
║  ✅ Participantes creados:  12/15
║  ⚠️  Fallos en cleanup:     0
║  📝 Requests totales:       287
║  ❌ Requests fallidos:      0
║  ⏱️  Duración promedio:     124.35ms
║  ⏱️  P95:                   287.21ms
╚════════════════════════════════════════════════════════════════╝

💡 TIP: Abre http://localhost:3000 y observa las notificaciones aparecer
    en tiempo real mientras el test crea participantes.
```

## 🎨 Características del Sistema de Notificaciones

### Frontend (React)
- **NotificationContext:** Gestión global del estado de notificaciones
- **NotificationDropdown:** Componente visual con badge y panel
- **Persistencia:** localStorage mantiene notificaciones entre sesiones
- **Timestamps:** Formateo relativo en español con date-fns
- **Tipos:** Success ✅, Info ℹ️, Warning ⚠️, Error ❌

### Backend (FastAPI)
- Las notificaciones se generan en el frontend cuando el API responde exitosamente
- El endpoint `POST /api/v1/participantes` retorna 201 + datos del participante
- El hook `useNotifications().addNotification()` se dispara en el `onSuccess`

## 🧹 Limpieza de Datos de Prueba

Si ejecutaste el test sin `CLEANUP=true`, puedes tener muchos participantes de prueba en la BD:

```sql
-- Ver participantes de prueba
SELECT * FROM participantes WHERE extra_data->>'origen' = 'k6-test';

-- Eliminar participantes de prueba
DELETE FROM participantes WHERE extra_data->>'origen' = 'k6-test';
```

O desde el frontend:
1. Ir a "Participantes"
2. Buscar por dominio: `perfload.com`, `testingmail.net`, `mailinator.com`
3. Eliminar manualmente

## 🐛 Troubleshooting

### "K6 no está instalado"
- Instalar con Chocolatey (Windows), Homebrew (Mac), o desde k6.io

### "Backend no responde"
```bash
# Verificar contenedores
docker-compose -f docker-compose.dev.yml ps

# Ver logs
docker-compose -f docker-compose.dev.yml logs backend

# Reiniciar
docker-compose -f docker-compose.dev.yml restart backend
```

### "Login failed: 401"
- Verifica que el usuario admin existe en la BD
- Ejecuta `POST http://localhost:8000/api/v1/auth/init-db` para crear el admin

### "Las notificaciones no aparecen"
- Abre la consola del navegador (F12) y busca errores
- Verifica que date-fns esté instalado en el contenedor frontend
- Recarga la página con Ctrl+Shift+R (hard refresh)

## 📝 Archivos del Test

- `k6/participantes.js` - Script principal de K6 con autenticación
- `run-notification-test.ps1` - Script PowerShell para Windows
- `run-notification-test.sh` - Script Bash para Linux/Mac
- `README.md` - Esta documentación

## 🚀 Próximos Pasos

- [ ] Agregar test de WebSockets para notificaciones en tiempo real
- [ ] Probar diferentes tipos de notificaciones (info, warning, error)
- [ ] Medir latencia entre creación de participante y aparición de notificación
- [ ] Test de stress: ¿cuántas notificaciones puede manejar el sistema?

PS D:\Proyectos\ClaudeCode\Registro-participantes> $scriptPath = (Resolve-Path tests\performance\k6).ProviderPath

docker run --rm `
>>   --network registro-participantes_app-network `
>>   -e BASE_URL=http://backend-lb `
>>   -e VUS=100 `
>>   -e DURATION=1m `
>>   -v "${scriptPath}:/scripts" `
>>   grafana/k6 run /scripts/participantes.js