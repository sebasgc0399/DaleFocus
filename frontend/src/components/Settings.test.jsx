import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import Settings from './Settings';
import i18n from '../i18n';
import { LANGUAGE_STORAGE_KEY } from '../i18n/constants';

const t = (key, options) => i18n.t(key, options);

describe('Settings language switcher', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renderiza el radiogroup y deja espanol seleccionado por defecto', () => {
    render(<Settings />);

    const group = screen.getByRole('radiogroup', { name: t('common:language.selectorLabel') });
    const esRadio = screen.getByRole('radio', { name: t('common:language.options.es') });
    const enRadio = screen.getByRole('radio', { name: t('common:language.options.en') });

    expect(group).toBeInTheDocument();
    expect(esRadio).toHaveAttribute('aria-checked', 'true');
    expect(enRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('cambia a ingles y persiste la preferencia en localStorage', async () => {
    render(<Settings />);

    const enRadio = screen.getByRole('radio', { name: t('common:language.options.en') });
    fireEvent.click(enRadio);

    await waitFor(() => {
      expect(enRadio).toHaveAttribute('aria-checked', 'true');
    });

    expect((i18n.resolvedLanguage || i18n.language).startsWith('en')).toBe(true);
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('soporta flechas y mueve el foco al siguiente radio', async () => {
    render(<Settings />);

    const esRadio = screen.getByRole('radio', { name: t('common:language.options.es') });
    const enRadio = screen.getByRole('radio', { name: t('common:language.options.en') });

    esRadio.focus();
    fireEvent.keyDown(esRadio, { key: 'ArrowRight' });

    expect(enRadio).toHaveFocus();
    await waitFor(() => {
      expect(enRadio).toHaveAttribute('aria-checked', 'true');
    });
  });
});
