import mongoose from 'mongoose';

const resenaSchema = new mongoose.Schema(
    {
        _id: Number,
        peliculaId: {
            type: Number,
            ref: 'Pelicula',
            required: [true, 'La película es obligatoria']
        },
        usuarioId: {
            type: Number,
            ref: 'Usuario',
            required: [true, 'El usuario es obligatorio']
        },
        username: {
            type: String,
            required: [true, 'El nombre de usuario es obligatorio'],
            trim: true,
            maxlength: [50, 'El nombre de usuario no puede superar 50 caracteres']
        },
        texto: {
            type: String,
            required: [true, 'El texto de la reseña es obligatorio'],
            trim: true,
            minlength: [5, 'La reseña debe tener al menos 5 caracteres'],
            maxlength: [1000, 'La reseña no puede superar 1000 caracteres']
        },
        fecha: {
            type: String,
            default: () => new Date().toISOString().slice(0, 10)
        },
        reportada: {
            type: Boolean,
            default: false
        }
    },
    { versionKey: false, collection: 'resenas' }
);

export default mongoose.model('Resena', resenaSchema);
