import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { atomizeTask } from '../services/api';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';

function TaskInput() {
  const { t } = useTranslation(['task', 'common']);
  const [taskTitle, setTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { barrier, setCurrentTask, setCurrentScreen } = useApp();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await atomizeTask({
        taskTitle: taskTitle.trim(),
        barrier,
      });

      setCurrentTask(result);
      setCurrentScreen('steps');
    } catch (err) {
      setError('task.errors.atomizeFailed');
      console.error('Error atomizing task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('task:input.title')}
        </h2>
        <p className="text-gray-500">
          {t('task:input.subtitle')}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            id="taskTitle"
            type="text"
            label={t('task:input.taskLabel')}
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder={t('task:input.taskPlaceholder')}
            disabled={isLoading}
            maxLength={200}
            className="mb-6"
          />

          <p className="text-sm text-gray-500 mb-4">
            {t('task:input.selectedBarrier', {
              barrier: barrier ? t(`task:barriers.${barrier}.label`) : '--',
            })}
          </p>

          {error && (
            <div className="alert-error mb-4 text-sm">{t(error)}</div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            loadingText={t('task:submit.generating')}
            disabled={!taskTitle.trim() || isLoading}
          >
            {t('task:submit.atomize')}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default TaskInput;
