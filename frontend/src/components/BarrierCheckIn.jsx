/**
 * BarrierCheckIn.jsx - Check-in Emocional
 *
 * Primera pantalla del flujo principal. El usuario selecciona
 * su barrera emocional actual antes de crear una tarea.
 *
 * Barreras disponibles:
 * - overwhelmed (Abrumado)    -> estrategia: micro_wins
 * - uncertain   (Incierto)    -> estrategia: structured_exploration
 * - bored       (Aburrido)    -> estrategia: quick_momentum
 * - perfectionism (Perfeccionismo) -> estrategia: good_enough_iterations
 *
 * Props: ninguno (usa AppContext para setear la barrera seleccionada)
 *
 * Estados principales:
 * - selectedBarrier: barrera actualmente seleccionada (o null)
 */
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { BARRIERS } from '../utils/constants';

function BarrierCheckIn() {
  const [selectedBarrier, setSelectedBarrier] = useState(null);
  const { setBarrier, setCurrentScreen } = useApp();

  /**
   * Maneja la seleccion de una barrera y avanza a la siguiente pantalla
   */
  const handleSelect = (barrierId) => {
    setSelectedBarrier(barrierId);
  };

  const handleContinue = () => {
    if (!selectedBarrier) return;

    // TODO: Guardar la barrera en el contexto global
    setBarrier(selectedBarrier);
    setCurrentScreen('task-input');
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Como te sientes ahora?
        </h2>
        <p className="text-gray-500">
          Selecciona la barrera que mejor describe lo que sientes ante tu tarea
        </p>
      </div>

      {/* Grid de barreras */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {BARRIERS.map((barrier) => (
          <button
            key={barrier.id}
            onClick={() => handleSelect(barrier.id)}
            className={`card text-center p-6 cursor-pointer transition-all duration-200
              ${selectedBarrier === barrier.id
                ? 'ring-2 ring-primary-500 border-primary-500 scale-105'
                : 'hover:shadow-md hover:scale-102'
              }`}
          >
            <span className="text-4xl mb-3 block">{barrier.emoji}</span>
            <span className="font-semibold text-gray-800 block">{barrier.label}</span>
            <span className="text-sm text-gray-500 mt-1 block">{barrier.description}</span>
          </button>
        ))}
      </div>

      {/* Boton continuar */}
      <button
        onClick={handleContinue}
        disabled={!selectedBarrier}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar
      </button>
    </div>
  );
}

export default BarrierCheckIn;
