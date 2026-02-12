import { describe, expect, it } from 'vitest';
import { parseAuthError } from './authErrors';

describe('parseAuthError', () => {
  it.each([
    ['auth/invalid-email', 'auth:errors.invalidEmail'],
    ['auth/invalid-credential', 'auth:errors.invalidCredential'],
    ['auth/weak-password', 'auth:errors.weakPassword'],
    ['auth/email-already-in-use', 'auth:errors.emailAlreadyInUse'],
  ])('devuelve key correcta para %s', (errorCode, expectedKey) => {
    expect(parseAuthError(errorCode)).toBe(expectedKey);
  });

  it.each([
    [undefined],
    [null],
    ['auth/codigo-desconocido'],
  ])('usa fallback para codigos invalidos: %s', (errorCode) => {
    expect(parseAuthError(errorCode)).toBe('auth:errors.unknown');
  });
});
