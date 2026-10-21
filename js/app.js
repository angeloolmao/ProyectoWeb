// Punto único de composición e inyección de dependencias

import LocalStorageRepository from './repositories/LocalStorageRepository.js';
import PeliculaService from './services/peliculaService.js';
import { buscadorPeliculasController, catalogoPeliculasController } from './controllers/peliculaController.js';
import { PELICULAS_INICIALES } from './data/seed.js';

// Instanciación única del repositorio y servicio de películas
const peliculaRepository = new LocalStorageRepository('pw_peliculas', PELICULAS_INICIALES);
const peliculaService = new PeliculaService(peliculaRepository);

function registrarComponentes() {
    window.Alpine.data('buscadorPeliculas', buscadorPeliculasController);
    window.Alpine.data('catalogoPeliculas', () => catalogoPeliculasController(peliculaService));
}

if (window.Alpine) {
    registrarComponentes();
} else {
    document.addEventListener('alpine:init', registrarComponentes);
}
