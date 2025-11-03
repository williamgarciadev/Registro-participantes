# Plan para login con roles y permisos

- [x] Backend - Modelo y seguridad: crear entidades (`User`, `Role`, `Permission`), hashing de contrasenas, utilidades JWT y dependencias reutilizables; actualizar `requirements.txt` y la inicializacion de tablas para incluir la nueva estructura sin exponer secretos.
- [x] Backend - Endpoints y proteccion: exponer rutas de autenticacion (`/auth/login`, `/auth/profile`), sembrar o documentar un usuario admin base, aplicar dependencias de autorizacion segun rol sobre los endpoints de participantes.
- [x] Frontend - Flujo de login: anadir pagina de acceso, estado global de sesion con almacenamiento seguro del token, guardas de ruta y visibilidad condicionada segun rol, incluyendo mensajes de error y manejo de expiracion.
- [ ] Cierre - Verificacion y entrega: pruebas manuales basicas (login, acceso permitido/denegado), checklist de seguridad, seccion de revision, y commits/push por tarea completada siguiendo las buenas practicas.

## Revision

- Nuevo flujo de autenticacion en React con pagina dedicada, manejo de token y cierres de sesion ante respuestas 401.
- Layout, panel de participantes y paginas de alta/edicion condicionan botones y acciones segun los permisos `participantes:view` y `participantes:manage`.
- Estilos base ampliados con componentes `auth-*` para la pantalla de acceso y estado de carga protegido.

# Plan para modulo de gestion de usuarios, roles y permisos

- [ ] Backend - Endpoints y servicios: CRUD para usuarios, roles y permisos reutilizando la capa actual, validaciones y paginacion.
- [ ] Frontend - Vistas y estados: paginas de listado/alta/edicion, componentes de formulario y consumo de la API con filtros y controles de rol.
- [ ] Integracion y seguridad: pruebas manuales, verificacion de restricciones por rol, documentacion y actualizacion de tareas pendientes.
