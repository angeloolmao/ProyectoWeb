import mongoose from 'mongoose';

// Conecta a MongoDB usando la URI de entorno antes de levantar el servidor
export async function conectarDB(uri) {
    await mongoose.connect(uri);
    // Espera a que los índices únicos estén creados antes de atender peticiones
    await Promise.all(Object.values(mongoose.models).map(modelo => modelo.init()));
    console.log('Conexión a MongoDB establecida');
}

export async function desconectarDB() {
    await mongoose.disconnect();
}
