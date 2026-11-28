import MongoRepository from './MongoRepository.js';
import Calificacion from '../models/Calificacion.js';

export default class CalificacionRepositoryMongo extends MongoRepository {
    constructor() {
        super(Calificacion);
    }

    async obtenerPorPeliculaYUsuario(peliculaId, usuarioId) {
        const doc = await this.modelo.findOne({ peliculaId, usuarioId }).lean();
        return this._aPlano(doc);
    }
}
