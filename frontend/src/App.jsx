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
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import BarrierCheckIn from './components/BarrierCheckIn';
import TaskInput from './components/TaskInput';
import StepList from './components/StepList';
import PomodoroTimer from './components/PomodoroTimer';
import Dashboard from './components/Dashboard';
import RewardPopup from './components/RewardPopup';
import Login from './components/Login';
import { Button } from './components/ui/Button';

function App() {
  const { user, userProfile, loading: authLoading, logout } = useAuth();
  const { currentScreen, rewardMessage, setCurrentScreen, resetApp } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const userLabel = user?.displayName || userProfile?.displayName || user?.email || 'Usuario';

  const handleNavigateDashboard = () => {
    setCurrentScreen('dashboard');
    setIsUserMenuOpen(false);
  };

  const handleNavigateNewTask = () => {
    setCurrentScreen('checkin');
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      resetApp();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesion:', error);
    }
  };

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    const handleMouseDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  // Pantalla de carga mientras se verifica autenticacion
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">DaleFocus</h1>
          <p className="text-gray-600 mb-8">Atomiza tus tareas con IA</p>
          <Login />
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
          <div className="flex items-center gap-3">
            {currentScreen !== 'dashboard' ? (
              <Button variant="ghost" size="sm" onClick={handleNavigateDashboard}>
                Dashboard
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleNavigateNewTask}>
                Nueva tarea
              </Button>
            )}

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors max-w-40 truncate"
              >
                {userLabel}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 truncate">
                    {userLabel}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
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
