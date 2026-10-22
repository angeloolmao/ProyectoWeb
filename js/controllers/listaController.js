// Controladores Alpine para creación y administración de listas personales

export function formularioListaController(listaService, usuarioService) {
    return {
        nombre: '',
        descripcion: '',
        cargando: false,
        error: null,
        mensaje: '',

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No se pudo crear la lista.';
        },

        async crearNuevaLista() {
            this.showLoading();
            this.mensaje = '';
            try {
                const usuario = await usuarioService.obtenerUsuarioActual();
                await listaService.crear(
                    { nombre: this.nombre, descripcion: this.descripcion },
                    usuario
                );
                this.nombre = '';
                this.descripcion = '';
                this.cargando = false;
                this.mensaje = 'Lista creada correctamente.';
                this.$dispatch('lista-actualizada');
            } catch (err) {
                this.showError(err.message);
            }
        }
    };
}

export function listasUsuarioController(listaService, peliculaService, usuarioService) {
    return {
        listas: [],
        catalogoPeliculas: [],
        usuarioActual: null,
        editandoId: null,
        nombreEdicion: '',
        descripcionEdicion: '',
        peliculaParaAgregar: {},
        cargando: true,
        error: null,
        mensaje: '',

        get vacio() {
            return !this.cargando && !this.error && this.listas.length === 0;
        },

        get textoContador() {
            const n = this.listas.length;
            return `${n} ${n === 1 ? 'lista' : 'listas'}`;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'Error al cargar las listas.';
        },

        async init() {
            await this.cargarListas();
        },

        async cargarListas() {
            this.showLoading();
            try {
                this.usuarioActual = await usuarioService.obtenerUsuarioActual();
                this.catalogoPeliculas = await peliculaService.listar();
                const mapaPeliculas = new Map(this.catalogoPeliculas.map(p => [Number(p.id), p]));

                const crudas = this.usuarioActual
                    ? await listaService.listarPorUsuario(this.usuarioActual.id)
                    : await listaService.listar();

                this.listas = crudas.map(lista => {
                    const ids = Array.isArray(lista.peliculaIds) ? lista.peliculaIds : [];
                    const peliculas = ids.map(id => mapaPeliculas.get(Number(id))).filter(Boolean);
                    const iniciales = lista.nombre
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map(w => w[0].toUpperCase())
                        .join('') || 'LS';
                    return {
                        ...lista,
                        iniciales,
                        peliculas,
                        cantidadTexto: `${peliculas.length} ${peliculas.length === 1 ? 'película' : 'películas'}`
                    };
                });

                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        iniciarEdicion(lista) {
            this.editandoId = lista.id;
            this.nombreEdicion = lista.nombre;
            this.descripcionEdicion = lista.descripcion || '';
            this.error = null;
        },

        cancelarEdicion() {
            this.editandoId = null;
            this.nombreEdicion = '';
            this.descripcionEdicion = '';
        },

        async guardarEdicion(listaId) {
            this.error = null;
            this.mensaje = '';
            try {
                await listaService.editar(
                    listaId,
                    { nombre: this.nombreEdicion, descripcion: this.descripcionEdicion },
                    this.usuarioActual
                );
                this.cancelarEdicion();
                this.mensaje = 'Lista actualizada.';
                await this.cargarListas();
            } catch (err) {
                this.error = err.message;
            }
        },

        async eliminarLista(listaId) {
            this.error = null;
            this.mensaje = '';
            try {
                await listaService.eliminar(listaId, this.usuarioActual);
                this.mensaje = 'Lista eliminada.';
                await this.cargarListas();
            } catch (err) {
                this.error = err.message;
            }
        },

        async agregarPeliculaALista(listaId) {
            this.error = null;
            this.mensaje = '';
            const peliculaId = this.peliculaParaAgregar[listaId];
            if (!peliculaId) {
                this.error = 'Selecciona una película para añadir a la lista.';
                return;
            }
            try {
                await listaService.agregarPelicula(listaId, peliculaId, this.usuarioActual);
                this.mensaje = 'Película añadida a la lista.';
                await this.cargarListas();
            } catch (err) {
                this.error = err.message;
            }
        },

        async quitarPeliculaDeLista(listaId, peliculaId) {
            this.error = null;
            this.mensaje = '';
            try {
                await listaService.quitarPelicula(listaId, peliculaId, this.usuarioActual);
                this.mensaje = 'Película quitada de la lista.';
                await this.cargarListas();
            } catch (err) {
                this.error = err.message;
            }
        },

        urlDetalle(pelicula) {
            return `pelicula.html?id=${pelicula.id}`;
        }
    };
}
