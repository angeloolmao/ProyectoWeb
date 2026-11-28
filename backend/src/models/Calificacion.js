import mongoose from 'mongoose';

const calificacionSchema = new mongoose.Schema(
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
        puntaje: {
            type: Number,
            required: [true, 'El puntaje es obligatorio'],
            min: [1, 'El puntaje mínimo es 1'],
            max: [5, 'El puntaje máximo es 5'],
            validate: {
                validator: Number.isInteger,
                message: 'El puntaje debe ser un número entero'
            }
        }
    },
    { versionKey: false, collection: 'calificaciones' }
);

// Un usuario califica cada película una sola vez
calificacionSchema.index({ peliculaId: 1, usuarioId: 1 }, { unique: true });

export default mongoose.model('Calificacion', calificacionSchema);
