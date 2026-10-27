// Punto único de composición e inyección de dependencias de la aplicación

import LocalStorageRepository from './repositories/LocalStorageRepository.js';

import PeliculaService from './services/peliculaService.js';
import UsuarioService from './services/usuarioService.js';
import ResenaService from './services/resenaService.js';
import CalificacionService from './services/calificacionService.js';
import ListaService from './services/listaService.js';
import EstadisticaService from './services/estadisticaService.js';


import {
    buscadorPeliculasController,
    catalogoPeliculasController,
    detallePeliculaController,
    adminPeliculasController
} from './controllers/peliculaController.js';

import {
    navegacionSitioController,
    loginController,
    registroController,
    cabeceraPerfilController,
    estadisticasPerfilController,
    adminUsuariosController
} from './controllers/usuarioController.js';

import {
    resenasPeliculaController,
    adminModeracionController
} from './controllers/resenaController.js';

import { calificacionPeliculaController } from './controllers/calificacionController.js';

import {
    formularioListaController,
    listasUsuarioController
} from './controllers/listaController.js';

import {
    PELICULAS_INICIALES,
    USUARIOS_INICIALES,
    SESION_INICIAL,
    RESENAS_INICIALES,
    CALIFICACIONES_INICIALES,
    LISTAS_INICIALES
} from './data/seed.js';

import {
    conexionController
} from './controllers/conexionController.js';



// Instanciación única de repositorios
const peliculaRepository = new LocalStorageRepository('pw_peliculas', PELICULAS_INICIALES);
const usuarioRepository = new LocalStorageRepository('pw_usuarios', USUARIOS_INICIALES);
const sesionRepository = new LocalStorageRepository('pw_sesion', SESION_INICIAL);
const resenaRepository = new LocalStorageRepository('pw_resenas', RESENAS_INICIALES);
const calificacionRepository = new LocalStorageRepository('pw_calificaciones', CALIFICACIONES_INICIALES);
const listaRepository = new LocalStorageRepository('pw_listas', LISTAS_INICIALES);

// Instanciación de servicios por dominio con inyección de dependencias
const peliculaService = new PeliculaService(peliculaRepository);
const usuarioService = new UsuarioService(usuarioRepository, sesionRepository);
const resenaService = new ResenaService(resenaRepository);
const calificacionService = new CalificacionService(calificacionRepository);
const listaService = new ListaService(listaRepository);
const estadisticaService = new EstadisticaService(
    peliculaService,
    resenaService,
    calificacionService,
    listaService
);

// Registro de controladores Alpine.js
function registrarComponentes() {
    window.Alpine.data('navegacionSitio', () => navegacionSitioController(usuarioService));

    window.Alpine.data('buscadorPeliculas', buscadorPeliculasController);
    window.Alpine.data('catalogoPeliculas', () => catalogoPeliculasController(peliculaService));
    window.Alpine.data('detallePelicula', () => detallePeliculaController(peliculaService, usuarioService, listaService));
    window.Alpine.data('adminPeliculas', () => adminPeliculasController(peliculaService, usuarioService));

    window.Alpine.data('loginUsuario', () => loginController(usuarioService));
    window.Alpine.data('registroUsuario', () => registroController(usuarioService));
    window.Alpine.data('cabeceraPerfil', () => cabeceraPerfilController(usuarioService));
    window.Alpine.data('estadisticasPerfil', () => estadisticasPerfilController(usuarioService, estadisticaService));
    window.Alpine.data('adminUsuarios', () => adminUsuariosController(usuarioService));

    window.Alpine.data('resenasPelicula', () => resenasPeliculaController(resenaService, usuarioService));
    window.Alpine.data('adminModeracion', () => adminModeracionController(resenaService, usuarioService));

    window.Alpine.data('calificacionPelicula', () => calificacionPeliculaController(calificacionService, peliculaService, usuarioService));

    window.Alpine.data('formularioLista', () => formularioListaController(listaService, usuarioService));
    window.Alpine.data('listasUsuario', () => listasUsuarioController(listaService, peliculaService, usuarioService));

    window.Alpine.data('estadoConexion', () => conexionController());
}

if (window.Alpine) {
    registrarComponentes();
} else {
    document.addEventListener('alpine:init', registrarComponentes);
}

if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js");
}