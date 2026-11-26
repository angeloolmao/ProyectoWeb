import mongoose from 'mongoose';

const ANIO_MAXIMO = new Date().getFullYear() + 2;

const peliculaSchema = new mongoose.Schema(
    {
        _id: Number,
        title: {
            type: String,
            required: [true, 'El título es obligatorio'],
            trim: true,
            maxlength: [150, 'El título no puede superar 150 caracteres']
        },
        year: {
            type: Number,
            required: [true, 'El año es obligatorio'],
            min: [1888, 'El año no puede ser anterior a 1888'],
            max: [ANIO_MAXIMO, `El año no puede superar ${ANIO_MAXIMO}`]
        },
        genre: {
            type: String,
            required: [true, 'El género es obligatorio'],
            trim: true,
            maxlength: [50, 'El género no puede superar 50 caracteres']
        },
        duration: {
            type: Number,
            min: [1, 'La duración debe ser mayor a 0'],
            default: 120
        },
        rating: {
            type: Number,
            required: [true, 'La calificación es obligatoria'],
            min: [1, 'La calificación mínima es 1'],
            max: [5, 'La calificación máxima es 5']
        },
        synopsis: {
            type: String,
            trim: true,
            maxlength: [2000, 'La sinopsis no puede superar 2000 caracteres'],
            default: ''
        },
        posterUrl: {
            type: String,
            trim: true,
            default: 'img/posters/el-padrino.jpg'
        }
    },
    { versionKey: false, collection: 'peliculas' }
);

// No pueden existir dos películas con el mismo título y año
peliculaSchema.index({ title: 1, year: 1 }, { unique: true });

export default mongoose.model('Pelicula', peliculaSchema);
