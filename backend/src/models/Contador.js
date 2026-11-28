import mongoose from 'mongoose';

// Contador secuencial por colección para generar ids numéricos
const contadorSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 }
    },
    { versionKey: false }
);

export default mongoose.model('Contador', contadorSchema);
