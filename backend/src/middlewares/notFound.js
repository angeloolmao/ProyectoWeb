// Middleware para rutas no encontradas (404)

export default function notFound(req, res) {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}
