import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { BARRIERS } from '../utils/constants';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

function BarrierCheckIn() {
  const { t } = useTranslation(['task', 'common']);
  const [selectedBarrier, setSelectedBarrier] = useState(null);
  const { setBarrier, setCurrentScreen } = useApp();

  const handleSelect = (barrierId) => {
    setSelectedBarrier(barrierId);
  };

  const handleContinue = () => {
    if (!selectedBarrier) return;

    setBarrier(selectedBarrier);
    setCurrentScreen('task-input');
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('task:checkIn.title')}
        </h2>
        <p className="text-gray-500">
          {t('task:checkIn.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {BARRIERS.map((barrier) => {
          const isSelected = selectedBarrier === barrier.id;
          return (
            <Card
              key={barrier.id}
              selected={isSelected}
              className={`text-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isSelected ? 'scale-105' : 'hover:shadow-md hover:scale-[1.02]'
              }`}
              onClick={() => handleSelect(barrier.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleSelect(barrier.id);
                }
              }}
            >
              <span className="text-4xl mb-3 block">{barrier.emoji}</span>
              <span className="font-semibold text-gray-800 block">{t(`task:barriers.${barrier.id}.label`)}</span>
              <span className="text-sm text-gray-500 mt-1 block">{t(`task:barriers.${barrier.id}.description`)}</span>
            </Card>
          );
        })}
      </div>

      <Button fullWidth onClick={handleContinue} disabled={!selectedBarrier}>
        {t('common:actions.continue')}
      </Button>
    </div>
  );
}

export default BarrierCheckIn;
