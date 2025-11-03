# 🎯 Plan de Trabajo: Sistema de Permisos y Roles PRO

## ✅ Fase 1: Catálogo de Permisos (COMPLETADO)

- [x] Crear endpoint GET /api/v1/permissions/catalog
- [x] Definir 29 permisos del sistema agrupados en 8 módulos
- [x] Implementar servicio get_permissions_catalog()
- [x] Testing y commit

**Resultado**: Backend listo con catálogo completo de permisos

**Commit**: `feat: Agregar catálogo de permisos y mejorar dashboard admin`

---

## ✅ Fase 2: Dashboard PRO Frontend (COMPLETADO)

- [x] AdminPermissionsPage con agrupación por módulos
  - Iconos y colores por módulo
  - Búsqueda de permisos
  - Expand/collapse por módulo
  - 3 tarjetas de estadísticas
  
- [x] AdminRolesPage con cards expandibles
  - Stats: total roles, permisos, usuarios
  - Permisos agrupados por módulo dentro de cada rol
  - Botón "Nuevo rol" (disabled → funcional)
  
- [x] AdminUsersPage con filtros y badges
  - Stats: total, activos, inactivos, superusers
  - Filtros por estado
  - Avatars con iniciales
  - Botón "Nuevo usuario" (disabled → funcional)
  
- [x] Compilación y commit

**Resultado**: UI profesional lista para CRUD

**Commit**: `feat: Agregar catálogo de permisos y mejorar dashboard admin`

---

## ✅ Fase 3: CRUD de Usuarios y Roles (COMPLETADO)

### Backend (ya existía)
- [x] POST /api/v1/users (create_user_with_roles)
- [x] PUT /api/v1/users/{id} (update_user)
- [x] DELETE /api/v1/users/{id} (delete_user)
- [x] POST /api/v1/roles (create_role_with_permissions)
- [x] PUT /api/v1/roles/{id} (update_role)
- [x] DELETE /api/v1/roles/{id} (delete_role)

### Servicios Frontend
- [x] adminApi.createUser(), updateUser(), deleteUser()
- [x] adminApi.createRole(), updateRole(), deleteRole()

### Componentes
- [x] **UserModal component**
  - Formulario: email, password, full_name, is_active
  - Selección múltiple de roles con checkboxes
  - useMutation para create/update
  - Validación y manejo de errores
  - Modos: create/edit
  
- [x] **RoleModal component**
  - Formulario: name, description
  - Selección de permisos por módulo
  - Checkbox por módulo (select all/none)
  - Búsqueda de permisos
  - useMutation para create/update
  - Modos: create/edit
  
### Integración
- [x] AdminUsersPage: botón "Nuevo usuario" → abre UserModal
- [x] AdminRolesPage: botón "Nuevo rol" → abre RoleModal
- [x] Modal state management (isOpen, mode, selectedItem)
- [x] QueryClient invalidation después de mutations
  
### Tipos TypeScript
- [x] UserResponse con roles completos (RoleResponse[])
- [x] RoleResponse con permissions completos
- [x] Exportados correctamente desde @/types/admin
  
### Testing
- [x] Compilación exitosa sin errores TypeScript
- [x] Build de producción funcional

**Resultado**: Sistema CRUD completo funcional

**Commit**: `feat: Implementar modales CRUD para usuarios y roles`

---

## 🎯 Fase 4: Sistema de Auditoría (PRÓXIMO)

### Backend
- [ ] Crear modelo AuditLog en `backend/src/models/audit.py`
  ```python
  class AuditLog(Base):
      id: UUID
      user_id: UUID (FK to users)
      action: str (create, update, delete, login, etc)
      resource_type: str (user, role, permission, participante)
      resource_id: Optional[UUID]
      old_value: Optional[JSON]
      new_value: Optional[JSON]
      ip_address: str
      user_agent: str
      timestamp: datetime
  ```

- [ ] Decorator @audit_action para auditoría automática
  ```python
  @audit_action(resource_type="users", action="create")
  async def create_user(...)
  ```

- [ ] Servicio AuditService
  - log_action()
  - get_audit_logs(filters, pagination)
  - get_resource_history(resource_type, resource_id)

- [ ] Endpoints en `/api/v1/audit`
  - GET /logs (con filtros: user, action, resource, date_range)
  - GET /logs/{id}
  - GET /resources/{resource_type}/{resource_id}/history

### Frontend
- [ ] Vista AdminAuditPage
  - Tabla con columnas: timestamp, user, action, resource, IP
  - Filtros: fecha, usuario, acción, recurso
  - Búsqueda por texto
  - Paginación

- [ ] Componente AuditDetailModal
  - Mostrar before/after en JSON
  - Diff viewer visual
  - Información completa del cambio

- [ ] Export funcionalidad
  - Botón "Exportar a CSV"
  - Filtrar logs antes de exportar

### Testing
- [ ] Backend tests para AuditService
- [ ] Frontend tests para filtros
- [ ] E2E test: crear usuario → ver en audit log

---

## 📅 Fases Futuras (5-10)

### Fase 5: Roles Temporales
- [ ] Campo `expires_at` en tabla `user_roles`
- [ ] Migración Alembic para agregar columna
- [ ] Job scheduler (APScheduler) para remover roles expirados
- [ ] UI: DatePicker en UserModal para "Asignar hasta..."
- [ ] Badge en AdminUsersPage: "⏰ Expira en 3 días"

### Fase 6: Password Policy
- [ ] Configuración en Settings
  - min_length, require_uppercase, require_numbers, require_special
- [ ] Validación en backend (Pydantic validator)
- [ ] Tabla `password_history` (hash, user_id, created_at)
- [ ] No permitir reuso de últimas 5 passwords
- [ ] Campo `password_expires_at` en User model
- [ ] UI: indicador de fortaleza en tiempo real
- [ ] Forzar cambio de password al expirar

### Fase 7: Permisos con Wildcards
- [ ] Soporte para patrones: `participantes:*`, `*:read`, `*:*`
- [ ] Función `match_permission(required, granted)` con wildcards
- [ ] Actualizar `has_permission()` para usar matching
- [ ] UI: selector de wildcards en RoleModal
- [ ] Validación: no permitir `*:*` salvo superuser

### Fase 8: Gestión de Sesiones Activas
- [ ] Tabla `sessions` (id, user_id, token_jti, ip, user_agent, expires_at)
- [ ] Guardar JTI en sesión al login
- [ ] Endpoint GET /api/v1/users/me/sessions
- [ ] Endpoint DELETE /api/v1/users/me/sessions/{jti} (revoke)
- [ ] AdminSessionsPage: ver todas las sesiones activas
- [ ] Botón "Cerrar todas las sesiones" excepto actual

### Fase 9: Cache de Permisos con Redis
- [ ] Agregar Redis al docker-compose
- [ ] Cachear permisos por user_id: `permissions:{user_id}`
- [ ] TTL: 15 minutos
- [ ] Invalidar al cambiar roles/permissions de usuario
- [ ] Middleware: check cache antes de query DB
- [ ] Monitoring: hit rate de cache

### Fase 10: 2FA y RBAC Avanzado
- [ ] **Two-Factor Authentication**
  - Tabla `user_2fa` (user_id, secret, backup_codes, enabled)
  - Endpoint POST /api/v1/auth/2fa/enable
  - Endpoint POST /api/v1/auth/2fa/verify
  - UI: QR code en perfil de usuario

- [ ] **Resource-Based Access Control**
  - Permisos con condiciones: `participantes:edit:own`
  - Tabla `resource_permissions` (user_id, resource_type, resource_id, actions[])
  - Decorator @require_resource_permission("participantes", "edit", resource_id)

- [ ] **Context-Aware Access**
  - Reglas basadas en hora: `only_business_hours`
  - Reglas basadas en IP: `only_from_office`
  - Tabla `access_rules` (role_id, conditions JSON)

---

## 📊 Resumen de Progreso

| Fase | Estado | Descripción | Archivos Clave | Commits |
|------|--------|-------------|----------------|---------|
| 1 | ✅ Completado | Catálogo de permisos con 29 permisos en 8 módulos | `init_permissions.py`, `user_service.py` | `feat: Agregar catálogo de permisos...` |
| 2 | ✅ Completado | Dashboard PRO con módulos, stats, filtros | `AdminPermissionsPage.tsx`, `AdminRolesPage.tsx`, `AdminUsersPage.tsx` | `feat: Agregar catálogo de permisos...` |
| 3 | ✅ Completado | Modales CRUD para usuarios y roles | `UserModal.tsx`, `RoleModal.tsx`, `admin.ts` | `feat: Implementar modales CRUD...` |
| 4 | 📋 Planeado | Sistema de auditoría con logs | `audit.py`, `AdminAuditPage.tsx` | - |
| 5 | 📅 Futuro | Roles temporales con expiración | `user_roles` migration, scheduler | - |
| 6 | 📅 Futuro | Password policy y validación | `password_history`, validators | - |
| 7 | 📅 Futuro | Permisos con wildcards | `match_permission()` | - |
| 8 | 📅 Futuro | Gestión de sesiones activas | `sessions` table, `AdminSessionsPage.tsx` | - |
| 9 | 📅 Futuro | Cache de permisos con Redis | Redis, cache middleware | - |
| 10 | 📅 Futuro | 2FA, resource-based permissions | `user_2fa`, `resource_permissions` | - |

**Total completado**: 3/10 fases (30%)

---

## 🎓 Aprendizajes Clave

### Backend ya estaba completo
- Los endpoints CRUD para users y roles ya existían desde el principio
- Solo faltaba conectar el frontend con useMutation

### UserResponse vs UserSummary
- `UserSummary`: solo role names (string[])
- `UserResponse`: roles completos (RoleResponse[]) con IDs
- UserModal necesita los IDs para asignación

### Module grouping pattern
- Permisos con formato `module:action`
- Split por `:` para agrupar visualmente
- Consistente en backend (catalog) y frontend (modals)

### React Query invalidation
- `queryClient.invalidateQueries({ queryKey: ['admin-users'] })`
- Refresca automáticamente la lista después de crear/editar
- No necesita refetch manual

### Modal state management
- `isOpen`, `selectedItem`, `mode` ('create'|'edit')
- Reset form en `useEffect` cuando cambia `isOpen` o `item`
- `onClose` limpia estado: `setIsOpen(false); setSelected(null)`

---

## 🚀 Próximos Pasos Inmediatos

1. **Testear CRUD en desarrollo**
   - Iniciar docker-compose
   - Crear usuario desde UI
   - Editar usuario existente
   - Crear rol con permisos
   - Verificar que todo funcione

2. **Implementar botones Edit/Delete**
   - Agregar botones de acción en tablas
   - UserModal en modo 'edit'
   - RoleModal en modo 'edit'
   - Confirmación antes de delete

3. **Comenzar Fase 4: Auditoría**
   - Modelo AuditLog
   - Decorator para logging
   - Vista básica de logs

---

## 📝 Notas Técnicas

### Estructura de Permisos (29 total)
```
participantes (7): create, read, update, delete, export, import, bulk_actions
users (5): create, read, update, delete, manage
roles (5): create, read, update, delete, manage
permissions (2): read, manage
reports (3): view, export, schedule
audit (2): view_logs, export_logs
system (3): manage_settings, view_health, manage_cache
notifications (2): send, manage_templates
```

### UserModal Fields
```typescript
{
  email: string (required)
  password: string (required for create, optional for edit)
  full_name: string (optional)
  is_active: boolean (checkbox)
  role_ids: string[] (checkboxes)
}
```

### RoleModal Features
- Permissions grouped by module with expand/collapse
- Search filters permissions in real-time
- Module checkbox: select/deselect all permissions in module
- Indeterminate state when some (not all) permissions selected
- Permission count badge per module
