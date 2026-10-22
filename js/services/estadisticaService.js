// Servicio para calcular métricas de actividad del usuario y películas

export default class EstadisticaService {
    constructor(peliculaService, resenaService, calificacionService, listaService) {
        this.peliculaService = peliculaService;
        this.resenaService = resenaService;
        this.calificacionService = calificacionService;
        this.listaService = listaService;
    }

    async obtenerEstadisticasUsuario(usuario) {
        if (!usuario) {
            return {
                totalVistas: 0,
                totalResenas: 0,
                promedioCalificaciones: '0.0',
                totalListas: 0,
                peliculasVistas: [],
                resenas: [],
                listas: []
            };
        }

        const [todasPeliculas, resenas, calificaciones, listas] = await Promise.all([
            this.peliculaService.listar(),
            this.resenaService.listarPorUsuario(usuario.id),
            this.calificacionService.listarPorUsuario(usuario.id),
            this.listaService.listarPorUsuario(usuario.id)
        ]);

        const mapaPeliculas = new Map(todasPeliculas.map(p => [Number(p.id), p]));
        const idsVistas = Array.isArray(usuario.watchedIds) ? usuario.watchedIds : [];
        const peliculasVistas = idsVistas
            .map(id => mapaPeliculas.get(Number(id)))
            .filter(Boolean);

        const resenasEnriquecidas = resenas.map(r => {
            const peli = mapaPeliculas.get(Number(r.peliculaId));
            return {
                ...r,
                peliculaTitulo: peli ? peli.title : 'Película'
            };
        });

        const listasEnriquecidas = listas.map(l => ({
            ...l,
            cantidad: Array.isArray(l.peliculaIds) ? l.peliculaIds.length : 0,
            iniciales: l.nombre
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(p => p[0].toUpperCase())
                .join('') || 'LS'
        }));

        let promedio = '0.0';
        if (calificaciones.length > 0) {
            const suma = calificaciones.reduce((acc, c) => acc + Number(c.puntaje), 0);
            promedio = (suma / calificaciones.length).toFixed(1);
        }

        return {
            totalVistas: peliculasVistas.length,
            totalResenas: resenasEnriquecidas.length,
            promedioCalificaciones: promedio,
            totalListas: listasEnriquecidas.length,
            peliculasVistas,
            resenas: resenasEnriquecidas,
            listas: listasEnriquecidas
        };
    }
}
