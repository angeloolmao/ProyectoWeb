// Contrato asíncrono que deben cumplir todos los repositorios

export default class Repository {
    async listar() {
        throw new Error('Método listar() no implementado');
    }

    async obtenerPorId(id) {
        throw new Error('Método obtenerPorId(id) no implementado');
    }

    async crear(datos) {
        throw new Error('Método crear(datos) no implementado');
    }

    async editar(id, cambios) {
        throw new Error('Método editar(id, cambios) no implementado');
    }

    async reemplazar(id, datos) {
        throw new Error('Método reemplazar(id, datos) no implementado');
    }

    async eliminar(id) {
        throw new Error('Método eliminar(id) no implementado');
    }
}
