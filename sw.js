const NOMBRE = "proyectoweb-n1";
const ARCHIVOS =[ 
"css/style.css",
"index.html",
"admin.html",
"listas.html",
"login.html",
"pelicula.html",
"perfil.html",
"register.html",
"js/app.js",
"js/controllers/calificacionController.js",
"js/controllers/listaController.js",
"js/controllers/peliculaController.js",
"js/controllers/resenaController.js",
"js/controllers/usuarioController.js",
"js/data/seed.js",
"js/repositories/LocalStorageRepository.js",
"js/repositories/Repository.js",
"js/services/calificacionService.js",
"js/services/estadisticaService.js",
"js/services/listaService.js",
"js/services/peliculaService.js",
"js/services/resenaService.js",
"js/services/usuarioService.js",
"manifest.json",
"img/icons/icon-192.png",
"img/icons/icon-512.png",
"img/posters/coco.jpg",
"img/posters/el-origen.jpg",
"img/posters/el-padrino.jpg",
"img/posters/el-senor-de-los-anillos.jpg",
"img/posters/interstellar.jpg",
"img/posters/joker.jpg",
"img/posters/la-la-land.jpg",
"img/posters/orgullo-y-prejuicio.jpg",
"img/posters/parasitos.jpg",
"img/posters/pulp-fiction.jpg",
"img/posters/spiderman.jpg",
"img/posters/titanic.jpg",
"https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil( 
        caches.open(NOMBRE).then((cache) =>{
           return cache.addAll(ARCHIVOS); 
        })
    );
});

self.addEventListener( "fetch", (event) =>{
    event.respondWith(
        caches.match(event.request).then((respuesta) => {
            return respuesta || fetch(event.request);
    
        })
    );
});

