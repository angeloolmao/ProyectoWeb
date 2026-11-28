import MongoRepository from './MongoRepository.js';
import Usuario from '../models/Usuario.js';

const COLACION = { locale: 'en', strength: 2 };

export default class UsuarioRepositoryMongo extends MongoRepository {
    constructor() {
        super(Usuario);
    }

    // Ningún método genérico entrega el hash de la contraseña
    _aPlano(doc) {
        const plano = super._aPlano(doc);
        if (plano) delete plano.passwordHash;
        return plano;
    }

    async obtenerPorEmail(email) {
        const doc = await this.modelo.findOne({ email }).lean();
        return this._aPlano(doc);
    }

    async obtenerPorUsername(username) {
        const doc = await this.modelo.findOne({ username }).collation(COLACION).lean();
        return this._aPlano(doc);
    }

    // Único método que entrega el hash, usado solo para verificar el login
    async obtenerCredencialesPorEmail(email) {
        const doc = await this.modelo.findOne({ email }).select('+passwordHash').lean();
        if (!doc) return null;
        return { id: String(doc._id), passwordHash: doc.passwordHash, active: doc.active };
    }
}
