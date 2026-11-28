import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError.js';
import { validarCuerpo, textoObligatorio, emailValido, claveValida } from '../utils/validaciones.js';

const COSTO_HASH = 10;

export default class AuthService {
    constructor(usuarioRepository, { secreto, expiracion }) {
        if (!usuarioRepository) {
            throw new Error('AuthService requiere un repositorio de usuarios');
        }
        if (!secreto) {
            throw new Error('AuthService requiere un secreto para firmar los tokens');
        }
        this.repository = usuarioRepository;
        this.secreto = secreto;
        this.expiracion = expiracion || '24h';
    }

    _firmar(usuario) {
        return jwt.sign({ sub: String(usuario.id), role: usuario.role }, this.secreto, {
            expiresIn: this.expiracion
        });
    }

    async registrar(datos) {
        validarCuerpo(datos);
        const username = textoObligatorio(datos.username, 'username', 30, 3);
        const email = emailValido(datos.email);
        const clave = claveValida(datos.password);
        const name = datos.name === undefined ? username : textoObligatorio(datos.name, 'name', 60);

        if (await this.repository.obtenerPorEmail(email)) {
            throw new AppError('Ya existe una cuenta con ese correo', 409);
        }
        if (await this.repository.obtenerPorUsername(username)) {
            throw new AppError('Ese nombre de usuario ya está en uso', 409);
        }

        // La clave nunca se guarda en texto plano; el rol siempre parte como usuario común
        const passwordHash = await bcrypt.hash(clave, COSTO_HASH);
        const usuario = await this.repository.crear({
            username,
            name,
            email,
            passwordHash,
            role: 'user',
            bio: 'Nuevo miembro de ProyectoWeb.'
        });
        return { token: this._firmar(usuario), usuario };
    }

    async login(datos) {
        validarCuerpo(datos);
        const { email, password } = datos;
        if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
            throw new AppError('Debes ingresar correo y contraseña', 400);
        }

        const credenciales = await this.repository.obtenerCredencialesPorEmail(email.trim().toLowerCase());
        const valida = credenciales ? await bcrypt.compare(password, credenciales.passwordHash) : false;
        // Mismo mensaje si el correo no existe o la clave es incorrecta
        if (!valida) {
            throw new AppError('Credenciales incorrectas', 401);
        }
        if (credenciales.active === false) {
            throw new AppError('Esta cuenta se encuentra suspendida', 403);
        }

        const usuario = await this.repository.obtenerPorId(credenciales.id);
        return { token: this._firmar(usuario), usuario };
    }

    // Devuelve el usuario dueño del token o lanza 401
    async verificarToken(token) {
        let payload;
        try {
            payload = jwt.verify(token, this.secreto);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new AppError('El token ha expirado', 401);
            }
            throw new AppError('Token inválido', 401);
        }
        const usuario = await this.repository.obtenerPorId(payload.sub);
        if (!usuario || usuario.active === false) {
            throw new AppError('Token inválido', 401);
        }
        return usuario;
    }
}
