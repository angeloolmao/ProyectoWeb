// Datos iniciales para poblar el repositorio cuando aún no existen registros

export const PELICULAS_INICIALES = [
    {
        id: 1,
        title: "Orgullo y Prejuicio",
        year: 2005,
        genre: "Romance",
        duration: 129,
        rating: 4.6,
        synopsis: "Elizabeth Bennet y el orgulloso Sr. Darcy deben superar sus primeras impresiones y prejuicios sociales en la campiña inglesa del siglo XVIII.",
        posterUrl: "img/posters/orgullo-y-prejuicio.jpg"
    },
    {
        id: 2,
        title: "El Padrino",
        year: 1972,
        genre: "Drama",
        duration: 175,
        rating: 4.9,
        synopsis: "El patriarca de una dinastía del crimen organizado en Nueva York transfiere el control de su imperio clandestino a su hijo menor.",
        posterUrl: "img/posters/el-padrino.jpg"
    },
    {
        id: 3,
        title: "Pulp Fiction",
        year: 1994,
        genre: "Crimen",
        duration: 154,
        rating: 4.7,
        synopsis: "Las vidas de dos sicarios, un boxeador, la esposa de un gánster y dos asaltantes se entrelazan en cuatro historias de violencia y redención.",
        posterUrl: "img/posters/pulp-fiction.jpg"
    },
    {
        id: 4,
        title: "Titanic",
        year: 1997,
        genre: "Romance",
        duration: 194,
        rating: 4.3,
        synopsis: "Una joven de la alta sociedad y un artista sin recursos se enamoran a bordo del transatlántico durante su desafortunado viaje inaugural.",
        posterUrl: "img/posters/titanic.jpg"
    },
    {
        id: 5,
        title: "El Señor de los Anillos",
        year: 2001,
        genre: "Fantasía",
        duration: 178,
        rating: 4.8,
        synopsis: "Un joven hobbit y ocho compañeros emprenden un viaje por la Tierra Media para destruir el Anillo Único en el Monte del Destino.",
        posterUrl: "img/posters/el-senor-de-los-anillos.jpg"
    },
    {
        id: 6,
        title: "Interstellar",
        year: 2014,
        genre: "Ciencia Ficción",
        duration: 169,
        rating: 4.7,
        synopsis: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio con el fin de asegurar la supervivencia de la humanidad.",
        posterUrl: "img/posters/interstellar.jpg"
    },
    {
        id: 7,
        title: "Parásitos",
        year: 2019,
        genre: "Thriller",
        duration: 132,
        rating: 4.6,
        synopsis: "La codicia y la discriminación de clases amenazan la relación recién formada entre la adinerada familia Park y el empobrecido clan Kim.",
        posterUrl: "img/posters/parasitos.jpg"
    },
    {
        id: 8,
        title: "La La Land",
        year: 2016,
        genre: "Musical",
        duration: 128,
        rating: 4.2,
        synopsis: "Mientras buscan triunfar en Los Ángeles, un pianista de jazz y una aspirante a actriz se enamoran mientras intentan reconciliar sus sueños.",
        posterUrl: "img/posters/la-la-land.jpg"
    },
    {
        id: 9,
        title: "El Origen",
        year: 2010,
        genre: "Ciencia Ficción",
        duration: 148,
        rating: 4.5,
        synopsis: "A un ladrón que roba secretos corporativos mediante la tecnología de sueños compartidos se le encarga la tarea inversa de implantar una idea.",
        posterUrl: "img/posters/el-origen.jpg"
    },
    {
        id: 10,
        title: "Coco",
        year: 2017,
        genre: "Animación",
        duration: 105,
        rating: 4.6,
        synopsis: "El joven Miguel sueña con convertirse en un gran músico y se adentra en la Tierra de los Muertos para descubrir la historia de su familia.",
        posterUrl: "img/posters/coco.jpg"
    },
    {
        id: 11,
        title: "Joker",
        year: 2019,
        genre: "Drama",
        duration: 122,
        rating: 4.3,
        synopsis: "En Ciudad Gótica, el comediante con problemas mentales Arthur Fleck es ignorado y maltratado por la sociedad, iniciando una espiral descendente.",
        posterUrl: "img/posters/joker.jpg"
    },
    {
        id: 12,
        title: "Spider-Man: Un Nuevo Universo",
        year: 2018,
        genre: "Animación",
        duration: 117,
        rating: 4.5,
        synopsis: "El adolescente Miles Morales se convierte en el Spider-Man de su universo y debe unirse a cinco contrapartes de otras dimensiones.",
        posterUrl: "img/posters/spiderman.jpg"
    }
];

export const USUARIOS_INICIALES = [
    {
        id: 1,
        username: "carlos_p",
        name: "Carlos Peña",
        email: "carlos@correo.com",
        password: "123",
        role: "admin",
        active: true,
        memberSince: 2026,
        bio: "Cinéfilo y coleccionista de clásicos.",
        watchedIds: [1, 2, 3, 5, 6, 7]
    },
    {
        id: 2,
        username: "camila_r",
        name: "Camila Rojas",
        email: "camila@correo.com",
        password: "123",
        role: "user",
        active: true,
        memberSince: 2026,
        bio: "Amante del cine de romance y animación.",
        watchedIds: [1, 4, 8, 10]
    },
    {
        id: 3,
        username: "fmatus",
        name: "Felipe Matus",
        email: "fmatus@correo.com",
        password: "123",
        role: "admin",
        active: true,
        memberSince: 2026,
        bio: "Crítico de ciencia ficción y suspenso.",
        watchedIds: [2, 3, 6, 9, 11]
    }
];

export const SESION_INICIAL = [
    { id: 1, usuarioId: 1 }
];

export const RESENAS_INICIALES = [
    {
        id: 1,
        peliculaId: 1,
        usuarioId: 2,
        username: "camila_r",
        texto: "Fotografía hermosa y actuaciones memorables de principio a fin.",
        fecha: "2026-10-16",
        reportada: false
    },
    {
        id: 2,
        peliculaId: 1,
        usuarioId: 1,
        username: "carlos_p",
        texto: "Una adaptación ágil con una banda sonora inolvidable.",
        fecha: "2026-10-18",
        reportada: false
    },
    {
        id: 3,
        peliculaId: 2,
        usuarioId: 3,
        username: "fmatus",
        texto: "Obra maestra absoluta del cine dramático.",
        fecha: "2026-10-15",
        reportada: true
    }
];

export const CALIFICACIONES_INICIALES = [
    { id: 1, peliculaId: 1, usuarioId: 1, puntaje: 4 },
    { id: 2, peliculaId: 2, usuarioId: 1, puntaje: 5 },
    { id: 3, peliculaId: 6, usuarioId: 1, puntaje: 5 },
    { id: 4, peliculaId: 1, usuarioId: 2, puntaje: 5 }
];

export const LISTAS_INICIALES = [
    {
        id: 1,
        usuarioId: 1,
        nombre: "Favoritas",
        descripcion: "Películas que volvería a ver mil veces",
        peliculaIds: [1, 2, 5, 6]
    },
    {
        id: 2,
        usuarioId: 1,
        nombre: "Para ver el fin de semana",
        descripcion: "Pendientes recomendadas",
        peliculaIds: [7, 9, 12]
    },
    {
        id: 3,
        usuarioId: 1,
        nombre: "Cine con amigos",
        descripcion: "Ideales para maratón grupal",
        peliculaIds: [3, 10, 11]
    }
];
