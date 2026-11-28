import Repository from './Repository.js';

const CLAVE_TOKEN = 'pw_token';

// Adaptador HTTP del contrato Repository usando rutas relativas /api/...
export default class ApiRepository extends Repository {
    constructor(baseUrl) {
        super();
        this.baseUrl = baseUrl;
    }

    static guardarToken(token) {
        if (token) {
            localStorage.setItem(CLAVE_TOKEN, token);
        }
    }

    static obtenerToken() {
        return localStorage.getItem(CLAVE_TOKEN);
    }

    static limpiarToken() {
        localStorage.removeItem(CLAVE_TOKEN);
    }

    async _peticion(url, opciones = {}) {
        const headers = { ...(opciones.headers || {}) };
        const token = ApiRepository.obtenerToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        if (opciones.body !== undefined) {
            headers['Content-Type'] = 'application/json';
        }

        const respuesta = await fetch(url, { ...opciones, headers });
        if (respuesta.status === 204) {
            return null;
        }

        let datos = null;
        const tipo = respuesta.headers.get('content-type') || '';
        if (tipo.includes('application/json')) {
            datos = await respuesta.json();
        }

        if (!respuesta.ok) {
            if (respuesta.status === 401 && token) {
                ApiRepository.limpiarToken();
            }
            const mensaje = (datos && datos.error) || `Error HTTP ${respuesta.status}`;
            throw new Error(mensaje);
        }

        return datos;
    }

    async listar() {
        return this._peticion(this.baseUrl);
    }

    async obtenerPorId(id) {
        try {
            return await this._peticion(`${this.baseUrl}/${id}`);
        } catch (err) {
            if (err.message.includes('no encontrad')) {
                return null;
            }
            throw err;
        }
    }

    async crear(entidad) {
        return this._peticion(this.baseUrl, {
            method: 'POST',
            body: JSON.stringify(entidad)
        });
    }

    async editar(id, cambios) {
        return this._peticion(`${this.baseUrl}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(cambios)
        });
    }

    async eliminar(id) {
        await this._peticion(`${this.baseUrl}/${id}`, { method: 'DELETE' });
        return true;
    }

    async autenticar(ruta, credenciales) {
        const resultado = await this._peticion(ruta, {
            method: 'POST',
            body: JSON.stringify(credenciales)
        });
        if (resultado && resultado.token) {
            ApiRepository.guardarToken(resultado.token);
        }
        return resultado ? resultado.usuario : null;
    }

    tieneToken() {
        return Boolean(ApiRepository.obtenerToken());
    }

    limpiarToken() {
        ApiRepository.limpiarToken();
    }
}
