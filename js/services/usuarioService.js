// Servicio con las reglas de negocio para usuarios, perfiles y sesión activa

export default class UsuarioService {
    constructor(usuarioRepository, sesionRepository) {
        if (!usuarioRepository || !sesionRepository) {
            throw new Error('UsuarioService requiere repositorios de usuarios y sesión');
        }
        this.usuarioRepository = usuarioRepository;
        this.sesionRepository = sesionRepository;
    }

    async listar() {
        return await this.usuarioRepository.listar();
    }

    async obtenerPorId(id) {
        if (id == null) return null;
        return await this.usuarioRepository.obtenerPorId(id);
    }

    async obtenerUsuarioActual() {
        const sesiones = await this.sesionRepository.listar();
        if (!sesiones || sesiones.length === 0 || !sesiones[0].usuarioId) {
            return null;
        }
        return await this.obtenerPorId(sesiones[0].usuarioId);
    }

    async iniciarSesion(email, password) {
        if (!email || !password) {
            throw new Error('Debes ingresar correo y contraseña');
        }
        const usuarios = await this.listar();
        const correoLimpio = email.trim().toLowerCase();
        const encontrado = usuarios.find(
            u => u.email.toLowerCase() === correoLimpio && u.password === password
        );

        if (!encontrado) {
            throw new Error('Credenciales incorrectas');
        }
        if (encontrado.active === false) {
            throw new Error('Esta cuenta se encuentra suspendida');
        }

        await this._guardarSesion(encontrado.id);
        return encontrado;
    }

    async registrar(datos) {
        const username = datos.username ? datos.username.trim() : '';
        const email = datos.email ? datos.email.trim().toLowerCase() : '';
        const password = datos.password || '';
        const name = datos.name ? datos.name.trim() : username;

        if (username.length < 3) {
            throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
        }
        if (!email.includes('@')) {
            throw new Error('Ingresa un correo electrónico válido');
        }
        if (password.length < 3) {
            throw new Error('La contraseña debe tener al menos 3 caracteres');
        }

        const usuarios = await this.listar();
        if (usuarios.some(u => u.email.toLowerCase() === email)) {
            throw new Error('Ya existe una cuenta con ese correo');
        }
        if (usuarios.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            throw new Error('Ese nombre de usuario ya está en uso');
        }

        const nuevo = await this.usuarioRepository.crear({
            username,
            name,
            email,
            password,
            role: 'user',
            active: true,
            memberSince: new Date().getFullYear(),
            bio: 'Nuevo miembro de ProyectoWeb.',
            watchedIds: []
        });

        await this._guardarSesion(nuevo.id);
        return nuevo;
    }

    async cerrarSesion() {
        const sesiones = await this.sesionRepository.listar();
        for (const s of sesiones) {
            await this.sesionRepository.eliminar(s.id);
        }
    }

    async cambiarUsuarioDemo(usuarioId) {
        const usuario = await this.obtenerPorId(usuarioId);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        await this._guardarSesion(usuario.id);
        return usuario;
    }

    async actualizarPerfil(usuarioId, cambios) {
        const nombre = cambios.name ? cambios.name.trim() : '';
        if (!nombre) {
            throw new Error('El nombre visible no puede estar vacío');
        }
        const bio = cambios.bio !== undefined ? cambios.bio.trim() : '';
        return await this.usuarioRepository.editar(usuarioId, { name: nombre, bio });
    }

    async alternarPeliculaVista(usuarioId, peliculaId) {
        const usuario = await this.obtenerPorId(usuarioId);
        if (!usuario) {
            throw new Error('Debes iniciar sesión para registrar películas vistas');
        }
        const idNum = Number(peliculaId);
        const vistasActuales = Array.isArray(usuario.watchedIds) ? [...usuario.watchedIds] : [];
        const indice = vistasActuales.indexOf(idNum);

        if (indice >= 0) {
            vistasActuales.splice(indice, 1);
        } else {
            vistasActuales.push(idNum);
        }

        return await this.usuarioRepository.editar(usuario.id, { watchedIds: vistasActuales });
    }

    async alternarEstadoUsuario(adminActual, usuarioObjetivoId) {
        if (!adminActual || adminActual.role !== 'admin') {
            throw new Error('Operación restringida a administradores');
        }
        const objetivo = await this.obtenerPorId(usuarioObjetivoId);
        if (!objetivo) {
            throw new Error('Usuario no encontrado');
        }
        const nuevoEstado = objetivo.active === false ? true : false;
        return await this.usuarioRepository.editar(objetivo.id, { active: nuevoEstado });
    }

    async _guardarSesion(usuarioId) {
        const sesiones = await this.sesionRepository.listar();
        if (sesiones.length > 0) {
            await this.sesionRepository.editar(sesiones[0].id, { usuarioId });
        } else {
            await this.sesionRepository.crear({ id: 1, usuarioId });
        }
    }
}
