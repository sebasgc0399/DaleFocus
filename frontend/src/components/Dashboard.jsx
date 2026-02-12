import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { getUserMetrics } from '../services/api';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { setCurrentScreen } = useApp();

  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getUserMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error cargando metricas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('dashboard:loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('dashboard:title')}</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card padding="sm" className="text-center">
          <span className="text-3xl mb-1 block">&#128202;</span>
          <span className="text-2xl font-bold text-primary-600 block">
            {metrics?.focusIndex?.toFixed(1) || '--'}
          </span>
          <span className="text-xs text-gray-500 block">{t('dashboard:metrics.focusIndex')}</span>
        </Card>

        <Card padding="sm" className="text-center">
          <span className="text-3xl mb-1 block">&#9889;</span>
          <span className="text-2xl font-bold text-primary-600 block">
            {metrics?.timeToAction
              ? t('dashboard:metrics.timeMinutes', { value: metrics.timeToAction })
              : '--'}
          </span>
          <span className="text-xs text-gray-500 block">{t('dashboard:metrics.timeToAction')}</span>
        </Card>

        <Card padding="sm" className="text-center">
          <span className="text-3xl mb-1 block">&#128293;</span>
          <span className="text-2xl font-bold text-primary-600 block">
            {metrics?.momentum ? `${metrics.momentum}%` : '--'}
          </span>
          <span className="text-xs text-gray-500 block">{t('dashboard:metrics.momentum')}</span>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">{t('dashboard:barriersThisWeek')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>&#129327; {t('dashboard:barriers.overwhelmed')}</span>
            <span className="font-bold">{metrics?.barriers?.overwhelmed || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>&#129300; {t('dashboard:barriers.uncertain')}</span>
            <span className="font-bold">{metrics?.barriers?.uncertain || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>&#128564; {t('dashboard:barriers.bored')}</span>
            <span className="font-bold">{metrics?.barriers?.bored || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>&#128560; {t('dashboard:barriers.perfectionism')}</span>
            <span className="font-bold">{metrics?.barriers?.perfectionism || 0}</span>
          </div>
        </div>
      </Card>

      <Button fullWidth onClick={() => setCurrentScreen('checkin')}>
        {t('common:actions.newTask')}
      </Button>
    </div>
  );
}

export default Dashboard;
