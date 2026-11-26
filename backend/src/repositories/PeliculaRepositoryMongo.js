import MongoRepository from './MongoRepository.js';
import Pelicula from '../models/Pelicula.js';

export default class PeliculaRepositoryMongo extends MongoRepository {
    constructor() {
        super(Pelicula);
    }
}
