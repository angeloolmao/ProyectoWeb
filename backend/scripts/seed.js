import 'dotenv/config';
import { conectarDB, desconectarDB } from '../src/repositories/db.js';
import { construirDependencias } from '../app.js';
import { PELICULAS_INICIALES, RESENAS_INICIALES } from '../data/seed.js';

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

async function main() {
    await conectarDB(process.env.MONGODB_URI);
    const { peliculaRepository, resenaRepository } = construirDependencias();
    await sembrar(peliculaRepository, PELICULAS_INICIALES, 'peliculas');
    await sembrar(resenaRepository, RESENAS_INICIALES, 'resenas');
    await desconectarDB();
}

main().catch(err => {
    console.error('Error al sembrar datos:', err.message);
    process.exit(1);
});
