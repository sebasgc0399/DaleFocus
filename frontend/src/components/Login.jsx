import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { parseAuthError } from '../utils/authErrors';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { SegmentedTabs } from './ui/SegmentedTabs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login({ onSuccess }) {
  const { t } = useTranslation(['auth', 'common']);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const loginTabs = useMemo(
    () => [
      { id: 'login', label: t('auth:tabs.login') },
      { id: 'register', label: t('auth:tabs.register') },
    ],
    [t],
  );

  const switchTab = (loginMode) => {
    setIsLogin(loginMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const validate = () => {
    const emailTrim = email.trim();

    if (!EMAIL_REGEX.test(emailTrim)) {
      setError('auth:validation.invalidEmail');
      return false;
    }

    if (password.length < 6) {
      setError('auth:validation.weakPassword');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('auth:validation.passwordMismatch');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      <div className="mb-6">
        <SegmentedTabs
          tabs={loginTabs}
          activeTab={isLogin ? 'login' : 'register'}
          onChange={(tabId) => switchTab(tabId === 'login')}
          disabled={isLoading}
          ariaLabel={t('auth:aria.mode')}
        />
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="text-left">
          {error && (
            <div className="alert-error mb-4 text-sm">
              {t(error)}
            </div>
          )}

          <Input
            id="email"
            type="email"
            label={t('auth:fields.emailLabel')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('auth:fields.emailPlaceholder')}
            autoComplete="email"
            disabled={isLoading}
            className="mb-4"
          />

          <Input
            id="password"
            type="password"
            label={t('auth:fields.passwordLabel')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('auth:fields.passwordPlaceholder')}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            disabled={isLoading}
            className="mb-4"
          />

          {!isLogin && (
            <Input
              id="confirmPassword"
              type="password"
              label={t('auth:fields.confirmPasswordLabel')}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t('auth:fields.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              disabled={isLoading}
              className="mb-4"
            />
          )}

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            loadingText={t('common:status.loading')}
            disabled={!email.trim() || password.length < 6 || (!isLogin && password !== confirmPassword)}
          >
            {isLogin ? t('auth:submit.login') : t('auth:submit.register')}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Login;
