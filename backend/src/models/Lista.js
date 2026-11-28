import mongoose from 'mongoose';

const listaSchema = new mongoose.Schema(
    {
        _id: Number,
        usuarioId: {
            type: Number,
            ref: 'Usuario',
            required: [true, 'La lista debe pertenecer a un usuario'],
            index: true
        },
        nombre: {
            type: String,
            required: [true, 'El nombre de la lista es obligatorio'],
            trim: true,
            minlength: [2, 'El nombre de la lista debe tener al menos 2 caracteres'],
            maxlength: [50, 'El nombre de la lista no puede superar 50 caracteres']
        },
        descripcion: {
            type: String,
            trim: true,
            maxlength: [200, 'La descripción no puede superar 200 caracteres'],
            default: ''
        },
        peliculaIds: {
            type: [Number],
            default: [],
            validate: {
                validator: ids => new Set(ids).size === ids.length,
                message: 'Una película no puede repetirse dentro de la lista'
            }
        }
    },
    { versionKey: false, collection: 'listas' }
);

export default mongoose.model('Lista', listaSchema);
