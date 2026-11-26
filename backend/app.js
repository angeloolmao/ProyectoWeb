import express from 'express';
import logger from './src/middlewares/logger.js';
import notFound from './src/middlewares/notFound.js';
import errorHandler from './src/middlewares/errorHandler.js';

// Composition root de la aplicación Express
export function crearApp() {
    const app = express();

    app.use(express.json());
    app.use(logger);

    // Endpoint de verificación de estado
    app.get('/api/salud', (req, res) => {
        res.json({ ok: true, mensaje: 'API ProyectoWeb operativa' });
    });

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

export default crearApp;
