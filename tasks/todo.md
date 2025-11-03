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
