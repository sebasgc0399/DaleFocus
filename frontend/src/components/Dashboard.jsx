/**
 * Dashboard.jsx - Panel de Metricas de Enfoque
 *
 * Muestra las metricas clave del usuario:
 * - Focus Index: promedio de pomodoros por tarea completada
 * - Time-to-Action: tiempo promedio hasta empezar una tarea (minutos)
 * - Momentum: porcentaje de pasos completados vs planificados
 * - Frecuencia de barreras en la ultima semana
 *
 * Props: ninguno (usa AppContext y datos de Firestore)
 *
 * Estados principales:
 * - metrics: objeto con las metricas calculadas
 * - isLoading: si se estan cargando las metricas
 * - timeRange: rango de tiempo seleccionado (7 dias, 30 dias, etc.)
 */
import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getUserMetrics } from '../services/api';

function Dashboard() {
  const { setCurrentScreen } = useApp();

  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carga las metricas del usuario al montar el componente
   * TODO: Llamar a Cloud Function /getUserMetrics o calcular desde Firestore
   */
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getUserMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error cargando metricas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando metricas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tu Dashboard</h2>

      {/* Metricas principales */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Focus Index */}
        <div className="card text-center">
          <span className="text-3xl mb-1 block">&#128202;</span>
          <span className="text-2xl font-bold text-primary-600 block">
            {metrics?.focusIndex?.toFixed(1) || '--'}
          </span>
          <span className="text-xs text-gray-500 block">Focus Index</span>
        </div>

        {/* Time-to-Action */}
        <div className="card text-center">
          <span className="text-3xl mb-1 block">&#9889;</span>
          <span className="text-2xl font-bold text-primary-600 block">
            {metrics?.timeToAction ? `${metrics.timeToAction}m` : '--'}
          </span>
          <span className="text-xs text-gray-500 block">Time-to-Action</span>
        </div>

        {/* Momentum */}
        <div className="card text-center">
          <span className="text-3xl mb-1 block">&#128293;</span>
          <span className="text-2xl font-bold text-primary-600 block">
            {metrics?.momentum ? `${metrics.momentum}%` : '--'}
          </span>
          <span className="text-xs text-gray-500 block">Momentum</span>
        </div>
      </div>

      {/* Frecuencia de barreras esta semana */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Barreras esta semana</h3>
        <div className="space-y-3">
          {/* TODO: Renderizar datos reales de metrics.barriers */}
          <div className="flex items-center justify-between">
            <span>&#129327; Abrumado</span>
            <span className="font-bold">{metrics?.barriers?.overwhelmed || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>&#129300; Incertidumbre</span>
            <span className="font-bold">{metrics?.barriers?.uncertain || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>&#128564; Pereza</span>
            <span className="font-bold">{metrics?.barriers?.bored || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>&#128560; Perfeccionismo</span>
            <span className="font-bold">{metrics?.barriers?.perfectionism || 0}</span>
          </div>
        </div>
      </div>

      {/* Boton volver */}
      <button
        onClick={() => setCurrentScreen('checkin')}
        className="btn-primary w-full"
      >
        Nueva tarea
      </button>
    </div>
  );
}

export default Dashboard;
