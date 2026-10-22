// Controladores Alpine para autenticación, perfil, estadísticas y gestión de usuarios

export function navegacionSitioController(usuarioService) {
    return {
        menuAbierto: false,
        usuario: null,

        async init() {
            this.usuario = await usuarioService.obtenerUsuarioActual();
        },

        alternarMenu() {
            this.menuAbierto = !this.menuAbierto;
        },

        async salir() {
            await usuarioService.cerrarSesion();
            this.usuario = null;
            this.$dispatch('sesion-cambiada', { usuario: null });
            window.location.href = 'login.html';
        }
    };
}

export function loginController(usuarioService) {
    return {
        email: '',
        password: '',
        cargando: false,
        error: null,
        mensajeExito: '',
        usuarioActual: null,

        get vacio() {
            return !this.cargando && !this.usuarioActual;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No fue posible iniciar sesión.';
        },

        async init() {
            this.usuarioActual = await usuarioService.obtenerUsuarioActual();
        },

        async enviarLogin() {
            this.showLoading();
            this.mensajeExito = '';
            try {
                const usuario = await usuarioService.iniciarSesion(this.email, this.password);
                this.usuarioActual = usuario;
                this.cargando = false;
                this.mensajeExito = `Sesión iniciada como ${usuario.username}. Redirigiendo a tu perfil…`;
                this.$dispatch('sesion-cambiada', { usuario });
                window.location.href = 'perfil.html';
            } catch (err) {
                this.showError(err.message);
            }
        },

        async accesoRapidoDemo(correo) {
            this.email = correo;
            this.password = '123';
            await this.enviarLogin();
        }
    };
}

export function registroController(usuarioService) {
    return {
        username: '',
        email: '',
        password: '',
        cargando: false,
        error: null,
        mensajeExito: '',

        get vacio() {
            return !this.username && !this.email && !this.password;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No se pudo completar el registro.';
        },

        async enviarRegistro() {
            this.showLoading();
            this.mensajeExito = '';
            try {
                const nuevo = await usuarioService.registrar({
                    username: this.username,
                    name: this.username,
                    email: this.email,
                    password: this.password
                });
                this.cargando = false;
                this.mensajeExito = `Cuenta ${nuevo.username} creada con éxito.`;
                this.$dispatch('sesion-cambiada', { usuario: nuevo });
                window.location.href = 'perfil.html';
            } catch (err) {
                this.showError(err.message);
            }
        }
    };
}

export function cabeceraPerfilController(usuarioService) {
    return {
        usuario: null,
        usuariosDisponibles: [],
        editando: false,
        nombreForm: '',
        bioForm: '',
        cargando: true,
        error: null,
        mensaje: '',

        get vacio() {
            return !this.cargando && !this.error && !this.usuario;
        },

        get inicialesAvatar() {
            if (!this.usuario || !this.usuario.name) return 'US';
            return this.usuario.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(p => p[0])
                .join('')
                .toUpperCase();
        },

        get subtituloMiembro() {
            if (!this.usuario) return '';
            const rol = this.usuario.role === 'admin' ? ' · Administrador' : '';
            return `@${this.usuario.username} · Miembro desde ${this.usuario.memberSince || 2026}${rol}`;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No se pudo cargar el perfil.';
        },

        async init() {
            await this.cargarPerfil();
        },

        async cargarPerfil() {
            this.showLoading();
            try {
                this.usuariosDisponibles = await usuarioService.listar();
                this.usuario = await usuarioService.obtenerUsuarioActual();
                if (this.usuario) {
                    this.nombreForm = this.usuario.name;
                    this.bioForm = this.usuario.bio || '';
                }
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        abrirEdicion() {
            if (!this.usuario) return;
            this.nombreForm = this.usuario.name;
            this.bioForm = this.usuario.bio || '';
            this.editando = true;
            this.mensaje = '';
            this.error = null;
        },

        cancelarEdicion() {
            this.editando = false;
        },

        async guardarPerfil() {
            this.error = null;
            this.mensaje = '';
            try {
                this.usuario = await usuarioService.actualizarPerfil(this.usuario.id, {
                    name: this.nombreForm,
                    bio: this.bioForm
                });
                this.editando = false;
                this.mensaje = 'Perfil actualizado.';
                this.$dispatch('perfil-actualizado', { usuario: this.usuario });
            } catch (err) {
                this.error = err.message;
            }
        },

        async cambiarPerfilVista(id) {
            try {
                this.usuario = await usuarioService.cambiarUsuarioDemo(Number(id));
                this.nombreForm = this.usuario.name;
                this.bioForm = this.usuario.bio || '';
                this.$dispatch('perfil-actualizado', { usuario: this.usuario });
            } catch (err) {
                this.error = err.message;
            }
        }
    };
}

export function estadisticasPerfilController(usuarioService, estadisticaService) {
    return {
        tabActiva: 'vistas',
        estadisticas: {
            totalVistas: 0,
            totalResenas: 0,
            promedioCalificaciones: '0.0',
            totalListas: 0,
            peliculasVistas: [],
            resenas: [],
            listas: []
        },
        cargando: true,
        error: null,

        get vacioVistas() {
            return !this.cargando && !this.error && this.estadisticas.peliculasVistas.length === 0;
        },

        get vacioResenas() {
            return !this.cargando && !this.error && this.estadisticas.resenas.length === 0;
        },

        get vacioListas() {
            return !this.cargando && !this.error && this.estadisticas.listas.length === 0;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No se pudieron calcular las estadísticas.';
        },

        async init() {
            await this.cargarEstadisticas();
        },

        async cargarEstadisticas() {
            this.showLoading();
            try {
                const usuario = await usuarioService.obtenerUsuarioActual();
                this.estadisticas = await estadisticaService.obtenerEstadisticasUsuario(usuario);
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        cambiarTab(nombreTab) {
            this.tabActiva = nombreTab;
        },

        esTab(nombreTab) {
            return this.tabActiva === nombreTab;
        },

        urlDetalle(pelicula) {
            return `pelicula.html?id=${pelicula.id}`;
        },

        urlPeliculaId(peliculaId) {
            return `pelicula.html?id=${peliculaId}`;
        },

        formatearMeta(pelicula) {
            return `${pelicula.year} · ★ ${Number(pelicula.rating).toFixed(1)}`;
        }
    };
}

export function adminUsuariosController(usuarioService) {
    return {
        usuarios: [],
        usuarioActual: null,
        cargando: true,
        error: null,

        get vacio() {
            return !this.cargando && !this.error && this.usuarios.length === 0;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'Error al cargar usuarios.';
        },

        async init() {
            await this.cargarUsuarios();
        },

        async cargarUsuarios() {
            this.showLoading();
            try {
                this.usuarioActual = await usuarioService.obtenerUsuarioActual();
                this.usuarios = await usuarioService.listar();
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        async alternarEstado(usuario) {
            this.error = null;
            try {
                await usuarioService.alternarEstadoUsuario(this.usuarioActual, usuario.id);
                await this.cargarUsuarios();
            } catch (err) {
                this.error = err.message;
            }
        },

        textoEstado(usuario) {
            return usuario.active === false ? 'Suspendido' : 'Activo';
        },

        textoBotonEstado(usuario) {
            return usuario.active === false ? 'Reactivar' : 'Suspender';
        }
    };
}
