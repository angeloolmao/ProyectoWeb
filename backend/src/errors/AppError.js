// Clase base de error de aplicación con código HTTP asociado

export default class AppError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}
