import AppError from '../errors/AppError.js';

// Verifica el encabezado Authorization: Bearer y deja el usuario en req.usuario
export default function crearAutenticador(authService) {
    return async (req, res, next) => {
        try {
            const [esquema, token] = (req.headers.authorization || '').split(' ');
            if (esquema !== 'Bearer' || !token) {
                throw new AppError('Se requiere un token de autenticación', 401);
            }
            req.usuario = await authService.verificarToken(token);
            next();
        } catch (err) {
            next(err);
        }
    };
}
