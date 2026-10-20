// Contrato base para repositorios de datos
// Define las operaciones que cualquier fuente de datos debe implementar

export default class Repository {
    async listar() {
        throw new Error('Método listar() no implementado');
    }

    async obtenerPorId(id) {
        throw new Error('Método obtenerPorId(id) no implementado');
    }

    async crear(entidad) {
        throw new Error('Método crear(entidad) no implementado');
    }

    async editar(id, cambios) {
        throw new Error('Método editar(id, cambios) no implementado');
    }

    async eliminar(id) {
        throw new Error('Método eliminar(id) no implementado');
    }

    // Métodos alternativos en inglés
    async getAll() { return await this.listar(); }
    async getById(id) { return await this.obtenerPorId(id); }
    async create(entidad) { return await this.crear(entidad); }
    async update(id, cambios) { return await this.editar(id, cambios); }
    async delete(id) { return await this.eliminar(id); }
}
