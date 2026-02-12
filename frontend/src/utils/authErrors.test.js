import { describe, expect, it } from 'vitest';
import { parseAuthError } from './authErrors';

describe('parseAuthError', () => {
  it.each([
    ['auth/invalid-email', 'Email inválido'],
    ['auth/invalid-credential', 'Email o contraseña incorrectos'],
    ['auth/weak-password', 'La contraseña debe tener al menos 6 caracteres'],
    ['auth/email-already-in-use', 'Este email ya está registrado'],
  ])('devuelve mensaje correcto para %s', (errorCode, expectedMessage) => {
    expect(parseAuthError(errorCode)).toBe(expectedMessage);
  });

  it.each([
    [undefined],
    [null],
    ['auth/codigo-desconocido'],
  ])('usa fallback para códigos inválidos: %s', (errorCode) => {
    expect(parseAuthError(errorCode)).toBe('Error al autenticar');
  });
});
