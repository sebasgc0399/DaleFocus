import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

function RewardPopup({ message }) {
  const { t } = useTranslation('common');
  const { setRewardMessage } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setRewardMessage(null);
    }, 300);
  };

  useEffect(() => {
    const autoClose = setTimeout(handleClose, 6000);
    return () => clearTimeout(autoClose);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-40' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      <Card
        padding="lg"
        className={`relative max-w-sm w-full rounded-2xl shadow-xl text-center transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <span className="text-5xl block mb-4">&#127881;</span>

        <p className="text-lg font-medium text-gray-800 mb-6">
          {message}
        </p>

        <Button onClick={handleClose}>
          {t('actions.follow')}
        </Button>
      </Card>
    </div>
  );
}

export default RewardPopup;
