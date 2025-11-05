# Documentación de API - MiPage

## Base URL

```
Desarrollo: http://localhost:3001/api
Producción: https://tu-dominio.com/api
```

## Autenticación

La API usa JWT (JSON Web Tokens) para autenticación.

**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Autenticación

#### POST /auth/register
Registrar nuevo usuario

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Juan Pérez",
  "role": "USER" // USER | PUBLISHER
}
```

**Response:** `201 Created`
```json
{
  "message": "Usuario registrado exitosamente",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### POST /auth/login
Iniciar sesión

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login exitoso",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### GET /auth/profile
Obtener perfil del usuario autenticado

**Auth:** Required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "role": "USER",
  "avatar": "https://...",
  "_count": {
    "services": 5,
    "reviews": 10
  }
}
```

### Servicios

#### GET /services
Obtener todos los servicios

**Query Params:**
- `category` - MODELAJE | MASAJES_PROFESIONALES
- `city` - Filtrar por ciudad
- `minPrice` - Precio mínimo
- `maxPrice` - Precio máximo
- `search` - Buscar en título/descripción
- `page` - Número de página (default: 1)
- `limit` - Items por página (default: 12)

**Response:** `200 OK`
```json
{
  "services": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 12,
    "pages": 5
  }
}
```

#### GET /services/:id
Obtener servicio por ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Sesión Fotográfica",
  "description": "...",
  "price": 50000,
  "category": "MODELAJE",
  "user": { ... },
  "reviews": [...],
  "averageRating": 4.5,
  "isFavorite": false
}
```

#### POST /services
Crear nuevo servicio

**Auth:** Required (PUBLISHER o ADMIN)

**Body:**
```json
{
  "category": "MODELAJE",
  "title": "Sesión Fotográfica",
  "description": "Descripción detallada...",
  "price": 50000,
  "priceType": "hour",
  "location": "Santiago Centro",
  "city": "Santiago",
  "region": "Metropolitana",
  "photos": ["https://...", "https://..."],
  "availability": {
    "days": ["Lunes", "Martes"],
    "hours": "09:00 - 18:00"
  }
}
```

**Response:** `201 Created`

#### PUT /services/:id
Actualizar servicio

**Auth:** Required (Owner o ADMIN)

#### DELETE /services/:id
Eliminar servicio

**Auth:** Required (Owner o ADMIN)

#### POST /services/:id/favorite
Toggle favorito

**Auth:** Required

**Response:** `200 OK`
```json
{
  "message": "Servicio agregado a favoritos",
  "isFavorite": true
}
```

### Reseñas

#### POST /reviews/:serviceId
Crear reseña

**Auth:** Required

**Body:**
```json
{
  "rating": 5,
  "comment": "Excelente servicio!",
  "photos": ["https://..."]
}
```

#### PUT /reviews/:id/respond
Responder a reseña

**Auth:** Required (PUBLISHER - owner del servicio)

**Body:**
```json
{
  "response": "Muchas gracias por tu comentario!"
}
```

#### PUT /reviews/:id
Actualizar reseña

**Auth:** Required (Owner)

#### DELETE /reviews/:id
Eliminar reseña

**Auth:** Required (Owner o ADMIN)

### Posts

#### POST /posts
Crear post (timeline)

**Auth:** Required (PUBLISHER)

**Body:**
```json
{
  "content": "Nueva promoción disponible!",
  "photos": ["https://..."],
  "type": "promotion" // update | promotion | announcement
}
```

#### GET /posts/feed
Obtener feed de posts

**Query Params:**
- `page` - Número de página
- `limit` - Items por página

### Admin

#### GET /admin/stats
Obtener estadísticas

**Auth:** Required (ADMIN)

#### GET /admin/services/pending
Servicios pendientes de aprobación

**Auth:** Required (ADMIN)

#### PUT /admin/services/:id/approve
Aprobar servicio

**Auth:** Required (ADMIN)

#### PUT /admin/services/:id/reject
Rechazar servicio

**Auth:** Required (ADMIN)

**Body:**
```json
{
  "reason": "Razón del rechazo (opcional)"
}
```

## Códigos de Estado

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

- **General:** 100 requests por 15 minutos
- **Auth:** 5 intentos de login por 15 minutos
- **Uploads:** 20 uploads por hora

## WebSocket Events

Conectar a: `ws://localhost:3001`

**Events:**
- `notification` - Nueva notificación
- `new_service_pending` - Nuevo servicio pendiente (admin)

**Emitir:**
- `join_room` - Unirse a sala personal (enviar userId)

## Ejemplos con cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"password123"}'

# Obtener servicios
curl http://localhost:3001/api/services?category=MODELAJE

# Crear servicio (con auth)
curl -X POST http://localhost:3001/api/services \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"MODELAJE","title":"Mi Servicio",...}'
```

## Documentación Interactiva

En desarrollo, visita: http://localhost:3001/api-docs

Swagger UI con todos los endpoints y ejemplos.
