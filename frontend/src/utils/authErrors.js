const AUTH_ERRORS = {
  'auth/invalid-email': 'Email inválido',
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-credential': 'Email o contraseña incorrectos',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/email-already-in-use': 'Este email ya está registrado',
};

export function parseAuthError(errorCode) {
  return AUTH_ERRORS[errorCode] || 'Error al autenticar';
}
