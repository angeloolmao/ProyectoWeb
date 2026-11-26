import express from 'express';
import logger from './src/middlewares/logger.js';
import notFound from './src/middlewares/notFound.js';
import errorHandler from './src/middlewares/errorHandler.js';
import PeliculaRepositoryMongo from './src/repositories/PeliculaRepositoryMongo.js';
import ResenaRepositoryMongo from './src/repositories/ResenaRepositoryMongo.js';
import PeliculaService from './src/services/PeliculaService.js';
import ResenaService from './src/services/ResenaService.js';
import crearRouterCrud from './src/routes/crearRouterCrud.js';

// Composition root: único lugar que nombra las clases concretas y las conecta
export function construirDependencias() {
    const peliculaRepository = new PeliculaRepositoryMongo();
    const resenaRepository = new ResenaRepositoryMongo();

    const peliculaService = new PeliculaService(peliculaRepository);
    const resenaService = new ResenaService(resenaRepository, peliculaService);

    return { peliculaRepository, resenaRepository, peliculaService, resenaService };
}

export function crearApp() {
    const { peliculaService, resenaService } = construirDependencias();
    const app = express();

    app.use(express.json());
    app.use(logger);

    app.get('/api/salud', (req, res) => {
        res.json({ ok: true, mensaje: 'API ProyectoWeb operativa' });
    });

    app.use('/api/peliculas', crearRouterCrud(peliculaService));
    app.use('/api/resenas', crearRouterCrud(resenaService));

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

export default crearApp;
