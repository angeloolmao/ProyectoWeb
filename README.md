# ProyectoWeb

Plataforma social de películas (estilo Letterboxd) con frontend en Alpine.js y backend API REST en Node.js, Express, MongoDB (Mongoose) y autenticación JWT.

- **URL pública (IP elástica AWS EC2):** http://184.193.217.254
- **Verificación de la API:** http://184.193.217.254/api/salud
- **Video de presentación:** *(pendiente: pegar link antes del cierre)*

---

## 1. Usuario de prueba

Para probar el login en `POST /api/auth/login` o desde `/login.html`:

| Rol | Correo | Contraseña | Usuario |
|---|---|---|---|
| Administrador | `carlos@correo.com` | `123` | `carlos_p` |
| Usuario | `camila@correo.com` | `123` | `camila_r` |

---

## 2. Diagrama de arquitectura

```text
+-----------------------+
|  Navegador (Cliente)  |
|  HTML + Alpine.js     |
|  ApiRepository (fetch)|
+-----------+-----------+
            |  HTTP (mismo origen: / y /api/*)
            v
+-----------------------+
|   Nginx (puerto 80)   |
|  /      -> estáticos  |
|  /api/  -> proxy_pass |
+-----------+-----------+
            |  http://127.0.0.1:3000
            v
+-------------------------------------------------------------+
|            Backend Node.js + Express (systemd)              |
|                                                             |
|  server.js -> app.js (Composition Root)                     |
|    -> logger -> autenticar (JWT)                            |
|    -> Ruta (src/routes/)                                    |
|    -> Servicio (src/services/)     [reglas de negocio]      |
|    -> Repositorio (src/repositories/) [contrato async]      |
|    -> Modelo (src/models/)         [esquemas Mongoose]      |
|    -> notFound (404) -> errorHandler (4 parámetros)         |
+-----------------------------+-------------------------------+
                              |  MONGODB_URI
                              v
                  +-----------------------+
                  |     MongoDB Atlas     |
                  +-----------------------+
```

---

## 3. Variables de entorno

Las credenciales viven fuera del código en `backend/.env` (ignorado en `.gitignore`). La plantilla sin secretos está en `backend/.env.example`:

| Variable | Obligatoria | Descripción | Ejemplo |
|---|---|---|---|
| `PORT` | No (defecto `3000`) | Puerto donde escucha Express | `3000` |
| `MONGODB_URI` | Sí | Cadena de conexión a MongoDB Atlas | `mongodb+srv://usuario:clave@cluster.mongodb.net/proyectoweb` |
| `JWT_SECRET` | Sí | Clave secreta para firmar y verificar tokens JWT | `secreto_largo_y_seguro` |
| `JWT_EXPIRES_IN` | No (defecto `24h`) | Tiempo de expiración del token | `24h` |

Si falta `MONGODB_URI` o `JWT_SECRET`, el servidor termina con un error claro antes de escuchar.

---

## 4. Instalación y ejecución

### En local
```bash
cd backend
npm ci
cp .env.example .env
# Editar backend/.env con MONGODB_URI y JWT_SECRET reales
npm run seed
npm start
```
La aplicación queda disponible en `http://localhost:3000`.

### En producción (AWS EC2 con systemd y Nginx)
```bash
cd /var/www/ProyectoWeb
sudo git pull origin main
cd /var/www/ProyectoWeb/backend
npm ci --omit=dev
sudo systemctl restart proyectoweb
sudo systemctl reload nginx
```

---

## 5. Catálogo de endpoints

Todas las respuestas usan `Content-Type: application/json`. Los errores siguen siempre la forma `{ "error": "mensaje" }`.
Todas las rutas de datos exigen el encabezado `Authorization: Bearer <token>` (sin token, token inválido o vencido → `401`).

### Salud y Autenticación (públicas)

| Método | URL | Auth | Cuerpo | Éxito | Errores |
|---|---|---|---|---|---|
| `GET` | `/api/salud` | No | — | `200` `{ ok, mensaje }` | — |
| `POST` | `/api/auth/registro` | No | `{ username, email, password, name? }` | `201` + `Location` `{ token, usuario }` | `400` datos inválidos, `409` correo o username duplicado |
| `POST` | `/api/auth/login` | No | `{ email, password }` | `200` `{ token, usuario }` | `400` faltan datos, `401` credenciales incorrectas, `403` cuenta suspendida |

### Películas (CRUD completo)

| Método | URL | Auth | Cuerpo | Éxito | Errores |
|---|---|---|---|---|---|
| `GET` | `/api/peliculas` | Sí | — | `200` `[pelicula, ...]` | `401` |
| `GET` | `/api/peliculas/:id` | Sí | — | `200` `{ id, title, year, genre, duration, rating, synopsis, posterUrl }` | `400` id inválido, `401`, `404` |
| `POST` | `/api/peliculas` | Sí (admin) | `{ title, year, genre, rating, duration?, synopsis?, posterUrl? }` | `201` + `Location` `{ id, ... }` | `400`, `401`, `403`, `409` duplicada |
| `PUT` | `/api/peliculas/:id` | Sí (admin) | `{ title, year, genre, rating, duration?, synopsis?, posterUrl? }` | `200` `{ id, ... }` | `400`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/peliculas/:id` | Sí (admin) | Campos parciales a editar | `200` `{ id, ... }` | `400`, `401`, `403`, `404`, `409` |
| `DELETE` | `/api/peliculas/:id` | Sí (admin) | — | `204` sin cuerpo | `400`, `401`, `403`, `404` |

### Reseñas (CRUD completo)

| Método | URL | Auth | Cuerpo | Éxito | Errores |
|---|---|---|---|---|---|
| `GET` | `/api/resenas` | Sí | — | `200` `[resena, ...]` | `401` |
| `GET` | `/api/resenas/:id` | Sí | — | `200` `{ id, peliculaId, usuarioId, username, texto, fecha, reportada }` | `400`, `401`, `404` |
| `POST` | `/api/resenas` | Sí | `{ peliculaId, texto }` (`usuarioId` sale del token) | `201` + `Location` `{ id, ... }` | `400`, `401` |
| `PUT` | `/api/resenas/:id` | Sí (autor) | `{ peliculaId, texto, reportada? }` | `200` `{ id, ... }` | `400`, `401`, `403`, `404` |
| `PATCH` | `/api/resenas/:id` | Sí (autor/admin) | `{ texto? }` (autor) o `{ reportada }` | `200` `{ id, ... }` | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/resenas/:id` | Sí (autor/admin) | — | `204` sin cuerpo | `400`, `401`, `403`, `404` |

### Listas personales (CRUD completo, privadas por dueño)

| Método | URL | Auth | Cuerpo | Éxito | Errores |
|---|---|---|---|---|---|
| `GET` | `/api/listas` | Sí | — (solo listas del usuario del token) | `200` `[lista, ...]` | `401` |
| `GET` | `/api/listas/:id` | Sí (dueño) | — | `200` `{ id, usuarioId, nombre, descripcion, peliculaIds }` | `400`, `401`, `403`, `404` |
| `POST` | `/api/listas` | Sí | `{ nombre, descripcion?, peliculaIds? }` | `201` + `Location` `{ id, ... }` | `400`, `401`, `409` repetida |
| `PUT` | `/api/listas/:id` | Sí (dueño) | `{ nombre, descripcion?, peliculaIds? }` | `200` `{ id, ... }` | `400`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/listas/:id` | Sí (dueño) | `{ nombre?, descripcion?, peliculaIds? }` | `200` `{ id, ... }` | `400`, `401`, `403`, `404`, `409` |
| `DELETE` | `/api/listas/:id` | Sí (dueño) | — | `204` sin cuerpo | `400`, `401`, `403`, `404` |

### Calificaciones

| Método | URL | Auth | Cuerpo | Éxito | Errores |
|---|---|---|---|---|---|
| `GET` | `/api/calificaciones` | Sí | — | `200` `[calificacion, ...]` | `401` |
| `GET` | `/api/calificaciones/:id` | Sí | — | `200` `{ id, peliculaId, usuarioId, puntaje }` | `400`, `401`, `404` |
| `POST` | `/api/calificaciones` | Sí | `{ peliculaId, puntaje }` (entero 1–5) | `201` + `Location` `{ id, ... }` | `400`, `401`, `409` ya calificada |
| `PATCH` | `/api/calificaciones/:id` | Sí (dueño) | `{ puntaje }` | `200` `{ id, ... }` | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/calificaciones/:id` | Sí (dueño) | — | `204` sin cuerpo | `400`, `401`, `403`, `404` |

### Usuarios

| Método | URL | Auth | Cuerpo | Éxito | Errores |
|---|---|---|---|---|---|
| `GET` | `/api/usuarios` | Sí | — (nunca devuelve hash de contraseña) | `200` `[usuario, ...]` | `401` |
| `GET` | `/api/usuarios/:id` | Sí | — | `200` `{ id, username, name, role, active, memberSince, bio, watchedIds }` | `400`, `401`, `404` |
| `PATCH` | `/api/usuarios/:id` | Sí | `{ name?, bio?, watchedIds? }` (propio) o `{ active }` (admin) | `200` `{ id, ... }` | `400`, `401`, `403`, `404` |
