import mongoose from 'mongoose';

// Conecta a MongoDB usando la URI de entorno antes de levantar el servidor
export async function conectarDB(uri) {
    await mongoose.connect(uri);
    console.log('Conexión a MongoDB establecida');
}

export async function desconectarDB() {
    await mongoose.disconnect();
}
