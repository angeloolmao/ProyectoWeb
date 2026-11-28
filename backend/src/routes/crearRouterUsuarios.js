import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';

// Usuarios: solo consulta y actualización parcial (el alta es /api/auth/registro)
export default function crearRouterUsuarios(servicio) {
    const router = Router();

    router.get('/', asyncHandler(async (req, res) => {
        res.json(await servicio.listar(req.usuario));
    }));

    router.get('/:id', asyncHandler(async (req, res) => {
        res.json(await servicio.obtener(req.params.id, req.usuario));
    }));

    router.patch('/:id', asyncHandler(async (req, res) => {
        res.json(await servicio.actualizar(req.params.id, req.body, req.usuario));
    }));

    return router;
}
