import { describe, expect, it } from 'vitest';
import i18n from './index';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './constants';
import {
  detectBrowserLanguage,
  getStoredLanguage,
  normalizeLanguage,
  persistLanguage,
  resolveInitialLanguage,
} from './language';

function createStorage(initialState = {}) {
  const state = { ...initialState };

  return {
    getItem(key) {
      return key in state ? state[key] : null;
    },
    setItem(key, value) {
      state[key] = value;
    },
  };
}

describe('i18n language helpers', () => {
  it('normaliza variantes regionales a idioma base', () => {
    expect(normalizeLanguage('en-US')).toBe('en');
    expect(normalizeLanguage('es-CL')).toBe('es');
  });

  it('detecta idioma soportado desde navigator.languages', () => {
    const navigatorRef = {
      languages: ['fr-FR', 'en-US'],
      language: 'es-ES',
    };

    expect(detectBrowserLanguage(navigatorRef)).toBe('en');
  });

  it('lee idioma persistido desde storage', () => {
    const storage = createStorage({ [LANGUAGE_STORAGE_KEY]: 'en' });
    expect(getStoredLanguage(storage)).toBe('en');
  });

  it('resuelve idioma inicial con prioridad storage > navegador > default', () => {
    const storage = createStorage({ [LANGUAGE_STORAGE_KEY]: 'es' });
    const navigatorRef = { language: 'en-US', languages: ['en-US'] };

    expect(resolveInitialLanguage({ storage, navigatorRef })).toBe('es');
  });

  it('usa default cuando no hay datos de storage ni navegador', () => {
    expect(resolveInitialLanguage({ storage: null, navigatorRef: null })).toBe(DEFAULT_LANGUAGE);
  });

  it('persiste idioma normalizado', () => {
    const storage = createStorage();
    persistLanguage('en-US', storage);

    expect(storage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});

describe('i18n runtime fallback', () => {
  it('cae a espanol si falta key en ingles', async () => {
    await i18n.changeLanguage('en');

    expect(i18n.t('common:meta.fallbackProbe')).toBe('Solo disponible en espanol');
  });
});
