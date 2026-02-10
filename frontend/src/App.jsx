/**
 * App.jsx - Componente raiz de DaleFocus
 *
 * Maneja la navegacion condicional entre pantallas:
 * - Login/Register (si no esta autenticado)
 * - BarrierCheckIn -> TaskInput -> StepList -> PomodoroTimer (flujo principal)
 * - Dashboard (metricas)
 *
 * Usa Context API para determinar el estado actual del usuario
 * y que pantalla mostrar.
 */
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import BarrierCheckIn from './components/BarrierCheckIn';
import TaskInput from './components/TaskInput';
import StepList from './components/StepList';
import PomodoroTimer from './components/PomodoroTimer';
import Dashboard from './components/Dashboard';
import RewardPopup from './components/RewardPopup';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { currentScreen, rewardMessage } = useApp();

  // Pantalla de carga mientras se verifica autenticacion
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Cargando...</p>
      </div>
    );
  }

  // TODO: Implementar pantalla de Login/Register
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">DaleFocus</h1>
          <p className="text-gray-600 mb-8">Atomiza tus tareas con IA</p>
          {/* TODO: Componente de Login/Register con Firebase Auth */}
        </div>
      </div>
    );
  }

  // Renderizado condicional segun la pantalla activa
  const renderScreen = () => {
    switch (currentScreen) {
      case 'checkin':
        return <BarrierCheckIn />;
      case 'task-input':
        return <TaskInput />;
      case 'steps':
        return <StepList />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <BarrierCheckIn />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">DaleFocus</h1>
          {/* TODO: Navegacion y boton de perfil/logout */}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {renderScreen()}
      </main>

      {/* Popup de recompensa (se muestra sobre cualquier pantalla) */}
      {rewardMessage && <RewardPopup message={rewardMessage} />}
    </div>
  );
}

export default App;
