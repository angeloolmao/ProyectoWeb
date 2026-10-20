// Servicio con la lógica de negocio para gestionar películas
export default class PeliculaService {
    constructor(repository) {
        if (!repository) {
            throw new Error('PeliculaService requiere un repositorio válido');
        }
        this.repository = repository;
    }

    async listar() {
        return await this.repository.listar();
    }

    async obtenerPorId(id) {
        if (id == null) throw new Error('ID de película requerido');
        return await this.repository.obtenerPorId(id);
    }

    async buscarPorTitulo(query) {
        const todas = await this.listar();
        if (!query || !query.trim()) {
            return todas;
        }
        const q = query.trim().toLowerCase();
        return todas.filter(p => p.title.toLowerCase().includes(q));
    }

    async filtrarPorGenero(genero) {
        const todas = await this.listar();
        if (!genero || genero === 'Todos') {
            return todas;
        }
        return todas.filter(p => p.genre.toLowerCase() === genero.toLowerCase());
    }

    async crear(datosPelicula) {
        // Validación de campos obligatorios
        if (!datosPelicula.title || datosPelicula.title.trim() === '') {
            throw new Error('El título de la película es obligatorio');
        }

        const anio = Number(datosPelicula.year);
        const anioActual = new Date().getFullYear();
        if (isNaN(anio) || anio < 1888 || anio > anioActual + 2) {
            throw new Error(`El año debe ser un número válido entre 1888 y ${anioActual + 2}`);
        }

        const rating = Number(datosPelicula.rating);
        if (isNaN(rating) || rating < 1.0 || rating > 5.0) {
            throw new Error('La calificación debe estar entre 1.0 y 5.0');
        }

        const nuevaPelicula = {
            title: datosPelicula.title.trim(),
            year: anio,
            genre: datosPelicula.genre ? datosPelicula.genre.trim() : 'General',
            rating: Number(rating.toFixed(1)),
            synopsis: datosPelicula.synopsis ? datosPelicula.synopsis.trim() : '',
            posterUrl: datosPelicula.posterUrl || 'img/posters/el-padrino.svg'
        };

        return await this.repository.crear(nuevaPelicula);
    }

    async editar(id, cambios) {
        // Validaciones condicionales según el campo modificado
        if (cambios.title !== undefined && (!cambios.title || cambios.title.trim() === '')) {
            throw new Error('El título no puede estar vacío');
        }

        if (cambios.year !== undefined) {
            const anio = Number(cambios.year);
            if (isNaN(anio) || anio < 1888) {
                throw new Error('El año de lanzamiento no es válido');
            }
            cambios.year = anio;
        }

        if (cambios.rating !== undefined) {
            const rating = Number(cambios.rating);
            if (isNaN(rating) || rating < 1.0 || rating > 5.0) {
                throw new Error('La calificación debe estar entre 1.0 y 5.0');
            }
            cambios.rating = Number(rating.toFixed(1));
        }

        return await this.repository.editar(id, cambios);
    }

    async eliminar(id) {
        return await this.repository.eliminar(id);
    }
}
