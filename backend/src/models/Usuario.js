import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema(
    {
        _id: Number,
        username: {
            type: String,
            required: [true, 'El nombre de usuario es obligatorio'],
            trim: true,
            minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
            maxlength: [30, 'El nombre de usuario no puede superar 30 caracteres']
        },
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            maxlength: [60, 'El nombre no puede superar 60 caracteres']
        },
        email: {
            type: String,
            required: [true, 'El correo es obligatorio'],
            trim: true,
            lowercase: true,
            unique: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo no es válido']
        },
        // Hash de la contraseña: nunca se entrega salvo pedido explícito en el login
        passwordHash: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            select: false
        },
        role: {
            type: String,
            enum: { values: ['user', 'admin'], message: 'El rol no es válido' },
            default: 'user'
        },
        active: { type: Boolean, default: true },
        memberSince: { type: Number, default: () => new Date().getFullYear() },
        bio: {
            type: String,
            trim: true,
            maxlength: [300, 'La biografía no puede superar 300 caracteres'],
            default: ''
        },
        watchedIds: { type: [Number], default: [] }
    },
    { versionKey: false, collection: 'usuarios' }
);

// Nombre de usuario único sin distinguir mayúsculas
usuarioSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model('Usuario', usuarioSchema);
