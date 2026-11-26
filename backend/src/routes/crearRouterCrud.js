import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';

// Router REST estándar para un servicio con listar, obtener, crear, reemplazar, actualizar y eliminar
export default function crearRouterCrud(servicio) {
    const router = Router();

    router.get('/', asyncHandler(async (req, res) => {
        res.json(await servicio.listar());
    }));

    router.get('/:id', asyncHandler(async (req, res) => {
        res.json(await servicio.obtener(req.params.id));
    }));

    router.post('/', asyncHandler(async (req, res) => {
        const creado = await servicio.crear(req.body);
        res.status(201).location(`${req.baseUrl}/${creado.id}`).json(creado);
    }));

    router.put('/:id', asyncHandler(async (req, res) => {
        res.json(await servicio.reemplazar(req.params.id, req.body));
    }));

    router.patch('/:id', asyncHandler(async (req, res) => {
        res.json(await servicio.actualizar(req.params.id, req.body));
    }));

    router.delete('/:id', asyncHandler(async (req, res) => {
        await servicio.eliminar(req.params.id);
        res.status(204).end();
    }));

    return router;
}
