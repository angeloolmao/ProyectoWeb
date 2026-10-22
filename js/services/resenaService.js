// Servicio con las reglas de negocio para reseñas de películas

export default class ResenaService {
    constructor(repository) {
        if (!repository) {
            throw new Error('ResenaService requiere un repositorio válido');
        }
        this.repository = repository;
    }

    async listar() {
        return await this.repository.listar();
    }

    async listarPorPelicula(peliculaId) {
        const todas = await this.listar();
        return todas.filter(r => Number(r.peliculaId) === Number(peliculaId));
    }

    async listarPorUsuario(usuarioId) {
        const todas = await this.listar();
        return todas.filter(r => Number(r.usuarioId) === Number(usuarioId));
    }

    async listarReportadas() {
        const todas = await this.listar();
        return todas.filter(r => r.reportada === true);
    }

    async crear(datos, usuarioActual) {
        if (!usuarioActual) {
            throw new Error('Debes iniciar sesión para publicar una reseña');
        }
        const texto = datos.texto ? datos.texto.trim() : '';
        if (texto.length < 5) {
            throw new Error('La reseña debe contener al menos 5 caracteres');
        }
        if (!datos.peliculaId) {
            throw new Error('Se requiere indicar la película');
        }

        const hoy = new Date().toISOString().slice(0, 10);
        return await this.repository.crear({
            peliculaId: Number(datos.peliculaId),
            usuarioId: usuarioActual.id,
            username: usuarioActual.username,
            texto,
            fecha: hoy,
            reportada: false
        });
    }

    async editar(id, cambios, usuarioActual) {
        if (!usuarioActual) {
            throw new Error('Debes iniciar sesión para editar tu reseña');
        }
        const existente = await this.repository.obtenerPorId(id);
        if (!existente) {
            throw new Error('La reseña no existe');
        }
        // Regla: solo el propietario puede modificar su reseña
        if (Number(existente.usuarioId) !== Number(usuarioActual.id)) {
            throw new Error('Solo el autor puede modificar su propia reseña');
        }

        const texto = cambios.texto ? cambios.texto.trim() : '';
        if (texto.length < 5) {
            throw new Error('La reseña debe contener al menos 5 caracteres');
        }

        return await this.repository.editar(id, { texto });
    }

    async eliminar(id, usuarioActual) {
        if (!usuarioActual) {
            throw new Error('Debes iniciar sesión para eliminar una reseña');
        }
        const existente = await this.repository.obtenerPorId(id);
        if (!existente) {
            throw new Error('La reseña no existe');
        }
        // Regla: solo el propietario o un administrador por moderación puede eliminarla
        const esPropietario = Number(existente.usuarioId) === Number(usuarioActual.id);
        const esAdmin = usuarioActual.role === 'admin';
        if (!esPropietario && !esAdmin) {
            throw new Error('Solo el propietario puede eliminar su propia reseña');
        }

        return await this.repository.eliminar(id);
    }

    async reportar(id) {
        const existente = await this.repository.obtenerPorId(id);
        if (!existente) {
            throw new Error('Reseña no encontrada');
        }
        return await this.repository.editar(id, { reportada: true });
    }

    async descartarReporte(id, usuarioActual) {
        if (!usuarioActual || usuarioActual.role !== 'admin') {
            throw new Error('Operación restringida a administradores');
        }
        return await this.repository.editar(id, { reportada: false });
    }
}
