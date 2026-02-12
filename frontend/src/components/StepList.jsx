import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

function StepList() {
  const { t } = useTranslation(['task', 'common']);
  const { currentTask, setCurrentScreen, setActiveStep } = useApp();

  const steps = currentTask?.steps || [];
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const handleCompleteStep = (stepId) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  };

  const handleStartPomodoro = (step) => {
    setActiveStep(step);
    setCurrentScreen('pomodoro');
  };

  const progress = steps.length > 0
    ? Math.round((completedSteps.size / steps.length) * 100)
    : 0;

  const strategyLabel = currentTask?.strategy
    ? t(`task:strategies.${currentTask.strategy}`, { defaultValue: currentTask.strategy })
    : '--';

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {currentTask?.taskTitle || t('task:stepList.defaultTaskTitle')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('task:stepList.strategyLine', {
            strategy: strategyLabel,
            count: currentTask?.estimatedPomodoros ?? 0,
          })}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{t('task:stepList.progress', { completed: completedSteps.size, total: steps.length })}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-success h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentTask?.antiProcrastinationTip && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-primary-800 text-sm">
            {currentTask.antiProcrastinationTip}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step) => {
          const isCompleted = completedSteps.has(step.id);
          const isNext = step.id === currentTask?.nextBestActionId && !isCompleted;

          return (
            <Card
              key={step.id}
              padding="sm"
              selected={isNext}
              muted={isCompleted}
              className="flex items-start gap-4"
            >
              <button
                type="button"
                onClick={() => handleCompleteStep(step.id)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 ${
                  isCompleted
                    ? 'bg-success border-success text-white'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                aria-label={step.title}
              >
                {isCompleted && <span className="text-xs">&#10003;</span>}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isCompleted ? 'line-through' : ''}`}>
                    {step.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {t('task:stepList.minutes', { count: step.estimateMinutes })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.action}</p>

                {step.acceptanceCriteria && (
                  <ul className="text-xs text-gray-400 mt-2">
                    {step.acceptanceCriteria.map((criteria, index) => (
                      <li key={index}>- {criteria}</li>
                    ))}
                  </ul>
                )}

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleStartPomodoro(step)}
                    className="mt-3 text-sm text-primary-600 font-medium hover:text-primary-700"
                  >
                    {t('task:stepList.startPomodoro')}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        variant="secondary"
        fullWidth
        className="mt-6"
        onClick={() => setCurrentScreen('dashboard')}
      >
        {t('common:actions.viewDashboard')}
      </Button>
    </div>
  );
}

export default StepList;
