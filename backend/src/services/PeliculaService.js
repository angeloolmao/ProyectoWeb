import AppError from '../errors/AppError.js';
import {
    validarId,
    validarCuerpo,
    textoObligatorio,
    textoOpcional,
    numeroEnRango
} from '../utils/validaciones.js';

const ANIO_MAXIMO = () => new Date().getFullYear() + 2;

// Una regla de validación por campo de la película
const REGLAS = {
    title: v => textoObligatorio(v, 'title', 150),
    year: v => numeroEnRango(v, 'year', 1888, ANIO_MAXIMO(), true),
    genre: v => textoObligatorio(v, 'genre', 50),
    duration: v => numeroEnRango(v, 'duration', 1, 1000, true),
    rating: v => numeroEnRango(v, 'rating', 1, 5),
    synopsis: v => textoOpcional(v, 'synopsis', 2000),
    posterUrl: v => textoOpcional(v, 'posterUrl', 300)
};

const OBLIGATORIOS = ['title', 'year', 'genre', 'rating'];
const POR_DEFECTO = { duration: 120, synopsis: '', posterUrl: 'img/posters/el-padrino.jpg' };

export default class PeliculaService {
    constructor(repository) {
        if (!repository) {
            throw new Error('PeliculaService requiere un repositorio válido');
        }
        this.repository = repository;
    }

    // Valida el cuerpo; si es completo exige los campos obligatorios y completa los opcionales
    _procesar(datos, completo) {
        validarCuerpo(datos);
        const limpio = {};
        for (const campo of Object.keys(REGLAS)) {
            if (datos[campo] !== undefined) {
                limpio[campo] = REGLAS[campo](datos[campo]);
            } else if (completo && OBLIGATORIOS.includes(campo)) {
                throw new AppError(`El campo ${campo} es obligatorio`, 400);
            }
        }
        if (Object.keys(limpio).length === 0) {
            throw new AppError('El cuerpo de la petición no contiene campos válidos', 400);
        }
        return completo ? { ...POR_DEFECTO, ...limpio } : limpio;
    }

    async listar() {
        return this.repository.listar();
    }

    async obtener(id) {
        const pelicula = await this.repository.obtenerPorId(validarId(id));
        if (!pelicula) {
            throw new AppError('Película no encontrada', 404);
        }
        return pelicula;
    }

    async crear(datos) {
        return this.repository.crear(this._procesar(datos, true));
    }

    async reemplazar(id, datos) {
        const idNumerico = validarId(id);
        const pelicula = await this.repository.reemplazar(idNumerico, this._procesar(datos, true));
        if (!pelicula) {
            throw new AppError('Película no encontrada', 404);
        }
        return pelicula;
    }

    async actualizar(id, cambios) {
        const idNumerico = validarId(id);
        const pelicula = await this.repository.editar(idNumerico, this._procesar(cambios, false));
        if (!pelicula) {
            throw new AppError('Película no encontrada', 404);
        }
        return pelicula;
    }

    async eliminar(id) {
        const eliminada = await this.repository.eliminar(validarId(id));
        if (!eliminada) {
            throw new AppError('Película no encontrada', 404);
        }
    }
}
