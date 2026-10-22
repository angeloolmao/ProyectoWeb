// Controlador Alpine para calificación interactiva de películas (escala 1 a 5)

function obtenerIdPeliculaUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    return !isNaN(id) && id > 0 ? id : 1;
}

export function calificacionPeliculaController(calificacionService, peliculaService, usuarioService) {
    return {
        peliculaId: obtenerIdPeliculaUrl(),
        estrellas: [1, 2, 3, 4, 5],
        miPuntaje: 0,
        promedio: '0.0',
        usuarioActual: null,
        cargando: true,
        error: null,

        get vacio() {
            return !this.cargando && !this.error && this.miPuntaje === 0;
        },

        get resumenCalificacion() {
            if (this.miPuntaje > 0) {
                return `Tu calificación: ${this.miPuntaje}/5 · Promedio: ★ ${this.promedio}`;
            }
            return `Sin calificar aún · Promedio: ★ ${this.promedio}`;
        },

        showLoading() {
            this.cargando = true;
            this.error = null;
        },

        showError(mensaje) {
            this.cargando = false;
            this.error = mensaje || 'No se pudo registrar la calificación.';
        },

        async init() {
            await this.cargarCalificacion();
        },

        async cargarCalificacion() {
            this.showLoading();
            try {
                this.usuarioActual = await usuarioService.obtenerUsuarioActual();
                const pelicula = await peliculaService.obtenerPorId(this.peliculaId);
                const base = pelicula ? pelicula.rating : 4.5;

                if (this.usuarioActual) {
                    const existente = await calificacionService.obtenerDeUsuario(this.peliculaId, this.usuarioActual.id);
                    this.miPuntaje = existente ? Number(existente.puntaje) : 0;
                }
                this.promedio = await calificacionService.calcularPromedioPelicula(this.peliculaId, base);
                this.cargando = false;
            } catch (err) {
                this.showError(err.message);
            }
        },

        estrellaActiva(valor) {
            return valor <= this.miPuntaje;
        },

        async seleccionarEstrella(valor) {
            this.error = null;
            try {
                await calificacionService.calificar(this.peliculaId, valor, this.usuarioActual);
                await this.cargarCalificacion();
                this.$dispatch('calificacion-actualizada', {
                    peliculaId: this.peliculaId,
                    puntaje: this.miPuntaje,
                    promedio: this.promedio
                });
            } catch (err) {
                this.showError(err.message);
            }
        },

        async quitarCalificacion() {
            this.error = null;
            try {
                await calificacionService.eliminarCalificacion(this.peliculaId, this.usuarioActual);
                await this.cargarCalificacion();
                this.$dispatch('calificacion-actualizada', {
                    peliculaId: this.peliculaId,
                    puntaje: 0,
                    promedio: this.promedio
                });
            } catch (err) {
                this.showError(err.message);
            }
        }
    };
}
