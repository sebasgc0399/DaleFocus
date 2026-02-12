/**
 * PomodoroTimer.jsx - Temporizador Pomodoro
 *
 * Implementa la tecnica Pomodoro (25 min trabajo / 5 min descanso).
 * Muestra el tiempo restante y permite pausar/cancelar.
 * Al finalizar, registra la sesion en Firestore via /completeSession.
 *
 * Props: ninguno (usa AppContext para leer el paso activo y config de pomodoro)
 *
 * Estados principales:
 * - timeLeft: segundos restantes en el temporizador
 * - isRunning: si el temporizador esta activo
 * - isBreak: si estamos en periodo de descanso
 * - pomodoroCount: numero de pomodoros completados en esta sesion
 */
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { DEFAULT_POMODORO_CONFIG } from '../utils/constants';
import { completeSession } from '../services/api';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

function PomodoroTimer() {
  const { activeStep, currentTask, setCurrentScreen, setRewardMessage, replaceScreen } = useApp();

  // Configuracion del pomodoro (puede venir del perfil del usuario)
  const config = DEFAULT_POMODORO_CONFIG;

  const [timeLeft, setTimeLeft] = useState(config.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  /**
   * Efecto principal del temporizador
   * TODO: Implementar logica completa del countdown
   */
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

  /**
   * Inicia el temporizador
   */
  const handleStart = () => {
    startTimeRef.current = new Date();
    setIsRunning(true);
  };

  /**
   * Pausa el temporizador
   */
  const handlePause = () => {
    setIsRunning(false);
  };

  /**
   * Se ejecuta cuando el temporizador llega a 0
   * TODO: Registrar sesion en Firestore, generar recompensa
   */
  const handleTimerComplete = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);

    if (!isBreak) {
      // Completamos un pomodoro de trabajo
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

      // TODO: Llamar a /generateReward para obtener mensaje motivacional
      // setRewardMessage(rewardFromAPI);

      // Determinar si toca descanso largo o corto
      const isLongBreak = newCount % config.pomodorosUntilLongBreak === 0;
      const breakTime = isLongBreak ? config.longBreak : config.shortBreak;

      setIsBreak(true);
      setTimeLeft(breakTime * 60);
    } else {
      // Terminamos el descanso, volver a trabajo
      setIsBreak(false);
      setTimeLeft(config.workMinutes * 60);
    }
  };

  /**
   * Cancela la sesion actual y vuelve a la lista de pasos
   * TODO: Registrar sesion como incompleta si corresponde
   */
  const handleCancel = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);

    // Registrar sesion parcial si ya habia empezado
    if (startTimeRef.current) {
      const elapsedMinutes = Math.round(
        (new Date() - startTimeRef.current) / 60000
      );
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

  /**
   * Formatea segundos a MM:SS
   */
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-md mx-auto text-center">
      {/* Info del paso actual */}
      {activeStep && (
        <div className="mb-6">
          <p className="text-sm text-gray-500">Trabajando en:</p>
          <h3 className="text-lg font-semibold text-gray-800">{activeStep.title}</h3>
        </div>
      )}

      {/* Estado: trabajo o descanso */}
      <div className="mb-4">
        <Badge variant={isBreak ? 'break' : 'focus'}>
          {isBreak ? 'Descanso' : 'Enfoque'}
        </Badge>
      </div>

      {/* Temporizador */}
      <div className="mb-8">
        <span className="text-7xl font-mono font-bold text-gray-800">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Controles */}
      <div className="flex justify-center gap-4 mb-8">
        {!isRunning ? (
          <Button onClick={handleStart}>
            {timeLeft === config.workMinutes * 60 && !isBreak ? 'Iniciar' : 'Reanudar'}
          </Button>
        ) : (
          <Button variant="secondary" onClick={handlePause}>
            Pausar
          </Button>
        )}
        <Button variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
      </div>

      {/* Contador de pomodoros */}
      <p className="text-sm text-gray-500">
        Pomodoros completados: <span className="font-bold">{pomodoroCount}</span>
      </p>
    </div>
  );
}

export default PomodoroTimer;
