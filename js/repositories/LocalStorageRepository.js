import Repository from './Repository.js';

// Implementación del repositorio usando el almacenamiento local del navegador
export default class LocalStorageRepository extends Repository {
    constructor(storageKey, defaultData = []) {
        super();
        this.storageKey = storageKey;
        
        // Si no existen datos previos, se cargan los iniciales
        if (localStorage.getItem(this.storageKey) === null && Array.isArray(defaultData) && defaultData.length > 0) {
            this._saveData(defaultData);
        }
    }

    _loadData() {
        const json = localStorage.getItem(this.storageKey);
        if (!json) return [];
        try {
            return JSON.parse(json);
        } catch (e) {
            return [];
        }
    }

    _saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    async listar() {
        return Promise.resolve(this._loadData());
    }

    async obtenerPorId(id) {
        const items = this._loadData();
        const encontrado = items.find(item => item.id == id);
        return Promise.resolve(encontrado || null);
    }

    async crear(entidad) {
        const items = this._loadData();
        // Generar id secuencial si no viene definido
        if (entidad.id == null) {
            const maxId = items.reduce((max, item) => (item.id > max ? item.id : max), 0);
            entidad.id = maxId + 1;
        }
        items.push(entidad);
        this._saveData(items);
        return Promise.resolve(entidad);
    }

    async editar(id, cambios) {
        const items = this._loadData();
        const index = items.findIndex(item => item.id == id);
        if (index === -1) {
            throw new Error(`Elemento con id ${id} no encontrado`);
        }
        items[index] = { ...items[index], ...cambios, id: items[index].id };
        this._saveData(items);
        return Promise.resolve(items[index]);
    }

    async eliminar(id) {
        let items = this._loadData();
        const longitudPrevia = items.length;
        items = items.filter(item => item.id != id);
        if (items.length === longitudPrevia) {
            return Promise.resolve(false);
        }
        this._saveData(items);
        return Promise.resolve(true);
    }
}
