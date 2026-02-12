const AUTH_ERROR_KEYS = {
  'auth/invalid-email': 'auth:errors.invalidEmail',
  'auth/user-not-found': 'auth:errors.userNotFound',
  'auth/wrong-password': 'auth:errors.wrongPassword',
  'auth/invalid-credential': 'auth:errors.invalidCredential',
  'auth/weak-password': 'auth:errors.weakPassword',
  'auth/email-already-in-use': 'auth:errors.emailAlreadyInUse',
};

export function parseAuthError(errorCode) {
  return AUTH_ERROR_KEYS[errorCode] || 'auth:errors.unknown';
}
