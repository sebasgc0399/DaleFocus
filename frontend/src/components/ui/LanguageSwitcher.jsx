import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Card } from './Card';

const LANGUAGE_OPTIONS = ['es', 'en'];

function normalizeCurrentLanguage(language) {
  if (typeof language !== 'string') return 'es';

  const baseLanguage = language.toLowerCase().split('-')[0];
  return LANGUAGE_OPTIONS.includes(baseLanguage) ? baseLanguage : 'es';
}

function LanguageSwitcher({ className = '' }) {
  const { t, i18n } = useTranslation('common');

  const currentLanguage = normalizeCurrentLanguage(i18n.resolvedLanguage || i18n.language);

  const handleChangeLanguage = (language) => {
    if (language === currentLanguage) return;
    void i18n.changeLanguage(language);
  };

  const handleKeyDown = (event, index) => {
    let nextIndex = -1;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % LANGUAGE_OPTIONS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = LANGUAGE_OPTIONS.length - 1;
    }

    if (nextIndex >= 0) {
      event.preventDefault();
      handleChangeLanguage(LANGUAGE_OPTIONS[nextIndex]);
    }
  };

  return (
    <Card
      padding="sm"
      className={`inline-flex items-center gap-1 rounded-full border border-subtle bg-surface-1 p-1 shadow-none ${className}`}
      role="radiogroup"
      aria-label={t('language.selectorLabel')}
    >
      {LANGUAGE_OPTIONS.map((language, index) => {
        const isSelected = language === currentLanguage;

        return (
          <Button
            key={language}
            type="button"
            size="sm"
            variant="ghost"
            role="radio"
            aria-checked={isSelected}
            aria-label={t(`language.options.${language}`)}
            tabIndex={isSelected ? 0 : -1}
            className={`min-w-11 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
              isSelected
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            onClick={() => handleChangeLanguage(language)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {t(`language.short.${language}`)}
          </Button>
        );
      })}
    </Card>
  );
}

export { LanguageSwitcher };
