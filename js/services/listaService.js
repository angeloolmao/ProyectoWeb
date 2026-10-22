// Servicio con las reglas de negocio para listas personales de películas

export default class ListaService {
    constructor(repository) {
        if (!repository) {
            throw new Error('ListaService requiere un repositorio válido');
        }
        this.repository = repository;
    }

    async listar() {
        return await this.repository.listar();
    }

    async listarPorUsuario(usuarioId) {
        if (!usuarioId) return [];
        const todas = await this.listar();
        return todas.filter(l => Number(l.usuarioId) === Number(usuarioId));
    }

    async crear(datos, usuarioActual) {
        // Regla: cada lista debe pertenecer a un usuario
        if (!usuarioActual || !usuarioActual.id) {
            throw new Error('La lista debe pertenecer a un usuario autenticado');
        }
        const nombre = datos.nombre ? datos.nombre.trim() : '';
        if (nombre.length < 2) {
            throw new Error('El nombre de la lista debe tener al menos 2 caracteres');
        }
        const descripcion = datos.descripcion ? datos.descripcion.trim() : '';

        return await this.repository.crear({
            usuarioId: usuarioActual.id,
            nombre,
            descripcion,
            peliculaIds: []
        });
    }

    async editar(id, cambios, usuarioActual) {
        const lista = await this.repository.obtenerPorId(id);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }
        if (!usuarioActual || Number(lista.usuarioId) !== Number(usuarioActual.id)) {
            throw new Error('Solo el propietario de la lista puede modificarla');
        }
        const nombre = cambios.nombre !== undefined ? cambios.nombre.trim() : lista.nombre;
        if (nombre.length < 2) {
            throw new Error('El nombre de la lista no puede quedar vacío');
        }
        const descripcion = cambios.descripcion !== undefined ? cambios.descripcion.trim() : (lista.descripcion || '');
        return await this.repository.editar(id, { nombre, descripcion });
    }

    async eliminar(id, usuarioActual) {
        const lista = await this.repository.obtenerPorId(id);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }
        if (!usuarioActual || Number(lista.usuarioId) !== Number(usuarioActual.id)) {
            throw new Error('Solo el propietario de la lista puede eliminarla');
        }
        return await this.repository.eliminar(id);
    }

    async agregarPelicula(listaId, peliculaId, usuarioActual) {
        const lista = await this.repository.obtenerPorId(listaId);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }
        if (!usuarioActual || Number(lista.usuarioId) !== Number(usuarioActual.id)) {
            throw new Error('Solo puedes modificar tus propias listas');
        }

        const idPeliculaNum = Number(peliculaId);
        const actuales = Array.isArray(lista.peliculaIds) ? [...lista.peliculaIds] : [];

        // Regla: una película no puede aparecer repetida dentro de una misma lista
        if (actuales.includes(idPeliculaNum)) {
            throw new Error('Esta película ya se encuentra en la lista seleccionada');
        }

        actuales.push(idPeliculaNum);
        return await this.repository.editar(lista.id, { peliculaIds: actuales });
    }

    async quitarPelicula(listaId, peliculaId, usuarioActual) {
        const lista = await this.repository.obtenerPorId(listaId);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }
        if (!usuarioActual || Number(lista.usuarioId) !== Number(usuarioActual.id)) {
            throw new Error('Solo puedes modificar tus propias listas');
        }

        const idPeliculaNum = Number(peliculaId);
        const actuales = Array.isArray(lista.peliculaIds)
            ? lista.peliculaIds.filter(id => Number(id) !== idPeliculaNum)
            : [];

        return await this.repository.editar(lista.id, { peliculaIds: actuales });
    }
}
