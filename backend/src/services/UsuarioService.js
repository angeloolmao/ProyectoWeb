import AppError from '../errors/AppError.js';
import {
    validarId,
    validarCuerpo,
    textoObligatorio,
    textoOpcional,
    booleano,
    listaDeIds
} from '../utils/validaciones.js';

const CAMPOS_PERFIL = ['name', 'bio', 'watchedIds'];
const CAMPOS_EDITABLES = [...CAMPOS_PERFIL, 'active'];

export default class UsuarioService {
    constructor(repository, peliculaService) {
        if (!repository || !peliculaService) {
            throw new Error('UsuarioService requiere un repositorio y un servicio de películas');
        }
        this.repository = repository;
        this.peliculaService = peliculaService;
    }

    // El correo solo lo ven el propio usuario y los administradores
    _vista(usuario, solicitante) {
        const esPropio = Number(usuario.id) === Number(solicitante.id);
        if (esPropio || solicitante.role === 'admin') {
            return usuario;
        }
        const { email, ...publico } = usuario;
        return publico;
    }

    async listar(solicitante) {
        const usuarios = await this.repository.listar();
        return usuarios.map(usuario => this._vista(usuario, solicitante));
    }

    async obtener(id, solicitante) {
        const usuario = await this.repository.obtenerPorId(validarId(id));
        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404);
        }
        return this._vista(usuario, solicitante);
    }

    async actualizar(id, cambios, solicitante) {
        const idNumerico = validarId(id);
        validarCuerpo(cambios);
        const enviados = CAMPOS_EDITABLES.filter(campo => cambios[campo] !== undefined);
        if (enviados.length === 0) {
            throw new AppError('El cuerpo de la petición no contiene campos válidos', 400);
        }
        if (!(await this.repository.obtenerPorId(idNumerico))) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Permisos: el perfil es del propio usuario; el estado de la cuenta, del administrador
        const esPropio = Number(solicitante.id) === idNumerico;
        if (enviados.some(campo => CAMPOS_PERFIL.includes(campo)) && !esPropio) {
            throw new AppError('Solo puedes modificar tu propio perfil', 403);
        }
        if (enviados.includes('active') && solicitante.role !== 'admin') {
            throw new AppError('Operación restringida a administradores', 403);
        }

        const limpio = {};
        if (cambios.name !== undefined) limpio.name = textoObligatorio(cambios.name, 'name', 60);
        if (cambios.bio !== undefined) limpio.bio = textoOpcional(cambios.bio, 'bio', 300);
        if (cambios.active !== undefined) limpio.active = booleano(cambios.active, 'active');
        if (cambios.watchedIds !== undefined) {
            limpio.watchedIds = listaDeIds(cambios.watchedIds, 'watchedIds');
            await this.peliculaService.verificarExisten(limpio.watchedIds);
        }
        return this.repository.editar(idNumerico, limpio);
    }
}
