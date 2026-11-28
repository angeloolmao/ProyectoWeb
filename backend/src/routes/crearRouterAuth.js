import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';

// Rutas públicas de autenticación: no pasan por el middleware de token
export default function crearRouterAuth(authService) {
    const router = Router();

    router.post('/registro', asyncHandler(async (req, res) => {
        const resultado = await authService.registrar(req.body);
        res.status(201).location(`/api/usuarios/${resultado.usuario.id}`).json(resultado);
    }));

    router.post('/login', asyncHandler(async (req, res) => {
        res.json(await authService.login(req.body));
    }));

    return router;
}
