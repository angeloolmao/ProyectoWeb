# ProyectoWeb

Plataforma social inspirada en servicios como Letterboxd, para registrar películas vistas, calificar, publicar reseñas y descubrir contenido.

## Entrega 1 — estática y despliegue

Foco: interfaz 100% estática (HTML/CSS/JS vanilla, sin backend, sin base de datos), servida con nginx desde un servidor Linux en AWS EC2.

**URL pública:** http://TU_IP_AQUI

## Rutas

| Ruta | Descripción |
|---|---|
| `/index.html` | Catálogo de películas con buscador |
| `/login.html` | Inicio de sesión |
| `/register.html` | Creación de cuenta |
| `/pelicula.html` | Detalle de una película, con calificación y reseñas |
| `/perfil.html` | Perfil del usuario: estadísticas, películas vistas, reseñas y listas |
| `/listas.html` | Listas personales del usuario |
| `/admin.html` | Panel de administrador: gestión de películas, usuarios y moderación de contenido |

## Estructura

```
├── index.html
├── login.html
├── register.html
├── pelicula.html
├── perfil.html
├── listas.html
├── admin.html
├── css/style.css
└── js/script.js
```

## Cómo verlo localmente

Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático.
