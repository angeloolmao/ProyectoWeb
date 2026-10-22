// Controladores Alpine para el dominio de películas (catálogo, detalle y administración)

function obtenerIdPeliculaUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    return !isNaN(id) && id > 0 ? id : 1;
}

export function buscadorPeliculasController() {
    return {
        termino: '',
        genero: 'Todos',

        emitirBusqueda() {
            this.$dispatch('filtrar-catalogo', {
                termino: this.termino,
                genero: this.genero
            });
        },

        limpiarBusqueda() {
            this.termino = '';
            this.genero = 'Todos';
            this.emitirBusqueda();
        }
    };
}

export function catalogoPeliculasController(peliculaService) {
    return {
        peliculas: [],
        peliculasFiltradas: [],
        terminoActual: '',
        generoActual: 'Todos',
        cargando: true,
        error: null,

        get vacio() {
            return !this.cargando && !this.error && this.peliculasFiltradas.length === 0;
        },

        get textoContador() {
            const total = this.peliculasFiltradas.length;
            return `${total} ${total === 1 ? 'película' : 'películas'}`;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No se pudo cargar el catálogo de películas.';
        },

        async init() {
            await this.cargarPeliculas();
        },

        async cargarPeliculas() {
            this.showLoading();
            try {
                this.peliculas = await peliculaService.listar();
                this.aplicarFiltroLocal();
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        filtrar(detalle) {
            if (detalle) {
                this.terminoActual = detalle.termino || '';
                this.generoActual = detalle.genero || 'Todos';
            }
            this.aplicarFiltroLocal();
        },

        aplicarFiltroLocal() {
            const q = this.terminoActual.trim().toLowerCase();
            this.peliculasFiltradas = this.peliculas.filter(p => {
                const coincideTitulo = !q || p.title.toLowerCase().includes(q);
                const coincideGenero = this.generoActual === 'Todos' || p.genre.toLowerCase() === this.generoActual.toLowerCase();
                return coincideTitulo && coincideGenero;
            });
        },

        urlDetalle(pelicula) {
            return `pelicula.html?id=${pelicula.id}`;
        },

        formatearMeta(pelicula) {
            return `${pelicula.year} · ${pelicula.genre}`;
        },

        formatearRating(pelicula) {
            return `★ ${Number(pelicula.rating).toFixed(1)}`;
        }
    };
}

export function detallePeliculaController(peliculaService, usuarioService, listaService) {
    return {
        peliculaId: obtenerIdPeliculaUrl(),
        pelicula: null,
        usuario: null,
        listasUsuario: [],
        listaSeleccionadaId: '',
        selectorListaAbierto: false,
        mensajeAccion: '',
        cargando: true,
        error: null,

        get vacio() {
            return !this.cargando && !this.error && !this.pelicula;
        },

        get estaVista() {
            if (!this.usuario || !Array.isArray(this.usuario.watchedIds) || !this.pelicula) {
                return false;
            }
            return this.usuario.watchedIds.includes(Number(this.pelicula.id));
        },

        get textoBotonVista() {
            return this.estaVista ? '✓ Vista registrada' : 'Marcar como vista';
        },

        get etiquetaPelicula() {
            if (!this.pelicula) return '';
            const duracion = this.pelicula.duration || 120;
            return `${this.pelicula.genre} · ${this.pelicula.year} · ${duracion} min`;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No se pudo cargar la película.';
        },

        async init() {
            await this.cargarDetalle();
        },

        async cargarDetalle() {
            this.showLoading();
            try {
                this.pelicula = await peliculaService.obtenerPorId(this.peliculaId);
                if (!this.pelicula) {
                    this.showError('La película solicitada no existe.');
                    return;
                }
                this.usuario = await usuarioService.obtenerUsuarioActual();
                if (this.usuario) {
                    this.listasUsuario = await listaService.listarPorUsuario(this.usuario.id);
                    if (this.listasUsuario.length > 0) {
                        this.listaSeleccionadaId = this.listasUsuario[0].id;
                    }
                }
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        async alternarVista() {
            this.mensajeAccion = '';
            this.error = null;
            try {
                if (!this.usuario) {
                    this.showError('Inicia sesión para registrar películas vistas.');
                    return;
                }
                this.usuario = await usuarioService.alternarPeliculaVista(this.usuario.id, this.pelicula.id);
                this.mensajeAccion = this.estaVista
                    ? 'Película registrada en tus vistas.'
                    : 'Película quitada de tus vistas.';
            } catch (err) {
                this.error = err.message;
            }
        },

        alternarSelectorLista() {
            this.selectorListaAbierto = !this.selectorListaAbierto;
            this.mensajeAccion = '';
        },

        async confirmarAgregarALista() {
            this.mensajeAccion = '';
            this.error = null;
            try {
                if (!this.listaSeleccionadaId) {
                    throw new Error('Selecciona una lista primero');
                }
                await listaService.agregarPelicula(this.listaSeleccionadaId, this.pelicula.id, this.usuario);
                this.mensajeAccion = 'Película añadida a la lista.';
                this.selectorListaAbierto = false;
            } catch (err) {
                this.error = err.message;
            }
        }
    };
}

export function adminPeliculasController(peliculaService, usuarioService) {
    return {
        peliculas: [],
        usuarioActual: null,
        editandoId: null,
        formulario: {
            title: '',
            year: 2026,
            genre: 'Drama',
            duration: 120,
            rating: 4.5,
            synopsis: '',
            posterUrl: 'img/posters/el-padrino.jpg'
        },
        cargando: true,
        error: null,
        mensajeExito: '',

        get vacio() {
            return !this.cargando && !this.error && this.peliculas.length === 0;
        },

        get textoBotonFormulario() {
            return this.editandoId ? 'Guardar cambios' : 'Agregar película';
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'Error al gestionar películas.';
        },

        async init() {
            await this.cargar();
        },

        async cargar() {
            this.showLoading();
            try {
                this.usuarioActual = await usuarioService.obtenerUsuarioActual();
                this.peliculas = await peliculaService.listar();
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        iniciarEdicion(pelicula) {
            this.editandoId = pelicula.id;
            this.formulario = {
                title: pelicula.title,
                year: pelicula.year,
                genre: pelicula.genre,
                duration: pelicula.duration || 120,
                rating: pelicula.rating,
                synopsis: pelicula.synopsis || '',
                posterUrl: pelicula.posterUrl || 'img/posters/el-padrino.jpg'
            };
            this.error = null;
            this.mensajeExito = '';
        },

        cancelarEdicion() {
            this.editandoId = null;
            this.formulario = {
                title: '',
                year: 2026,
                genre: 'Drama',
                duration: 120,
                rating: 4.5,
                synopsis: '',
                posterUrl: 'img/posters/el-padrino.jpg'
            };
        },

        async guardarPelicula() {
            this.error = null;
            this.mensajeExito = '';
            try {
                if (this.editandoId) {
                    await peliculaService.editar(this.editandoId, { ...this.formulario }, this.usuarioActual);
                    this.mensajeExito = 'Película actualizada correctamente.';
                } else {
                    await peliculaService.crear({ ...this.formulario }, this.usuarioActual);
                    this.mensajeExito = 'Película creada correctamente.';
                }
                this.cancelarEdicion();
                await this.cargar();
                this.$dispatch('peliculas-actualizadas');
            } catch (err) {
                this.error = err.message;
            }
        },

        async eliminarPelicula(id) {
            this.error = null;
            this.mensajeExito = '';
            try {
                await peliculaService.eliminar(id, this.usuarioActual);
                this.mensajeExito = 'Película eliminada del catálogo.';
                await this.cargar();
                this.$dispatch('peliculas-actualizadas');
            } catch (err) {
                this.error = err.message;
            }
        },

        urlDetalle(pelicula) {
            return `pelicula.html?id=${pelicula.id}`;
        }
    };
}
