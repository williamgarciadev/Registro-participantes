# ⚠️ PLAN URGENTE: Arreglar Error CORS y Login

## 🎯 Objetivo
Resolver el error CORS y el error 500 en el endpoint de login para que el frontend pueda autenticarse correctamente.

## 🔍 Problemas Identificados
1. **Error CORS**: Frontend en `http://localhost:3000` bloqueado al acceder a `http://localhost:8000`
2. **Error HTTP 500**: El endpoint `/api/v1/auth/login/json` está fallando
3. **Posible causa**: Error en `ensure_admin_role()` al crear tablas/datos iniciales

## 📋 Tareas

### 1. Verificar y Mejorar Configuración CORS ✅
- [x] Actualizar CORS_ORIGINS para incluir explícitamente `http://localhost:3000`
- [x] Verificar que el middleware CORS se aplique correctamente
- [x] Agregar logs para debug CORS

### 2. Arreglar Error 500 en Login ✅
- [x] Revisar logs del backend para ver el error exacto
- [x] Identificar causa: tablas no creadas, error bcrypt
- [x] Ejecutar `/init-db` para crear tablas
- [x] Agregar dependencias de compilación para bcrypt (gcc, g++, make, libffi-dev)
- [x] Reconstruir y reiniciar contenedor backend
- [x] Actualizar versiones de bcrypt y passlib
- [x] Arreglar problema de timezone en modelos
- [x] Login funcionando correctamente desde API

### 3. Verificar Funcionamiento ✅
- [x] Backend responde correctamente a /health
- [x] Login desde curl funciona y retorna token
- [x] Probar login desde frontend en navegador
- [x] Verificar que el token se reciba correctamente en frontend
- [x] Confirmar que no hay más errores CORS
- [x] Dashboard carga correctamente después del login

### 4. Documentar Solución ✅
- [x] Commit realizado con todos los cambios
- [x] Login funcionando end-to-end
- [x] Usuario admin creado: admin@example.com / admin123

---

# 🔔 Sistema de Notificaciones

## 🎯 Objetivo
Implementar un sistema de notificaciones en tiempo real que muestre alertas cuando se agreguen nuevos participantes.

## 📋 Tareas

### 1. Crear Infraestructura de Notificaciones ✅
- [x] Crear NotificationContext con localStorage persistence
- [x] Crear NotificationDropdown component con badge counter
- [x] Agregar date-fns para formateo de timestamps relativos
- [x] Agregar estilos CSS para el sistema de notificaciones

### 2. Integrar en Layout ✅
- [x] Envolver App con NotificationProvider en main.tsx
- [x] Reemplazar Bell button estático con NotificationDropdown
- [x] Verificar que el badge contador funcione correctamente

### 3. Conectar con Creación de Participantes ✅
- [x] Importar useNotifications en NuevoParticipantePage
- [x] Agregar addNotification en el onSuccess de la mutación
- [x] Instalar dependencias npm (date-fns) en el contenedor

### 4. Probar Sistema ⏳
- [ ] Crear un nuevo participante desde el formulario
- [ ] Verificar que aparezca el badge con count
- [ ] Verificar que la notificación se muestre en el dropdown
- [ ] Verificar persistencia después de recargar página
- [ ] Probar funcionalidad de marcar como leído
- [ ] Probar botón de limpiar todas las notificaciones

---

# Plan de Mejoras: Estilo AdminLTE v3

## 🎯 Objetivo
Transformar la UI actual para que tenga el look & feel profesional de AdminLTE v3, manteniendo nuestra arquitectura React moderna.

## 📋 Tareas

### 1. Sistema de Colores y Tokens ✅
- [x] Actualizar paleta de colores para coincidir con AdminLTE v3
- [x] Ajustar colores del sidebar (gris más oscuro #343a40)
- [x] Actualizar colores de botones y estados
- [x] Mejorar contraste de textos
- [x] Reducir espaciado global (compacto AdminLTE)
- [x] Fix margin-left excesivo

### 2. Formularios AdminLTE PRO ✅
- [x] Separar en cards con headers
- [x] Inputs AdminLTE (38px altura)
- [x] Labels semibold con colores correctos
- [x] Mensajes de error con iconos
- [x] Footer con botones alineados

### 3. Login Preview ✅
- [x] Diseño AdminLTE standalone
- [x] Background gradient profesional
- [x] Inputs y botones AdminLTE
- [x] Ruta /login-preview para review

### 4. Tablas Profesionales 🔄 (SIGUIENTE)
- [ ] Rediseñar tabla con estilo AdminLTE (bordes horizontales)
- [ ] Mejorar header de tabla (fondo gris claro)
- [ ] Ajustar espaciado de celdas
- [ ] Mejorar hover state (fondo gris muy claro)
- [ ] Actualizar badges de estado
- [ ] Mejorar botón de actualizar

### 8. Paginación ⏳
- [ ] Rediseñar controles de paginación estilo AdminLTE
- [ ] Mejorar indicadores de página
- [ ] Ajustar botones anterior/siguiente

### 9. Responsive y Mobile ⏳
- [ ] Verificar responsive en mobile
- [ ] Ajustar sidebar en móvil
- [ ] Probar todos los breakpoints

### 10. Animaciones Sutiles ⏳
- [ ] Mantener animaciones pero más sutiles
- [ ] Ajustar timing para feel más corporativo
- [ ] Probar en navegador

## 🎨 Referencia de Colores AdminLTE v3

```css
/* Sidebar */
--sidebar-bg: #343a40
--sidebar-text: rgba(255,255,255,0.8)
--sidebar-hover: rgba(255,255,255,0.1)
--sidebar-active: #007bff

/* Main */
--body-bg: #f4f6f9
--card-bg: #ffffff
--border-color: #dee2e6

/* Primary */
--primary: #007bff
--success: #28a745
--warning: #ffc107
--danger: #dc3545
--info: #17a2b8
```

## ✅ Completado
- Ninguna tarea iniciada aún

## 📝 Notas
- Mantener la arquitectura React Query actual
- No cambiar la lógica del backend
- Conservar animaciones pero hacerlas más sutiles
- Priorizar claridad y profesionalismo sobre efectos visuales
