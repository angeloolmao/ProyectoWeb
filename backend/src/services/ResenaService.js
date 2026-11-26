import AppError from '../errors/AppError.js';
import {
    validarId,
    validarCuerpo,
    textoObligatorio,
    numeroEnRango,
    booleano,
    fechaIso
} from '../utils/validaciones.js';

// Una regla de validación por campo de la reseña
const REGLAS = {
    peliculaId: v => numeroEnRango(v, 'peliculaId', 1, Number.MAX_SAFE_INTEGER, true),
    usuarioId: v => numeroEnRango(v, 'usuarioId', 1, Number.MAX_SAFE_INTEGER, true),
    username: v => textoObligatorio(v, 'username', 50),
    texto: v => textoObligatorio(v, 'texto', 1000, 5),
    fecha: v => fechaIso(v, 'fecha'),
    reportada: v => booleano(v, 'reportada')
};

const OBLIGATORIOS = ['peliculaId', 'usuarioId', 'username', 'texto'];
// Campos que se pueden modificar parcialmente
const EDITABLES = ['texto', 'reportada'];

const hoy = () => new Date().toISOString().slice(0, 10);

export default class ResenaService {
    constructor(repository, peliculaService) {
        if (!repository || !peliculaService) {
            throw new Error('ResenaService requiere un repositorio y un servicio de películas');
        }
        this.repository = repository;
        this.peliculaService = peliculaService;
    }

    _procesar(datos, completo) {
        validarCuerpo(datos);
        const campos = completo ? Object.keys(REGLAS) : EDITABLES;
        const limpio = {};
        for (const campo of campos) {
            if (datos[campo] !== undefined) {
                limpio[campo] = REGLAS[campo](datos[campo]);
            } else if (completo && OBLIGATORIOS.includes(campo)) {
                throw new AppError(`El campo ${campo} es obligatorio`, 400);
            }
        }
        if (Object.keys(limpio).length === 0) {
            throw new AppError('El cuerpo de la petición no contiene campos válidos', 400);
        }
        return completo ? { fecha: hoy(), reportada: false, ...limpio } : limpio;
    }

    // La reseña debe referirse a una película existente
    async _verificarPelicula(peliculaId) {
        try {
            await this.peliculaService.obtener(peliculaId);
        } catch (err) {
            if (err.status === 404) {
                throw new AppError('La película indicada no existe', 400);
            }
            throw err;
        }
    }

    async listar() {
        return this.repository.listar();
    }

    async obtener(id) {
        const resena = await this.repository.obtenerPorId(validarId(id));
        if (!resena) {
            throw new AppError('Reseña no encontrada', 404);
        }
        return resena;
    }

    async crear(datos) {
        const nueva = this._procesar(datos, true);
        await this._verificarPelicula(nueva.peliculaId);
        return this.repository.crear(nueva);
    }

    async reemplazar(id, datos) {
        const idNumerico = validarId(id);
        const completa = this._procesar(datos, true);
        await this._verificarPelicula(completa.peliculaId);
        const resena = await this.repository.reemplazar(idNumerico, completa);
        if (!resena) {
            throw new AppError('Reseña no encontrada', 404);
        }
        return resena;
    }

    async actualizar(id, cambios) {
        const idNumerico = validarId(id);
        const resena = await this.repository.editar(idNumerico, this._procesar(cambios, false));
        if (!resena) {
            throw new AppError('Reseña no encontrada', 404);
        }
        return resena;
    }

    async eliminar(id) {
        const eliminada = await this.repository.eliminar(validarId(id));
        if (!eliminada) {
            throw new AppError('Reseña no encontrada', 404);
        }
    }
}
