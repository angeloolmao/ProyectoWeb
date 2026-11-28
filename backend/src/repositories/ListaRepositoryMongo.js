import MongoRepository from './MongoRepository.js';
import Lista from '../models/Lista.js';

export default class ListaRepositoryMongo extends MongoRepository {
    constructor() {
        super(Lista);
    }

    async listarPorUsuario(usuarioId) {
        const docs = await this.modelo.find({ usuarioId }).sort({ _id: 1 }).lean();
        return docs.map(doc => this._aPlano(doc));
    }
}
