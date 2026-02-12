import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseAuthError } from '../utils/authErrors';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { SegmentedTabs } from './ui/SegmentedTabs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOGIN_TABS = [
  { id: 'login', label: 'Iniciar Sesión' },
  { id: 'register', label: 'Registrarse' },
];

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
      <div className="mb-6">
        <SegmentedTabs
          tabs={LOGIN_TABS}
          activeTab={isLogin ? 'login' : 'register'}
          onChange={(tabId) => switchTab(tabId === 'login')}
          disabled={isLoading}
          ariaLabel="Modo de autenticación"
        />
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="text-left">
          {/* Error */}
          {error && (
            <div className="alert-error mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            disabled={isLoading}
            className="mb-4"
          />

          {/* Password */}
          <Input
            id="password"
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            disabled={isLoading}
            className="mb-4"
          />

          {/* Confirm Password (solo registro) */}
          {!isLogin && (
            <Input
              id="confirmPassword"
              type="password"
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              disabled={isLoading}
              className="mb-4"
            />
          )}

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={!email.trim() || password.length < 6 || (!isLogin && password !== confirmPassword)}
          >
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Login;
