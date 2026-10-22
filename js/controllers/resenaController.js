// Controladores Alpine para reseñas de películas y moderación de contenido

function obtenerIdPeliculaUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    return !isNaN(id) && id > 0 ? id : 1;
}

export function resenasPeliculaController(resenaService, usuarioService) {
    return {
        peliculaId: obtenerIdPeliculaUrl(),
        resenas: [],
        usuarioActual: null,
        nuevoTexto: '',
        editandoId: null,
        textoEdicion: '',
        cargando: true,
        error: null,
        mensaje: '',

        get vacio() {
            return !this.cargando && !this.error && this.resenas.length === 0;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'Error al cargar las reseñas.';
        },

        async init() {
            await this.cargarResenas();
        },

        async cargarResenas() {
            this.showLoading();
            try {
                this.usuarioActual = await usuarioService.obtenerUsuarioActual();
                this.resenas = await resenaService.listarPorPelicula(this.peliculaId);
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        esPropietario(resena) {
            return this.usuarioActual && Number(resena.usuarioId) === Number(this.usuarioActual.id);
        },

        async publicarResena() {
            this.error = null;
            this.mensaje = '';
            try {
                await resenaService.crear(
                    { peliculaId: this.peliculaId, texto: this.nuevoTexto },
                    this.usuarioActual
                );
                this.nuevoTexto = '';
                this.mensaje = 'Reseña publicada.';
                await this.cargarResenas();
                this.$dispatch('resena-actualizada');
            } catch (err) {
                this.error = err.message;
            }
        },

        iniciarEdicion(resena) {
            this.editandoId = resena.id;
            this.textoEdicion = resena.texto;
            this.error = null;
        },

        cancelarEdicion() {
            this.editandoId = null;
            this.textoEdicion = '';
        },

        async guardarEdicion(resenaId) {
            this.error = null;
            this.mensaje = '';
            try {
                await resenaService.editar(resenaId, { texto: this.textoEdicion }, this.usuarioActual);
                this.cancelarEdicion();
                this.mensaje = 'Reseña modificada.';
                await this.cargarResenas();
                this.$dispatch('resena-actualizada');
            } catch (err) {
                this.error = err.message;
            }
        },

        async eliminarResena(resenaId) {
            this.error = null;
            this.mensaje = '';
            try {
                await resenaService.eliminar(resenaId, this.usuarioActual);
                this.mensaje = 'Reseña eliminada.';
                await this.cargarResenas();
                this.$dispatch('resena-actualizada');
            } catch (err) {
                this.error = err.message;
            }
        },

        async reportarResena(resenaId) {
            this.error = null;
            try {
                await resenaService.reportar(resenaId);
                this.mensaje = 'Reseña reportada para moderación.';
                await this.cargarResenas();
            } catch (err) {
                this.error = err.message;
            }
        }
    };
}

export function adminModeracionController(resenaService, usuarioService) {
    return {
        reportadas: [],
        usuarioActual: null,
        cargando: true,
        error: null,
        mensaje: '',

        get vacio() {
            return !this.cargando && !this.error && this.reportadas.length === 0;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No se pudieron cargar las reseñas reportadas.';
        },

        async init() {
            await this.cargarReportadas();
        },

        async cargarReportadas() {
            this.showLoading();
            try {
                this.usuarioActual = await usuarioService.obtenerUsuarioActual();
                this.reportadas = await resenaService.listarReportadas();
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        async aprobarResena(id) {
            this.error = null;
            try {
                await resenaService.descartarReporte(id, this.usuarioActual);
                this.mensaje = 'Reporte descartado.';
                await this.cargarReportadas();
            } catch (err) {
                this.error = err.message;
            }
        },

        async eliminarResenaModerada(id) {
            this.error = null;
            try {
                await resenaService.eliminar(id, this.usuarioActual);
                this.mensaje = 'Reseña eliminada por moderación.';
                await this.cargarReportadas();
            } catch (err) {
                this.error = err.message;
            }
        }
    };
}
