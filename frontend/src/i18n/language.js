import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from './constants';

function getWindowLocalStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage ?? null;
}

function getWindowNavigator() {
  if (typeof window === 'undefined') return null;
  return window.navigator ?? null;
}

export function normalizeLanguage(language) {
  if (typeof language !== 'string') return null;

  const trimmed = language.trim().toLowerCase();
  if (!trimmed) return null;

  const baseLanguage = trimmed.split('-')[0];
  return SUPPORTED_LANGUAGES.includes(baseLanguage) ? baseLanguage : null;
}

export function getStoredLanguage(storage = getWindowLocalStorage()) {
  if (!storage) return null;

  try {
    const storedLanguage = storage.getItem(LANGUAGE_STORAGE_KEY);
    return normalizeLanguage(storedLanguage);
  } catch {
    return null;
  }
}

export function detectBrowserLanguage(navigatorRef = getWindowNavigator()) {
  if (!navigatorRef) return null;

  const languageCandidates = [
    ...(Array.isArray(navigatorRef.languages) ? navigatorRef.languages : []),
    navigatorRef.language,
  ]
    .filter(Boolean);

  for (const candidate of languageCandidates) {
    const normalized = normalizeLanguage(candidate);
    if (normalized) return normalized;
  }

  return null;
}

export function resolveInitialLanguage({ storage, navigatorRef } = {}) {
  return (
    getStoredLanguage(storage) ||
    detectBrowserLanguage(navigatorRef) ||
    DEFAULT_LANGUAGE
  );
}

export function persistLanguage(language, storage = getWindowLocalStorage()) {
  const normalized = normalizeLanguage(language);
  if (!storage || !normalized) return;

  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch {
    // Ignore storage write errors (private mode, blocked storage, etc).
  }
}
