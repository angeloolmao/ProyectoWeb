import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';

// Router REST estándar: pasa el usuario autenticado (req.usuario) al servicio
export default function crearRouterCrud(servicio) {
    const router = Router();

    router.get('/', asyncHandler(async (req, res) => {
        res.json(await servicio.listar(req.usuario));
    }));

    router.get('/:id', asyncHandler(async (req, res) => {
        res.json(await servicio.obtener(req.params.id, req.usuario));
    }));

    router.post('/', asyncHandler(async (req, res) => {
        const creado = await servicio.crear(req.body, req.usuario);
        res.status(201).location(`${req.baseUrl}/${creado.id}`).json(creado);
    }));

    router.put('/:id', asyncHandler(async (req, res) => {
        res.json(await servicio.reemplazar(req.params.id, req.body, req.usuario));
    }));

    router.patch('/:id', asyncHandler(async (req, res) => {
        res.json(await servicio.actualizar(req.params.id, req.body, req.usuario));
    }));

    router.delete('/:id', asyncHandler(async (req, res) => {
        await servicio.eliminar(req.params.id, req.usuario);
        res.status(204).end();
    }));

    return router;
}
