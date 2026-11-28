import AppError from '../errors/AppError.js';
import { validarId, validarCuerpo, numeroEnRango } from '../utils/validaciones.js';

const MAX_ID = Number.MAX_SAFE_INTEGER;

export default class CalificacionService {
    constructor(repository, peliculaService) {
        if (!repository || !peliculaService) {
            throw new Error('CalificacionService requiere un repositorio y un servicio de películas');
        }
        this.repository = repository;
        this.peliculaService = peliculaService;
    }

    // Regla de escala: el puntaje es un entero entre 1 y 5
    _puntaje(datos) {
        validarCuerpo(datos);
        if (datos.puntaje === undefined) {
            throw new AppError('El campo puntaje es obligatorio', 400);
        }
        return numeroEnRango(datos.puntaje, 'puntaje', 1, 5, true);
    }

    async _existente(id) {
        const calificacion = await this.repository.obtenerPorId(validarId(id));
        if (!calificacion) {
            throw new AppError('Calificación no encontrada', 404);
        }
        return calificacion;
    }

    // Regla de dueño: solo quien calificó modifica o borra su calificación
    async _propia(id, usuario) {
        const calificacion = await this._existente(id);
        if (Number(calificacion.usuarioId) !== Number(usuario.id)) {
            throw new AppError('Solo puedes modificar tus propias calificaciones', 403);
        }
        return calificacion;
    }

    // Todas las calificaciones son consultables: se usan para calcular promedios
    async listar() {
        return this.repository.listar();
    }

    async obtener(id) {
        return this._existente(id);
    }

    async crear(datos, usuario) {
        const puntaje = this._puntaje(datos);
        if (datos.peliculaId === undefined) {
            throw new AppError('El campo peliculaId es obligatorio', 400);
        }
        const peliculaId = numeroEnRango(datos.peliculaId, 'peliculaId', 1, MAX_ID, true);
        await this.peliculaService.verificarExisten([peliculaId]);

        if (await this.repository.obtenerPorPeliculaYUsuario(peliculaId, Number(usuario.id))) {
            throw new AppError('Ya calificaste esta película', 409);
        }
        return this.repository.crear({ peliculaId, usuarioId: Number(usuario.id), puntaje });
    }

    async reemplazar(id, datos, usuario) {
        const existente = await this._propia(id, usuario);
        const puntaje = this._puntaje(datos);
        if (datos.peliculaId === undefined || Number(datos.peliculaId) !== Number(existente.peliculaId)) {
            throw new AppError('No se puede cambiar la película de una calificación', 400);
        }
        return this.repository.reemplazar(Number(existente.id), {
            peliculaId: existente.peliculaId,
            usuarioId: existente.usuarioId,
            puntaje
        });
    }

    async actualizar(id, cambios, usuario) {
        const existente = await this._propia(id, usuario);
        const puntaje = this._puntaje(cambios);
        return this.repository.editar(Number(existente.id), { puntaje });
    }

    async eliminar(id, usuario) {
        const existente = await this._propia(id, usuario);
        await this.repository.eliminar(Number(existente.id));
    }
}
