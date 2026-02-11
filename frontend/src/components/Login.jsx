import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseAuthError } from '../utils/authErrors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const switchTab = (loginMode) => {
    setIsLogin(loginMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const validate = () => {
    const emailTrim = email.trim();

    if (!EMAIL_REGEX.test(emailTrim)) {
      setError('Email inválido');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    const emailTrim = email.trim();
    const displayNameFallback = emailTrim.split('@')[0];

    setIsLoading(true);
    try {
      const user = isLogin
        ? await login(emailTrim, password)
        : await register(emailTrim, password, displayNameFallback);

      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(parseAuthError(err?.code));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => switchTab(true)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLogin
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => switchTab(false)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            !isLogin
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       outline-none transition-colors"
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       outline-none transition-colors"
            disabled={isLoading}
          />
        </div>

        {/* Confirm Password (solo registro) */}
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         outline-none transition-colors"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !email.trim() || password.length < 6 || (!isLogin && password !== confirmPassword)}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? 'Cargando...'
            : isLogin
              ? 'Iniciar Sesión'
              : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}

export default Login;
