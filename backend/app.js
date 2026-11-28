import express from 'express';
import logger from './src/middlewares/logger.js';
import notFound from './src/middlewares/notFound.js';
import errorHandler from './src/middlewares/errorHandler.js';
import crearAutenticador from './src/middlewares/autenticar.js';
import PeliculaRepositoryMongo from './src/repositories/PeliculaRepositoryMongo.js';
import ResenaRepositoryMongo from './src/repositories/ResenaRepositoryMongo.js';
import UsuarioRepositoryMongo from './src/repositories/UsuarioRepositoryMongo.js';
import ListaRepositoryMongo from './src/repositories/ListaRepositoryMongo.js';
import CalificacionRepositoryMongo from './src/repositories/CalificacionRepositoryMongo.js';
import PeliculaService from './src/services/PeliculaService.js';
import ResenaService from './src/services/ResenaService.js';
import UsuarioService from './src/services/UsuarioService.js';
import ListaService from './src/services/ListaService.js';
import CalificacionService from './src/services/CalificacionService.js';
import AuthService from './src/services/AuthService.js';
import crearRouterCrud from './src/routes/crearRouterCrud.js';
import crearRouterAuth from './src/routes/crearRouterAuth.js';
import crearRouterUsuarios from './src/routes/crearRouterUsuarios.js';

// Composition root: único lugar que nombra las clases concretas y las conecta
export function construirDependencias() {
    const peliculaRepository = new PeliculaRepositoryMongo();
    const resenaRepository = new ResenaRepositoryMongo();
    const usuarioRepository = new UsuarioRepositoryMongo();
    const listaRepository = new ListaRepositoryMongo();
    const calificacionRepository = new CalificacionRepositoryMongo();

    const peliculaService = new PeliculaService(peliculaRepository);
    const resenaService = new ResenaService(resenaRepository, peliculaService);
    const usuarioService = new UsuarioService(usuarioRepository, peliculaService);
    const listaService = new ListaService(listaRepository, peliculaService);
    const calificacionService = new CalificacionService(calificacionRepository, peliculaService);
    const authService = new AuthService(usuarioRepository, {
        secreto: process.env.JWT_SECRET,
        expiracion: process.env.JWT_EXPIRES_IN
    });

    return {
        peliculaRepository,
        resenaRepository,
        usuarioRepository,
        listaRepository,
        calificacionRepository,
        peliculaService,
        resenaService,
        usuarioService,
        listaService,
        calificacionService,
        authService
    };
}

export function crearApp() {
    const dependencias = construirDependencias();
    const autenticar = crearAutenticador(dependencias.authService);
    const app = express();

    app.use(express.json());
    app.use(logger);

    // Rutas públicas
    app.get('/api/salud', (req, res) => {
        res.json({ ok: true, mensaje: 'API ProyectoWeb operativa' });
    });
    app.use('/api/auth', crearRouterAuth(dependencias.authService));

    // Rutas de datos: exigen token
    app.use('/api/peliculas', autenticar, crearRouterCrud(dependencias.peliculaService));
    app.use('/api/resenas', autenticar, crearRouterCrud(dependencias.resenaService));
    app.use('/api/listas', autenticar, crearRouterCrud(dependencias.listaService));
    app.use('/api/calificaciones', autenticar, crearRouterCrud(dependencias.calificacionService));
    app.use('/api/usuarios', autenticar, crearRouterUsuarios(dependencias.usuarioService));

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

export default crearApp;
