// Manejador centralizado de errores (cuatro parámetros al final de la pila)

export default function errorHandler(err, req, res, next) {
    console.error('[ERROR]', err.name, err.message);

    // JSON mal formado enviado por el cliente
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'JSON mal formado en el cuerpo de la petición' });
    }

    // Errores de validación de Mongoose
    if (err.name === 'ValidationError') {
        const mensajes = Object.values(err.errors || {}).map(e => e.message);
        return res.status(400).json({ error: mensajes.join('. ') || 'Datos inválidos' });
    }

    // ID o tipo inválido en Mongoose
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Formato de identificador o dato inválido' });
    }

    // Índice único duplicado en MongoDB
    if (err.code === 11000) {
        const campo = Object.keys(err.keyPattern || {})[0] || 'campo';
        return res.status(409).json({ error: `Ya existe un registro con ese ${campo}` });
    }

    // Errores de negocio lanzados por los servicios
    if (err.status) {
        return res.status(err.status).json({ error: err.message });
    }

    // Error inesperado: sin stack ni detalles internos
    return res.status(500).json({ error: 'Error interno del servidor' });
}
