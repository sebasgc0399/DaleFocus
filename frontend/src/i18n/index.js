import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './constants';
import { persistLanguage, resolveInitialLanguage } from './language';

import commonEs from './locales/es/common.json';
import authEs from './locales/es/auth.json';
import dashboardEs from './locales/es/dashboard.json';
import taskEs from './locales/es/task.json';
import pomodoroEs from './locales/es/pomodoro.json';
import navigationEs from './locales/es/navigation.json';

import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import dashboardEn from './locales/en/dashboard.json';
import taskEn from './locales/en/task.json';
import pomodoroEn from './locales/en/pomodoro.json';
import navigationEn from './locales/en/navigation.json';

const resources = {
  es: {
    common: commonEs,
    auth: authEs,
    dashboard: dashboardEs,
    task: taskEs,
    pomodoro: pomodoroEs,
    navigation: navigationEs,
  },
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    task: taskEn,
    pomodoro: pomodoroEn,
    navigation: navigationEn,
  },
};

if (!i18n.isInitialized) {
  const initialLanguage = resolveInitialLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      nonExplicitSupportedLngs: true,
      load: 'languageOnly',
      ns: ['common', 'auth', 'dashboard', 'task', 'pomodoro', 'navigation'],
      defaultNS: 'common',
      fallbackNS: 'common',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      debug: import.meta.env.DEV && import.meta.env.MODE !== 'test',
      returnNull: false,
      returnEmptyString: false,
    });

  i18n.on('languageChanged', (language) => {
    persistLanguage(language);
  });
}

export default i18n;
