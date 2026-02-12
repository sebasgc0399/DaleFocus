import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import { Card } from './ui/Card';

function Settings() {
  const { t } = useTranslation('common');

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{t('actions.settings')}</h2>
        <p className="text-gray-500 mt-1">{t('brand.name')}</p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">{t('language.selectorLabel')}</p>
            <p className="text-sm text-gray-500">{t('language.settingsHint')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </Card>

      <div className="text-center py-12 text-gray-400">
        <span className="text-4xl block mb-4">&#9881;</span>
        <p className="text-sm">{t('status.comingSoon')}</p>
      </div>
    </div>
  );
}

export default Settings;
