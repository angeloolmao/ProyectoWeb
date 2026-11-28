import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { conectarDB, desconectarDB } from '../src/repositories/db.js';
import { construirDependencias } from '../app.js';
import {
    PELICULAS_INICIALES,
    RESENAS_INICIALES,
    USUARIOS_INICIALES,
    LISTAS_INICIALES,
    CALIFICACIONES_INICIALES
} from '../data/seed.js';

const COSTO_HASH = 10;

// Inserta los datos iniciales solo si la colección está vacía
async function sembrar(repositorio, datos, nombre) {
    const existentes = await repositorio.listar();
    if (existentes.length > 0) {
        console.log(`${nombre}: ya tiene ${existentes.length} registros, se omite`);
        return;
    }
    for (const item of datos) {
        await repositorio.crear(item);
    }
    console.log(`${nombre}: ${datos.length} registros sembrados`);
}

// Las claves de ejemplo se guardan hasheadas, nunca en texto plano
async function usuariosConHash() {
    return Promise.all(
        USUARIOS_INICIALES.map(async ({ password, ...resto }) => ({
            ...resto,
            passwordHash: await bcrypt.hash(password, COSTO_HASH)
        }))
    );
}

async function main() {
    await conectarDB(process.env.MONGODB_URI);
    const repos = construirDependencias();
    await sembrar(repos.peliculaRepository, PELICULAS_INICIALES, 'peliculas');
    await sembrar(repos.usuarioRepository, await usuariosConHash(), 'usuarios');
    await sembrar(repos.resenaRepository, RESENAS_INICIALES, 'resenas');
    await sembrar(repos.listaRepository, LISTAS_INICIALES, 'listas');
    await sembrar(repos.calificacionRepository, CALIFICACIONES_INICIALES, 'calificaciones');
    await desconectarDB();
}

main().catch(err => {
    console.error('Error al sembrar datos:', err.message);
    process.exit(1);
});
