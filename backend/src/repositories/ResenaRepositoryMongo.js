import MongoRepository from './MongoRepository.js';
import Resena from '../models/Resena.js';

export default class ResenaRepositoryMongo extends MongoRepository {
    constructor() {
        super(Resena);
    }
}
