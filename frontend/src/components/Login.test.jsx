import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import Login from './Login';

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: authMocks.login,
    register: authMocks.register,
  }),
}));

const t = (key, options) => i18n.t(key, options);

function getForm() {
  return screen.getByLabelText(t('auth:fields.emailLabel')).closest('form');
}

function fillLoginFields({ email, password }) {
  fireEvent.change(screen.getByLabelText(t('auth:fields.emailLabel')), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(t('auth:fields.passwordLabel')), { target: { value: password } });
}

function createDeferred() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe('Login', () => {
  beforeEach(() => {
    authMocks.login.mockReset();
    authMocks.register.mockReset();
    authMocks.login.mockResolvedValue({ uid: 'user-1' });
    authMocks.register.mockResolvedValue({ uid: 'user-1' });
  });

  it('renderiza tabs y campos segun modo login/register', () => {
    render(<Login />);

    expect(screen.getByLabelText(t('auth:fields.emailLabel'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('auth:fields.passwordLabel'))).toBeInTheDocument();
    expect(screen.queryByLabelText(t('auth:fields.confirmPasswordLabel'))).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: t('auth:tabs.register') }));

    expect(screen.getByLabelText(t('auth:fields.confirmPasswordLabel'))).toBeInTheDocument();
  });

  it('muestra error cuando el email no es valido', () => {
    render(<Login />);

    fillLoginFields({ email: 'email-invalido', password: '123456' });
    fireEvent.submit(getForm());

    expect(screen.getByText(t('auth:validation.invalidEmail'))).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it('muestra mensaje cuando la contrasena tiene menos de 6 caracteres', () => {
    render(<Login />);

    fillLoginFields({ email: 'user@test.com', password: '123' });
    fireEvent.submit(getForm());

    expect(screen.getByText(t('auth:validation.weakPassword'))).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it('muestra password mismatch en registro', () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('tab', { name: t('auth:tabs.register') }));

    fillLoginFields({ email: 'user@test.com', password: '123456' });
    fireEvent.change(screen.getByLabelText(t('auth:fields.confirmPasswordLabel')), { target: { value: '654321' } });
    fireEvent.submit(getForm());

    expect(screen.getByText(t('auth:validation.passwordMismatch'))).toBeInTheDocument();
    expect(authMocks.register).not.toHaveBeenCalled();
  });

  it('muestra error parseado cuando login rechaza con auth/invalid-credential', async () => {
    authMocks.login.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    render(<Login />);

    fillLoginFields({ email: 'user@test.com', password: '123456' });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(authMocks.login).toHaveBeenCalledWith('user@test.com', '123456');
    });
    expect(await screen.findByText(t('auth:errors.invalidCredential'))).toBeInTheDocument();
  });

  it('muestra error parseado cuando register rechaza con auth/invalid-credential', async () => {
    authMocks.register.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    render(<Login />);
    fireEvent.click(screen.getByRole('tab', { name: t('auth:tabs.register') }));

    fillLoginFields({ email: 'newuser@test.com', password: '123456' });
    fireEvent.change(screen.getByLabelText(t('auth:fields.confirmPasswordLabel')), { target: { value: '123456' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(authMocks.register).toHaveBeenCalledWith('newuser@test.com', '123456', 'newuser');
    });
    expect(await screen.findByText(t('auth:errors.invalidCredential'))).toBeInTheDocument();
  });

  it('deshabilita inputs y tabs mientras isLoading esta activo', async () => {
    const deferred = createDeferred();
    authMocks.login.mockReturnValueOnce(deferred.promise);
    render(<Login />);

    fillLoginFields({ email: 'loading@test.com', password: '123456' });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByLabelText(t('auth:fields.emailLabel'))).toBeDisabled();
    });

    expect(screen.getByLabelText(t('auth:fields.passwordLabel'))).toBeDisabled();

    const tabButtons = screen.getAllByRole('tab');
    tabButtons.forEach((tab) => {
      expect(tab).toBeDisabled();
    });

    deferred.resolve({ uid: 'user-1' });

    await waitFor(() => {
      expect(screen.getByLabelText(t('auth:fields.emailLabel'))).not.toBeDisabled();
    });
  });
});
