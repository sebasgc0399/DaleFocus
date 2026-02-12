import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { completeSession } from '../services/api';
import { DEFAULT_POMODORO_CONFIG } from '../utils/constants';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

function PomodoroTimer() {
  const { t } = useTranslation(['pomodoro', 'common']);
  const { activeStep, currentTask, replaceScreen } = useApp();

  const config = DEFAULT_POMODORO_CONFIG;

  const [timeLeft, setTimeLeft] = useState(config.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    startTimeRef.current = new Date();
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);

    if (!isBreak) {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      try {
        await completeSession({
          taskId: currentTask?.taskId || null,
          stepId: activeStep?.id || null,
          durationMinutes: config.workMinutes,
          completed: true,
        });
      } catch (err) {
        console.error('Error registrando sesion:', err);
      }

      const isLongBreak = newCount % config.pomodorosUntilLongBreak === 0;
      const breakTime = isLongBreak ? config.longBreak : config.shortBreak;

      setIsBreak(true);
      setTimeLeft(breakTime * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(config.workMinutes * 60);
    }
  };

  const handleCancel = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);

    if (startTimeRef.current) {
      const elapsedMinutes = Math.round((new Date() - startTimeRef.current) / 60000);
      try {
        await completeSession({
          taskId: currentTask?.taskId || null,
          stepId: activeStep?.id || null,
          durationMinutes: elapsedMinutes,
          completed: false,
        });
      } catch (err) {
        console.error('Error registrando sesion parcial:', err);
      }
    }

    replaceScreen('steps');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secondsLabel = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secondsLabel}`;
  };

  return (
    <div className="max-w-md mx-auto text-center">
      {activeStep && (
        <div className="mb-6">
          <p className="text-sm text-gray-500">{t('pomodoro:workingOn')}</p>
          <h3 className="text-lg font-semibold text-gray-800">{activeStep.title}</h3>
        </div>
      )}

      <div className="mb-4">
        <Badge variant={isBreak ? 'break' : 'focus'}>
          {isBreak ? t('pomodoro:status.break') : t('pomodoro:status.focus')}
        </Badge>
      </div>

      <div className="mb-8">
        <span className="text-7xl font-mono font-bold text-gray-800">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        {!isRunning ? (
          <Button onClick={handleStart}>
            {timeLeft === config.workMinutes * 60 && !isBreak
              ? t('pomodoro:controls.start')
              : t('pomodoro:controls.resume')}
          </Button>
        ) : (
          <Button variant="secondary" onClick={handlePause}>
            {t('pomodoro:controls.pause')}
          </Button>
        )}
        <Button variant="secondary" onClick={handleCancel}>
          {t('pomodoro:controls.cancel')}
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        {t('pomodoro:completedCount', { count: pomodoroCount })}
      </p>
    </div>
  );
}

export default PomodoroTimer;
