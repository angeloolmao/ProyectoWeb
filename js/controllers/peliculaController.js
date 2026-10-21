// Controladores Alpine para el dominio de películas

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
