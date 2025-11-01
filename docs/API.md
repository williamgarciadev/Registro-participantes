# Documentación de la API

API RESTful para el sistema de registro de participantes.

## Base URL

```
https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev/api/v1
```

## Autenticación

Actualmente la API no requiere autenticación. En producción, se recomienda implementar:
- API Keys
- AWS Cognito
- JWT tokens

## Endpoints

### Health Check

#### GET /health

Verifica el estado de la API.

**Response:**
```json
{
  "status": "healthy"
}
```

---

### Participantes

#### GET /participantes

Obtener lista de participantes con paginación.

**Query Parameters:**
- `skip` (integer, optional): Número de registros a omitir (default: 0)
- `limit` (integer, optional): Límite de registros (default: 100, max: 1000)
- `estado` (string, optional): Filtrar por estado (activo, inactivo, pendiente)

**Response:**
```json
{
  "participantes": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+1 234 567 8900",
      "estado": "activo",
      "fecha_registro": "2024-01-15T10:30:00Z",
      "metadata": {}
    }
  ],
  "total": 150,
  "skip": 0,
  "limit": 100
}
```

**Status Codes:**
- `200 OK`: Éxito
- `500 Internal Server Error`: Error del servidor

---

#### GET /participantes/{id}

Obtener un participante por ID.

**Path Parameters:**
- `id` (UUID, required): ID del participante

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@example.com",
  "telefono": "+1 234 567 8900",
  "estado": "activo",
  "fecha_registro": "2024-01-15T10:30:00Z",
  "metadata": {}
}
```

**Status Codes:**
- `200 OK`: Éxito
- `404 Not Found`: Participante no encontrado
- `500 Internal Server Error`: Error del servidor

---

#### POST /participantes

Crear un nuevo participante.

**Request Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@example.com",
  "telefono": "+1 234 567 8900",
  "metadata": {
    "empresa": "Acme Corp",
    "departamento": "IT"
  }
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@example.com",
  "telefono": "+1 234 567 8900",
  "estado": "activo",
  "fecha_registro": "2024-01-15T10:30:00Z",
  "metadata": {
    "empresa": "Acme Corp",
    "departamento": "IT"
  }
}
```

**Status Codes:**
- `201 Created`: Participante creado exitosamente
- `400 Bad Request`: Datos inválidos o email duplicado
- `422 Unprocessable Entity`: Error de validación
- `500 Internal Server Error`: Error del servidor

---

#### PUT /participantes/{id}

Actualizar un participante existente.

**Path Parameters:**
- `id` (UUID, required): ID del participante

**Request Body:**
```json
{
  "nombre": "Juan Carlos",
  "telefono": "+1 234 567 8901",
  "estado": "activo"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nombre": "Juan Carlos",
  "apellido": "Pérez",
  "email": "juan.perez@example.com",
  "telefono": "+1 234 567 8901",
  "estado": "activo",
  "fecha_registro": "2024-01-15T10:30:00Z",
  "metadata": {}
}
```

**Status Codes:**
- `200 OK`: Participante actualizado exitosamente
- `400 Bad Request`: Datos inválidos
- `404 Not Found`: Participante no encontrado
- `422 Unprocessable Entity`: Error de validación
- `500 Internal Server Error`: Error del servidor

---

#### DELETE /participantes/{id}

Eliminar un participante (soft delete).

**Path Parameters:**
- `id` (UUID, required): ID del participante

**Response:**
```
No content
```

**Status Codes:**
- `204 No Content`: Participante eliminado exitosamente
- `404 Not Found`: Participante no encontrado
- `500 Internal Server Error`: Error del servidor

**Nota:** Esta operación realiza un "soft delete", cambiando el estado a "inactivo" en lugar de eliminar el registro.

---

#### GET /participantes/search

Buscar participantes por nombre, apellido o email.

**Query Parameters:**
- `q` (string, required): Término de búsqueda
- `skip` (integer, optional): Número de registros a omitir (default: 0)
- `limit` (integer, optional): Límite de registros (default: 100, max: 1000)

**Response:**
```json
{
  "participantes": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+1 234 567 8900",
      "estado": "activo",
      "fecha_registro": "2024-01-15T10:30:00Z",
      "metadata": {}
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 100
}
```

**Status Codes:**
- `200 OK`: Éxito
- `400 Bad Request`: Término de búsqueda inválido
- `500 Internal Server Error`: Error del servidor

---

## Modelos de Datos

### Participante

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| id | UUID | Identificador único | Sí (generado) |
| nombre | string (max 100) | Nombre del participante | Sí |
| apellido | string (max 100) | Apellido del participante | Sí |
| email | string (max 255) | Email único | Sí |
| telefono | string (max 20) | Teléfono | No |
| estado | enum | Estado (activo, inactivo, pendiente) | Sí (default: activo) |
| fecha_registro | datetime | Fecha y hora de registro | Sí (generado) |
| metadata | object | Metadata adicional en formato JSON | No |

### Estados

- `activo`: Participante activo en el sistema
- `inactivo`: Participante desactivado o eliminado
- `pendiente`: Participante pendiente de aprobación

## Códigos de Error

### 400 Bad Request

```json
{
  "detail": "El email juan.perez@example.com ya está registrado"
}
```

### 404 Not Found

```json
{
  "detail": "Participante 123e4567-e89b-12d3-a456-426614174000 no encontrado"
}
```

### 422 Unprocessable Entity

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

## Ejemplos con cURL

### Crear un participante

```bash
curl -X POST https://your-api-url/api/v1/participantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@example.com",
    "telefono": "+1 234 567 8900"
  }'
```

### Obtener todos los participantes

```bash
curl https://your-api-url/api/v1/participantes?skip=0&limit=10
```

### Buscar participantes

```bash
curl https://your-api-url/api/v1/participantes/search?q=juan
```

### Actualizar un participante

```bash
curl -X PUT https://your-api-url/api/v1/participantes/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+1 234 567 8901"
  }'
```

### Eliminar un participante

```bash
curl -X DELETE https://your-api-url/api/v1/participantes/{id}
```

## Límites y Rate Limiting

Actualmente no hay límites de rate en la API. En producción, se recomienda implementar:
- API Gateway throttling: 1000 requests/segundo
- API Gateway quota: 10000 requests/día por API key

## CORS

La API está configurada para aceptar peticiones desde cualquier origen (`*`). En producción, configurar orígenes específicos en `template.yaml`.

## Documentación Interactiva

La API incluye documentación interactiva Swagger UI:

- **Swagger UI**: `https://your-api-url/docs`
- **ReDoc**: `https://your-api-url/redoc`
- **OpenAPI JSON**: `https://your-api-url/openapi.json`
