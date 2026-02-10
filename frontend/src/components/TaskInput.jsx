/**
 * TaskInput.jsx - Ingreso de Tarea
 *
 * Pantalla donde el usuario escribe el titulo de su tarea
 * para que la IA la atomice en pasos concretos.
 *
 * Props: ninguno (usa AppContext para leer la barrera y enviar la tarea)
 *
 * Estados principales:
 * - taskTitle: texto de la tarea ingresada
 * - isLoading: indica si la IA esta procesando la atomizacion
 * - error: mensaje de error si falla la llamada a la IA
 */
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { atomizeTask } from '../services/api';

function TaskInput() {
  const [taskTitle, setTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { barrier, setCurrentTask, setCurrentScreen } = useApp();
  const { user } = useAuth();

  /**
   * Envia la tarea a la Cloud Function /atomizeTask
   * para generar los pasos atomizados con GPT-5.1
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Llamar a la Cloud Function /atomizeTask
      const result = await atomizeTask({
        taskTitle: taskTitle.trim(),
        barrier,
        userId: user.uid,
      });

      // Guardar la tarea y sus pasos en el contexto
      setCurrentTask(result);
      setCurrentScreen('steps');
    } catch (err) {
      setError('Hubo un error al generar tu plan. Intenta de nuevo.');
      console.error('Error atomizing task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Cual es tu tarea?
        </h2>
        <p className="text-gray-500">
          Describe lo que necesitas hacer y la IA creara un plan paso a paso
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {/* Input de tarea */}
        <div className="mb-6">
          <label
            htmlFor="taskTitle"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Titulo de la tarea
          </label>
          <input
            id="taskTitle"
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Ej: Preparar presentacion de ventas"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       outline-none transition-colors"
            disabled={isLoading}
            maxLength={200}
          />
        </div>

        {/* Indicador de barrera seleccionada */}
        <p className="text-sm text-gray-500 mb-4">
          Barrera seleccionada: <span className="font-semibold">{barrier}</span>
        </p>

        {/* Mensaje de error */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Boton de envio */}
        <button
          type="submit"
          disabled={!taskTitle.trim() || isLoading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generando plan...' : 'Atomizar tarea'}
        </button>
      </form>
    </div>
  );
}

export default TaskInput;
