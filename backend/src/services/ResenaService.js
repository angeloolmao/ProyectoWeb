import AppError from '../errors/AppError.js';
import {
    validarId,
    validarCuerpo,
    textoObligatorio,
    numeroEnRango,
    booleano
} from '../utils/validaciones.js';

// El autor, el usuario y la fecha salen del token y del servidor, no del cuerpo
const REGLAS = {
    peliculaId: v => numeroEnRango(v, 'peliculaId', 1, Number.MAX_SAFE_INTEGER, true),
    texto: v => textoObligatorio(v, 'texto', 1000, 5),
    reportada: v => booleano(v, 'reportada')
};

const OBLIGATORIOS = ['peliculaId', 'texto'];
const EDITABLES = ['texto', 'reportada'];

const hoy = () => new Date().toISOString().slice(0, 10);
const esAutor = (resena, usuario) => Number(resena.usuarioId) === Number(usuario.id);

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
        return limpio;
    }

    async _existente(id) {
        const resena = await this.repository.obtenerPorId(validarId(id));
        if (!resena) {
            throw new AppError('Reseña no encontrada', 404);
        }
        return resena;
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
        return this._existente(id);
    }

    async crear(datos, usuario) {
        const nueva = this._procesar(datos, true);
        await this._verificarPelicula(nueva.peliculaId);
        return this.repository.crear({
            peliculaId: nueva.peliculaId,
            texto: nueva.texto,
            usuarioId: Number(usuario.id),
            username: usuario.username,
            fecha: hoy(),
            reportada: false
        });
    }

    // Regla de dueño: solo el autor reemplaza el contenido de su reseña
    async reemplazar(id, datos, usuario) {
        const existente = await this._existente(id);
        if (!esAutor(existente, usuario)) {
            throw new AppError('Solo el autor puede modificar su propia reseña', 403);
        }
        const completa = this._procesar(datos, true);
        await this._verificarPelicula(completa.peliculaId);
        return this.repository.reemplazar(Number(existente.id), {
            peliculaId: completa.peliculaId,
            texto: completa.texto,
            reportada: completa.reportada ?? existente.reportada,
            usuarioId: existente.usuarioId,
            username: existente.username,
            fecha: existente.fecha
        });
    }

    async actualizar(id, cambios, usuario) {
        const existente = await this._existente(id);
        const limpio = this._procesar(cambios, false);
        // El texto solo lo cambia el autor; cualquiera puede reportar, solo un admin descarta
        if (limpio.texto !== undefined && !esAutor(existente, usuario)) {
            throw new AppError('Solo el autor puede modificar su propia reseña', 403);
        }
        if (limpio.reportada === false && usuario.role !== 'admin') {
            throw new AppError('Operación restringida a administradores', 403);
        }
        return this.repository.editar(Number(existente.id), limpio);
    }

    // Elimina el autor o un administrador por moderación
    async eliminar(id, usuario) {
        const existente = await this._existente(id);
        if (!esAutor(existente, usuario) && usuario.role !== 'admin') {
            throw new AppError('Solo el autor puede eliminar su propia reseña', 403);
        }
        await this.repository.eliminar(Number(existente.id));
    }
}
