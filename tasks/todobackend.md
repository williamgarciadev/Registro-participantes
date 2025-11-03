# Plan para login con roles y permisos

- [x] Backend - Modelo y seguridad: crear entidades (`User`, `Role`, `Permission`), hashing de contrasenas, utilidades JWT y dependencias reutilizables; actualizar `requirements.txt` y la inicializacion de tablas para incluir la nueva estructura sin exponer secretos.
- [x] Backend - Endpoints y proteccion: exponer rutas de autenticacion (`/auth/login`, `/auth/profile`), sembrar o documentar un usuario admin base, aplicar dependencias de autorizacion segun rol sobre los endpoints de participantes.
- [ ] Frontend - Flujo de login: anadir pagina de acceso, estado global de sesion con almacenamiento seguro del token, guardas de ruta y visibilidad condicionada segun rol, incluyendo mensajes de error y manejo de expiracion.
- [ ] Cierre - Verificacion y entrega: pruebas manuales basicas (login, acceso permitido/denegado), checklist de seguridad, seccion de revision, y commits/push por tarea completada siguiendo las buenas practicas.
