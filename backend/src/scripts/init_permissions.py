"""
Script para inicializar permisos del sistema de forma automática.
Ejecutar cuando se crea la base de datos o se agregan nuevos módulos.
"""
from typing import List, Tuple

# Formato: (código, nombre, descripción)
SYSTEM_PERMISSIONS: List[Tuple[str, str, str]] = [
    # Participantes
    ("participantes:view", "Ver participantes", "Listar y consultar participantes"),
    ("participantes:create", "Crear participantes", "Agregar nuevos participantes al sistema"),
    ("participantes:edit", "Editar participantes", "Modificar información de participantes existentes"),
    ("participantes:delete", "Eliminar participantes", "Borrar participantes del sistema"),
    ("participantes:export", "Exportar participantes", "Descargar listados de participantes en CSV/Excel"),
    ("participantes:import", "Importar participantes", "Carga masiva de participantes desde archivos"),
    
    # Usuarios
    ("users:view", "Ver usuarios", "Listar y consultar usuarios del sistema"),
    ("users:create", "Crear usuarios", "Agregar nuevos usuarios al sistema"),
    ("users:edit", "Editar usuarios", "Modificar información de usuarios existentes"),
    ("users:delete", "Eliminar usuarios", "Borrar usuarios del sistema"),
    ("users:manage", "Gestión completa de usuarios", "Acceso total a la administración de usuarios"),
    
    # Roles
    ("roles:view", "Ver roles", "Listar y consultar roles del sistema"),
    ("roles:create", "Crear roles", "Definir nuevos roles"),
    ("roles:edit", "Editar roles", "Modificar roles existentes"),
    ("roles:delete", "Eliminar roles", "Borrar roles del sistema"),
    ("roles:manage", "Gestión completa de roles", "Acceso total a la administración de roles"),
    
    # Permisos
    ("permissions:view", "Ver permisos", "Consultar permisos disponibles en el sistema"),
    ("permissions:manage", "Gestionar permisos", "Administrar permisos del sistema"),
    
    # Reportes
    ("reports:view", "Ver reportes", "Consultar paneles e indicadores agregados"),
    ("reports:create", "Crear reportes", "Generar nuevos reportes personalizados"),
    ("reports:export", "Exportar reportes", "Descargar reportes en diferentes formatos"),
    
    # Auditoría
    ("audit:view", "Ver auditoría", "Consultar logs de actividad del sistema"),
    ("audit:export", "Exportar auditoría", "Descargar logs de auditoría"),
    
    # Configuración del sistema
    ("system:config", "Configurar sistema", "Modificar configuraciones globales"),
    ("system:backup", "Hacer respaldos", "Crear copias de seguridad del sistema"),
    ("system:restore", "Restaurar respaldos", "Restaurar sistema desde respaldos"),
    
    # Notificaciones
    ("notifications:view", "Ver notificaciones", "Consultar notificaciones propias"),
    ("notifications:manage", "Gestionar notificaciones", "Administrar notificaciones del sistema"),
]


async def init_system_permissions(db):
    """
    Inicializa los permisos del sistema si no existen.
    Se puede llamar desde el endpoint de init-db o como script standalone.
    """
    from src.services.user_service import UserService
    
    created_count = 0
    existing_count = 0
    
    for code, name, description in SYSTEM_PERMISSIONS:
        existing = await UserService.get_permission_by_code(db, code)
        if not existing:
            await UserService.create_permission(db, code, name, description)
            created_count += 1
        else:
            existing_count += 1
    
    await db.commit()
    
    return {
        "created": created_count,
        "existing": existing_count,
        "total": len(SYSTEM_PERMISSIONS)
    }
