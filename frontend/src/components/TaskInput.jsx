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
import { atomizeTask } from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

function TaskInput() {
  const [taskTitle, setTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { barrier, setCurrentTask, setCurrentScreen } = useApp();

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
      const result = await atomizeTask({
        taskTitle: taskTitle.trim(),
        barrier,
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

      <Card>
        <form onSubmit={handleSubmit}>
          {/* Input de tarea */}
          <Input
            id="taskTitle"
            type="text"
            label="Titulo de la tarea"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Ej: Preparar presentacion de ventas"
            disabled={isLoading}
            maxLength={200}
            className="mb-6"
          />

          {/* Indicador de barrera seleccionada */}
          <p className="text-sm text-gray-500 mb-4">
            Barrera seleccionada: <span className="font-semibold">{barrier}</span>
          </p>

          {/* Mensaje de error */}
          {error && (
            <div className="alert-error mb-4 text-sm">{error}</div>
          )}

          {/* Boton de envio */}
          <Button
            type="submit"
            fullWidth
            disabled={!taskTitle.trim() || isLoading}
          >
            {isLoading ? 'Generando plan...' : 'Atomizar tarea'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default TaskInput;
