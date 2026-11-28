import 'dotenv/config';
import { conectarDB } from './src/repositories/db.js';
import crearApp from './app.js';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Validación temprana de variables de entorno obligatorias
if (!MONGODB_URI) {
    console.error('Error fatal: falta la variable de entorno MONGODB_URI');
    process.exit(1);
}

if (!JWT_SECRET) {
    console.error('Error fatal: falta la variable de entorno JWT_SECRET');
    process.exit(1);
}

async function iniciarServidor() {
    try {
        await conectarDB(MONGODB_URI);
        const app = crearApp();
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en puerto ${PORT}`);
        });
    } catch (err) {
        console.error('No se pudo iniciar el servidor:', err.message);
        process.exit(1);
    }
}

iniciarServidor();
