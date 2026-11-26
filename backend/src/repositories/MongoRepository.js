import Repository from './Repository.js';
import Contador from '../models/Contador.js';

// Implementación genérica del contrato sobre un modelo de Mongoose
export default class MongoRepository extends Repository {
    constructor(modelo) {
        super();
        this.modelo = modelo;
    }

    // Entrega el documento con id como texto, sin _id ni __v
    _aPlano(doc) {
        if (!doc) return null;
        const { _id, __v, ...resto } = doc;
        return { id: String(_id), ...resto };
    }

    async _siguienteId() {
        const contador = await Contador.findOneAndUpdate(
            { _id: this.modelo.modelName },
            { $inc: { seq: 1 } },
            { upsert: true, returnDocument: 'after' }
        );
        return contador.seq;
    }

    async listar() {
        const docs = await this.modelo.find().sort({ _id: 1 }).lean();
        return docs.map(doc => this._aPlano(doc));
    }

    async obtenerPorId(id) {
        const doc = await this.modelo.findById(id).lean();
        return this._aPlano(doc);
    }

    async crear(datos) {
        const { id: idExplicito, ...campos } = datos;
        const id = idExplicito != null ? Number(idExplicito) : await this._siguienteId();
        const doc = await this.modelo.create({ ...campos, _id: id });
        // El contador nunca queda por debajo del mayor id usado
        await Contador.updateOne(
            { _id: this.modelo.modelName },
            { $max: { seq: id } },
            { upsert: true }
        );
        return this._aPlano(doc.toObject());
    }

    async editar(id, cambios) {
        const doc = await this.modelo
            .findByIdAndUpdate(id, { $set: cambios }, { returnDocument: 'after', runValidators: true })
            .lean();
        return this._aPlano(doc);
    }

    async reemplazar(id, datos) {
        const doc = await this.modelo.findById(id);
        if (!doc) return null;
        doc.overwrite(datos);
        await doc.save();
        return this._aPlano(doc.toObject());
    }

    async eliminar(id) {
        const resultado = await this.modelo.deleteOne({ _id: id });
        return resultado.deletedCount > 0;
    }
}
