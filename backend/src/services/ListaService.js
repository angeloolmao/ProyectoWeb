import AppError from '../errors/AppError.js';
import {
    validarId,
    validarCuerpo,
    textoObligatorio,
    textoOpcional,
    listaDeIds
} from '../utils/validaciones.js';

const REGLAS = {
    nombre: v => textoObligatorio(v, 'nombre', 50, 2),
    descripcion: v => textoOpcional(v, 'descripcion', 200),
    peliculaIds: v => listaDeIds(v, 'peliculaIds')
};

export default class ListaService {
    constructor(repository, peliculaService) {
        if (!repository || !peliculaService) {
            throw new Error('ListaService requiere un repositorio y un servicio de películas');
        }
        this.repository = repository;
        this.peliculaService = peliculaService;
    }

    _procesar(datos, completo) {
        validarCuerpo(datos);
        const limpio = {};
        for (const campo of Object.keys(REGLAS)) {
            if (datos[campo] !== undefined) {
                limpio[campo] = REGLAS[campo](datos[campo]);
            } else if (completo && campo === 'nombre') {
                throw new AppError('El campo nombre es obligatorio', 400);
            }
        }
        if (Object.keys(limpio).length === 0) {
            throw new AppError('El cuerpo de la petición no contiene campos válidos', 400);
        }
        return completo ? { descripcion: '', peliculaIds: [], ...limpio } : limpio;
    }

    // Regla de dueño: cada lista pertenece a un usuario y solo él accede a ella
    async _propia(id, usuario) {
        const lista = await this.repository.obtenerPorId(validarId(id));
        if (!lista) {
            throw new AppError('Lista no encontrada', 404);
        }
        if (Number(lista.usuarioId) !== Number(usuario.id)) {
            throw new AppError('No puedes acceder a una lista de otro usuario', 403);
        }
        return lista;
    }

    // Solo devuelve las listas del usuario autenticado
    async listar(usuario) {
        return this.repository.listarPorUsuario(Number(usuario.id));
    }

    async obtener(id, usuario) {
        return this._propia(id, usuario);
    }

    async crear(datos, usuario) {
        const nueva = this._procesar(datos, true);
        await this.peliculaService.verificarExisten(nueva.peliculaIds);
        return this.repository.crear({ ...nueva, usuarioId: Number(usuario.id) });
    }

    async reemplazar(id, datos, usuario) {
        const existente = await this._propia(id, usuario);
        const completa = this._procesar(datos, true);
        await this.peliculaService.verificarExisten(completa.peliculaIds);
        return this.repository.reemplazar(Number(existente.id), {
            ...completa,
            usuarioId: existente.usuarioId
        });
    }

    async actualizar(id, cambios, usuario) {
        const existente = await this._propia(id, usuario);
        const limpio = this._procesar(cambios, false);
        if (limpio.peliculaIds) {
            await this.peliculaService.verificarExisten(limpio.peliculaIds);
        }
        return this.repository.editar(Number(existente.id), limpio);
    }

    async eliminar(id, usuario) {
        const existente = await this._propia(id, usuario);
        await this.repository.eliminar(Number(existente.id));
    }
}
