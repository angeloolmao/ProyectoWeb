// Middleware propio de registro de peticiones HTTP

export default function logger(req, res, next) {
    const fecha = new Date().toISOString();
    console.log(`[${fecha}] ${req.method} ${req.originalUrl}`);
    next();
}
