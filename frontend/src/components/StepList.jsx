/**
 * StepList.jsx - Lista de Pasos Atomizados
 *
 * Muestra los pasos generados por la IA para la tarea actual.
 * Cada paso incluye titulo, accion, tiempo estimado y criterios de aceptacion.
 * El usuario puede marcar pasos como completados e iniciar un Pomodoro.
 *
 * Props: ninguno (usa AppContext para leer la tarea y pasos actuales)
 *
 * Estados principales:
 * - steps: lista de pasos con su estado (pending/in_progress/completed)
 * - activeStepId: ID del paso actualmente resaltado (nextBestAction)
 */
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

function StepList() {
  const { currentTask, setCurrentScreen, setActiveStep } = useApp();

  // TODO: Obtener pasos de Firestore o del contexto
  const steps = currentTask?.steps || [];
  const [completedSteps, setCompletedSteps] = useState(new Set());

  /**
   * Marca un paso como completado
   * TODO: Actualizar en Firestore (steps/{stepId}.status = 'completed')
   */
  const handleCompleteStep = (stepId) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
    // TODO: Llamar a Firestore para actualizar el estado del paso
  };

  /**
   * Inicia un Pomodoro para un paso especifico
   */
  const handleStartPomodoro = (step) => {
    setActiveStep(step);
    setCurrentScreen('pomodoro');
  };

  /**
   * Calcula el progreso general de la tarea
   */
  const progress = steps.length > 0
    ? Math.round((completedSteps.size / steps.length) * 100)
    : 0;

  return (
    <div className="max-w-lg mx-auto">
      {/* Encabezado de la tarea */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {currentTask?.taskTitle || 'Tu tarea'}
        </h2>
        <p className="text-sm text-gray-500">
          Estrategia: {currentTask?.strategy} | Pomodoros estimados: {currentTask?.estimatedPomodoros}
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{completedSteps.size} de {steps.length} pasos</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-success h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tip anti-procrastinacion */}
      {currentTask?.antiProcrastinationTip && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-primary-800 text-sm">
            {currentTask.antiProcrastinationTip}
          </p>
        </div>
      )}

      {/* Lista de pasos */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isCompleted = completedSteps.has(step.id);
          const isNext = step.id === currentTask?.nextBestActionId && !isCompleted;

          return (
            <div
              key={step.id}
              className={`card flex items-start gap-4
                ${isNext ? 'ring-2 ring-primary-400 border-primary-400' : ''}
                ${isCompleted ? 'opacity-60' : ''}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleCompleteStep(step.id)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1
                  ${isCompleted
                    ? 'bg-success border-success text-white'
                    : 'border-gray-300 hover:border-primary-400'
                  }`}
              >
                {isCompleted && <span className="text-xs">&#10003;</span>}
              </button>

              {/* Contenido del paso */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isCompleted ? 'line-through' : ''}`}>
                    {step.title}
                  </h3>
                  <span className="text-xs text-gray-400">{step.estimateMinutes} min</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.action}</p>

                {/* Criterios de aceptacion */}
                {step.acceptanceCriteria && (
                  <ul className="text-xs text-gray-400 mt-2">
                    {step.acceptanceCriteria.map((criteria, i) => (
                      <li key={i}>- {criteria}</li>
                    ))}
                  </ul>
                )}

                {/* Boton iniciar Pomodoro */}
                {!isCompleted && (
                  <button
                    onClick={() => handleStartPomodoro(step)}
                    className="mt-3 text-sm text-primary-600 font-medium hover:text-primary-700"
                  >
                    Iniciar Pomodoro
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Boton ver dashboard */}
      <button
        onClick={() => setCurrentScreen('dashboard')}
        className="btn-secondary w-full mt-6"
      >
        Ver Dashboard
      </button>
    </div>
  );
}

export default StepList;
