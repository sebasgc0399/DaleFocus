/**
 * App.jsx - Componente raiz de DaleFocus
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BarrierCheckIn from './components/BarrierCheckIn';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import PomodoroTimer from './components/PomodoroTimer';
import RewardPopup from './components/RewardPopup';
import Settings from './components/Settings';
import StepList from './components/StepList';
import TaskInput from './components/TaskInput';
import { BottomNav } from './components/ui/BottomNav.jsx';
import { Button } from './components/ui/Button';
import { ScreenTransition } from './components/ui/ScreenTransition.jsx';
import { useApp } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { t } = useTranslation(['common', 'navigation']);
  const { user, userProfile, loading: authLoading, logout } = useAuth();
  const {
    currentScreen,
    currentTask,
    activeStep,
    rewardMessage,
    setCurrentScreen,
    resetApp,
    goBack,
    canGoBack,
  } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const userLabel = user?.displayName || userProfile?.displayName || user?.email || t('user.defaultName');

  const handleNavigateDashboard = () => {
    setCurrentScreen('dashboard');
    setIsUserMenuOpen(false);
  };

  const handleNavigateNewTask = () => {
    setCurrentScreen('checkin');
    setIsUserMenuOpen(false);
  };

  const handleNavigateSettings = () => {
    setCurrentScreen('settings');
    setIsUserMenuOpen(false);
  };

  const handleNavigateFocus = () => {
    if (activeStep) {
      setCurrentScreen('pomodoro');
    } else if (currentTask?.steps?.length) {
      setCurrentScreen('steps');
    } else if (currentTask) {
      setCurrentScreen('task-input');
    } else {
      setCurrentScreen('checkin');
    }

    setIsUserMenuOpen(false);
  };

  const handleBottomTabChange = (tabId) => {
    if (tabId === 'dashboard') {
      handleNavigateDashboard();
      return;
    }

    handleNavigateFocus();
  };

  const activeBottomTab = currentScreen === 'dashboard' ? 'dashboard' : 'focus';

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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app">
        <p className="text-lg text-gray-500">{t('status.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-600 mb-4">{t('brand.name')}</h1>
            <p className="text-gray-600 mb-8">{t('brand.tagline')}</p>
            <Login />
          </div>
        </div>
      </div>
    );
  }

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
      case 'settings':
        return <Settings />;
      default:
        return <BarrierCheckIn />;
    }
  };

  return (
    <div className="min-h-screen bg-app">
      <header className="bg-surface-0 shadow-sm border-b border-subtle">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canGoBack && currentScreen !== 'pomodoro' && (
              <button
                type="button"
                onClick={goBack}
                aria-label={t('navigation:back')}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-bold text-primary-600">{t('brand.name')}</h1>
          </div>

          <div className="flex items-center gap-3">
            {currentScreen === 'dashboard' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateNewTask}
                className="hidden md:inline-flex"
              >
                {t('actions.newTask')}
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
                <div className="absolute right-0 mt-2 w-48 bg-surface-0 border border-subtle rounded-lg shadow-elevation-2 z-10">
                  <button
                    type="button"
                    onClick={handleNavigateSettings}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-t-lg"
                  >
                    {t('actions.settings')}
                  </button>
                  <div className="border-t border-subtle" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors duration-200 rounded-b-lg"
                  >
                    {t('actions.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-4xl mx-auto px-4 py-6 ${currentScreen !== 'pomodoro' ? 'pb-bottom-nav md:pb-6' : ''}`}>
        <ScreenTransition screenKey={currentScreen}>
          {renderScreen()}
        </ScreenTransition>
      </main>

      <BottomNav
        activeTab={activeBottomTab}
        onTabChange={handleBottomTabChange}
        hidden={currentScreen === 'pomodoro'}
      />

      {rewardMessage && <RewardPopup message={rewardMessage} />}
    </div>
  );
}

export default App;
