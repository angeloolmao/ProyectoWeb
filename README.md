# ProyectoWeb

Plataforma social de cine inspirada en Letterboxd para explorar el catálogo de películas, registrar películas vistas, calificar en escala de 1 a 5 estrellas, publicar y moderar reseñas, y organizar listas personales.

**URL pública (AWS EC2):** http://184.193.217.254

**Link Drive Video Presentación:** 
https://drive.google.com/drive/folders/1El0HDOQbQmIjzmuxlUDjOyfefek7J0zS?usp=sharing
---

## 1. Vistas y rutas de la aplicación

| Ruta | Vista | Operaciones principales |
|---|---|---|
| `/index.html` | Catálogo de películas | Listado de películas con pósters, metadatos y buscador reactivo por título |
| `/pelicula.html?id=1` | Detalle de película | Ficha técnica, calificación de 1 a 5 estrellas, marcar como vista, añadir a lista y CRUD de reseñas propias |
| `/listas.html` | Mis listas | Crear, renombrar y eliminar listas personales; añadir y quitar películas sin duplicados |
| `/perfil.html` | Perfil y estadísticas | Edición de nombre y biografía, métricas calculadas en vivo y pestañas de Vistas, Reseñas y Listas |
| `/login.html` | Iniciar sesión | Autenticación contra el repositorio de usuarios y botones de acceso rápido de prueba |
| `/register.html` | Crear cuenta | Registro de nuevos usuarios con validación de correo y nombre de usuario único |
| `/admin.html` | Panel de administración | CRUD de películas del catálogo, suspensión/reactivación de usuarios y moderación de reseñas reportadas |

---

## 2. Cuentas de prueba

En `/login.html` puedes ingresar manualmente o usar los botones de acceso rápido:

| Rol | Usuario | Correo | Contraseña | Permisos |
|---|---|---|---|---|
| **Administrador** | `carlos_p` | `carlos@correo.com` | `123` | Acceso completo + gestión de películas, usuarios y moderación en `/admin.html` |
| **Usuario** | `camila_r` | `camila@correo.com` | `123` | Calificar, marcar vistas, gestionar sus listas y editar/eliminar sus propias reseñas |
| **Administrador** | `fmatus` | `fmatus@correo.com` | `123` | Acceso completo y moderación |

---

## 3. Arquitectura MVC por dominio y principios SOLID

La aplicación está estructurada en capas desacopladas usando módulos ES (`type="module"`) y **Alpine.js** para las vistas reactivas:

```
Vista HTML (Alpine.js x-data) ──► Controlador (js/controllers/) ──► Servicio (js/services/) ──► Repositorio (js/repositories/)
```

- **Punto único de composición (`js/app.js`):** Único archivo donde se crean las instancias de los repositorios, se inyectan en los servicios por constructor (Principio de Inversión de Dependencias, **DIP**) y se registran los componentes con `Alpine.data(...)`.
- **Contrato de persistencia asíncrono (`js/repositories/Repository.js`):** Clase base con métodos `async` (`listar`, `obtenerPorId`, `crear`, `editar`, `eliminar`) extendida por `LocalStorageRepository.js`, de modo que el acceso al almacenamiento del navegador queda aislado exclusivamente en la capa de repositorio.
- **Comunicación entre componentes:** Las vistas se dividen en componentes `x-data` independientes que se comunican mediante eventos personalizados (`$dispatch` y `@evento.window`).

### Mapa de dominios

| Dominio | Vistas (`x-data`) | Controlador (`js/controllers/`) | Servicio (`js/services/`) | Clave de Repositorio |
|---|---|---|---|---|
| **Películas** | `buscadorPeliculas`, `catalogoPeliculas`, `detallePelicula`, `adminPeliculas` | `peliculaController.js` | `peliculaService.js` | `pw_peliculas` |
| **Usuarios y Sesión** | `navegacionSitio`, `loginUsuario`, `registroUsuario`, `cabeceraPerfil`, `adminUsuarios` | `usuarioController.js` | `usuarioService.js` | `pw_usuarios`, `pw_sesion` |
| **Estadísticas** | `estadisticasPerfil` | `usuarioController.js` | `estadisticaService.js` | *(Calculado desde películas, reseñas, calificaciones y listas)* |
| **Reseñas y Moderación** | `resenasPelicula`, `adminModeracion` | `resenaController.js` | `resenaService.js` | `pw_resenas` |
| **Calificaciones** | `calificacionPelicula` | `calificacionController.js` | `calificacionService.js` | `pw_calificaciones` |
| **Listas personales** | `formularioLista`, `listasUsuario` | `listaController.js` | `listaService.js` | `pw_listas` |
| **Estado de conexión** | `estadoConexion` | `conexionController.js` | — | Eventos `online` / `offline` del navegador |

---

## 4. Estructura del proyecto

```
├── index.html
├── pelicula.html
├── listas.html
├── perfil.html
├── login.html
├── register.html
├── admin.html
├── manifest.json
├── sw.js
├── css/
│   └── style.css
├── img/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── posters/
│       └── (*.jpg — pósters del catálogo)
└── js/
    ├── app.js
    ├── data/
    │   └── seed.js
    ├── repositories/
    │   ├── Repository.js
    │   └── LocalStorageRepository.js
    ├── services/
    │   ├── peliculaService.js
    │   ├── usuarioService.js
    │   ├── resenaService.js
    │   ├── calificacionService.js
    │   ├── listaService.js
    │   └── estadisticaService.js
    └── controllers/
        ├── peliculaController.js
        ├── usuarioController.js
        ├── resenaController.js
        ├── calificacionController.js
        ├── listaController.js
        └── conexionController.js
```

---

## 5. PWA y funcionamiento Offline

- **Web App Manifest (`manifest.json`):** Configurado con `"display": "standalone"` e íconos de `192x192` y `512x512` píxeles.
- **Service Worker (`sw.js`):** Precarga en el evento `install` todas las vistas HTML, hojas de estilo, módulos JS, pósters y el script de Alpine.js desde el CDN. Limpia versiones antiguas de caché en `activate` y responde con estrategia *cache-first* (`ignoreSearch: true`) en `fetch`.
- **Indicador de conexión:** Todas las vistas muestran una barra de aviso reactiva cuando el navegador pierde conexión (`offline`) y la ocultan automáticamente al reconectarse (`online`).

---

## 6. Cómo ejecutar el proyecto

### Ejecución local
Como la aplicación utiliza módulos ES (`<script type="module">`) y Service Worker, debe servirse desde un servidor HTTP local (no abrir con `file://`):

```bash
# Opción 1: con Python
python -m http.server 8080

# Opción 2: con Node (npx)
npx serve .
```

Luego abre `http://localhost:8080` en el navegador.

### Despliegue en AWS EC2 (Nginx)
El servidor de producción sirve el repositorio desde `/var/www/ProyectoWeb`:

```bash
cd /var/www/ProyectoWeb
sudo git pull origin main
sudo chown -R www-data:www-data /var/www/ProyectoWeb
sudo systemctl restart nginx
```
