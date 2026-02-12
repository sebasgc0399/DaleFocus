import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

function getForm() {
  return screen.getByLabelText('Email').closest('form');
}

function fillLoginFields({ email, password }) {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
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

  it('renderiza tabs y campos según modo login/register', () => {
    render(<Login />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirmar Contraseña')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
  });

  it('muestra "Email inválido" cuando el email no es válido', () => {
    render(<Login />);

    fillLoginFields({ email: 'email-invalido', password: '123456' });
    fireEvent.submit(getForm());

    expect(screen.getByText('Email inválido')).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it('muestra mensaje cuando la contraseña tiene menos de 6 caracteres', () => {
    render(<Login />);

    fillLoginFields({ email: 'user@test.com', password: '123' });
    fireEvent.submit(getForm());

    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it('muestra "Las contraseñas no coinciden" en registro', () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    fillLoginFields({ email: 'user@test.com', password: '123456' });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: '654321' } });
    fireEvent.submit(getForm());

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
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
    expect(await screen.findByText('Email o contraseña incorrectos')).toBeInTheDocument();
  });

  it('muestra error parseado cuando register rechaza con auth/invalid-credential', async () => {
    authMocks.register.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    fillLoginFields({ email: 'newuser@test.com', password: '123456' });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: '123456' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(authMocks.register).toHaveBeenCalledWith('newuser@test.com', '123456', 'newuser');
    });
    expect(await screen.findByText('Email o contraseña incorrectos')).toBeInTheDocument();
  });

  it('deshabilita inputs y tabs mientras isLoading está activo', async () => {
    const deferred = createDeferred();
    authMocks.login.mockReturnValueOnce(deferred.promise);
    render(<Login />);

    fillLoginFields({ email: 'loading@test.com', password: '123456' });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeDisabled();
    });

    expect(screen.getByLabelText('Contraseña')).toBeDisabled();

    const tabButtons = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('type') === 'button');

    tabButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    deferred.resolve({ uid: 'user-1' });

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).not.toBeDisabled();
    });
  });
});
