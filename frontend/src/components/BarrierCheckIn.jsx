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
import { Button } from './ui/Button';
import { Card } from './ui/Card';

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(barrier.id);
                }
              }}
            >
              <span className="text-4xl mb-3 block">{barrier.emoji}</span>
              <span className="font-semibold text-gray-800 block">{barrier.label}</span>
              <span className="text-sm text-gray-500 mt-1 block">{barrier.description}</span>
            </Card>
          );
        })}
      </div>

      {/* Boton continuar */}
      <Button fullWidth onClick={handleContinue} disabled={!selectedBarrier}>
        Continuar
      </Button>
    </div>
  );
}

export default BarrierCheckIn;
