// Servicio con las reglas de negocio para calificaciones en escala de 1 a 5

export default class CalificacionService {
    constructor(repository) {
        if (!repository) {
            throw new Error('CalificacionService requiere un repositorio válido');
        }
        this.repository = repository;
    }

    async listar() {
        return await this.repository.listar();
    }

    async listarPorPelicula(peliculaId) {
        const todas = await this.listar();
        return todas.filter(c => Number(c.peliculaId) === Number(peliculaId));
    }

    async listarPorUsuario(usuarioId) {
        const todas = await this.listar();
        return todas.filter(c => Number(c.usuarioId) === Number(usuarioId));
    }

    async obtenerDeUsuario(peliculaId, usuarioId) {
        if (!usuarioId) return null;
        const delFilme = await this.listarPorPelicula(peliculaId);
        return delFilme.find(c => Number(c.usuarioId) === Number(usuarioId)) || null;
    }

    async calificar(peliculaId, puntaje, usuarioActual) {
        if (!usuarioActual) {
            throw new Error('Debes iniciar sesión para calificar películas');
        }
        const valor = Number(puntaje);
        // Regla: las calificaciones deben encontrarse dentro de la escala definida (1 a 5)
        if (isNaN(valor) || valor < 1 || valor > 5) {
            throw new Error('La calificación debe estar en la escala de 1 a 5 estrellas');
        }

        const existente = await this.obtenerDeUsuario(peliculaId, usuarioActual.id);
        if (existente) {
            return await this.repository.editar(existente.id, { puntaje: valor });
        }

        return await this.repository.crear({
            peliculaId: Number(peliculaId),
            usuarioId: usuarioActual.id,
            puntaje: valor
        });
    }

    async eliminarCalificacion(peliculaId, usuarioActual) {
        if (!usuarioActual) {
            throw new Error('Debes iniciar sesión');
        }
        const existente = await this.obtenerDeUsuario(peliculaId, usuarioActual.id);
        if (!existente) {
            return false;
        }
        return await this.repository.eliminar(existente.id);
    }

    async calcularPromedioPelicula(peliculaId, ratingBase = 0) {
        const delFilme = await this.listarPorPelicula(peliculaId);
        if (delFilme.length === 0) {
            return Number(ratingBase || 0).toFixed(1);
        }
        const suma = delFilme.reduce((acc, c) => acc + Number(c.puntaje), 0);
        return (suma / delFilme.length).toFixed(1);
    }
}
