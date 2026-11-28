import AppError from '../errors/AppError.js';

// Validadores de entrada reutilizables por los servicios. Lanzan AppError 400.

const MAX_ENTERO = Number.MAX_SAFE_INTEGER;

export function validarId(id) {
    if (!/^[1-9]\d*$/.test(String(id))) {
        throw new AppError('El identificador indicado no es válido', 400);
    }
    return Number(id);
}

export function validarCuerpo(datos) {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        throw new AppError('El cuerpo de la petición debe ser un objeto JSON', 400);
    }
}

export function textoObligatorio(valor, campo, max, min = 1) {
    if (typeof valor !== 'string' || valor.trim() === '') {
        throw new AppError(`El campo ${campo} es obligatorio`, 400);
    }
    const limpio = valor.trim();
    if (limpio.length < min) {
        throw new AppError(`El campo ${campo} debe tener al menos ${min} caracteres`, 400);
    }
    if (limpio.length > max) {
        throw new AppError(`El campo ${campo} no puede superar ${max} caracteres`, 400);
    }
    return limpio;
}

export function textoOpcional(valor, campo, max) {
    if (valor === null || valor === undefined) return '';
    if (typeof valor !== 'string') {
        throw new AppError(`El campo ${campo} debe ser texto`, 400);
    }
    const limpio = valor.trim();
    if (limpio.length > max) {
        throw new AppError(`El campo ${campo} no puede superar ${max} caracteres`, 400);
    }
    return limpio;
}

export function numeroEnRango(valor, campo, min, max = MAX_ENTERO, entero = false) {
    const numero = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor;
    if (typeof numero !== 'number' || !Number.isFinite(numero)) {
        throw new AppError(`El campo ${campo} debe ser un número`, 400);
    }
    if (entero && !Number.isInteger(numero)) {
        throw new AppError(`El campo ${campo} debe ser un número entero`, 400);
    }
    if (numero < min || numero > max) {
        throw new AppError(`El campo ${campo} debe estar entre ${min} y ${max}`, 400);
    }
    return numero;
}

export function booleano(valor, campo) {
    if (typeof valor !== 'boolean') {
        throw new AppError(`El campo ${campo} debe ser verdadero o falso`, 400);
    }
    return valor;
}

export function fechaIso(valor, campo) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        throw new AppError(`El campo ${campo} debe tener formato AAAA-MM-DD`, 400);
    }
    return valor;
}

export function emailValido(valor, campo = 'email') {
    if (typeof valor !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())) {
        throw new AppError(`El campo ${campo} debe ser un correo válido`, 400);
    }
    return valor.trim().toLowerCase();
}

export function claveValida(valor) {
    if (typeof valor !== 'string' || valor.length < 6 || valor.length > 72) {
        throw new AppError('La contraseña debe tener entre 6 y 72 caracteres', 400);
    }
    return valor;
}

export function listaDeIds(valor, campo) {
    if (!Array.isArray(valor)) {
        throw new AppError(`El campo ${campo} debe ser una lista de identificadores`, 400);
    }
    const ids = valor.map(v => numeroEnRango(v, campo, 1, MAX_ENTERO, true));
    if (new Set(ids).size !== ids.length) {
        throw new AppError(`El campo ${campo} no puede tener elementos repetidos`, 409);
    }
    return ids;
}
