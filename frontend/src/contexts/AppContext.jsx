/**
 * AppContext.jsx - Contexto Global de la Aplicacion
 *
 * Maneja el estado global de la app usando useReducer:
 * - currentScreen: pantalla activa (checkin, task-input, steps, pomodoro, dashboard)
 * - barrier: barrera emocional seleccionada en el check-in
 * - currentTask: tarea actual con sus pasos atomizados
 * - activeStep: paso actualmente en progreso (para el Pomodoro)
 * - rewardMessage: mensaje motivacional a mostrar en el popup
 *
 * Uso: envolver la app con <AppProvider> y consumir con useApp()
 */
import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

/**
 * Hook para consumir el contexto de la app
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}

// Estado inicial de la aplicacion
export const initialState = {
  currentScreen: 'checkin',  // Pantalla activa
  barrier: null,              // Barrera emocional seleccionada
  currentTask: null,          // Tarea actual con pasos de la IA
  activeStep: null,           // Paso activo para el Pomodoro
  rewardMessage: null,        // Mensaje motivacional a mostrar
  navigationHistory: [],      // Stack de pantallas anteriores para back navigation
};

// Tipos de accion del reducer
export const ActionTypes = {
  SET_SCREEN: 'SET_SCREEN',
  GO_BACK: 'GO_BACK',
  REPLACE_SCREEN: 'REPLACE_SCREEN',
  SET_BARRIER: 'SET_BARRIER',
  SET_CURRENT_TASK: 'SET_CURRENT_TASK',
  SET_ACTIVE_STEP: 'SET_ACTIVE_STEP',
  SET_REWARD_MESSAGE: 'SET_REWARD_MESSAGE',
  RESET: 'RESET',
};

/**
 * Reducer principal de la aplicacion
 */
export function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SCREEN: {
      const newHistory = [...state.navigationHistory, state.currentScreen];
      if (newHistory.length > 10) newHistory.shift();
      return { ...state, currentScreen: action.payload, navigationHistory: newHistory };
    }

    case ActionTypes.GO_BACK: {
      if (state.navigationHistory.length === 0) return state;
      const newHistory = state.navigationHistory.slice(0, -1);
      return { ...state, currentScreen: state.navigationHistory.at(-1), navigationHistory: newHistory };
    }

    case ActionTypes.REPLACE_SCREEN:
      return { ...state, currentScreen: action.payload };

    case ActionTypes.SET_BARRIER:
      return { ...state, barrier: action.payload };

    case ActionTypes.SET_CURRENT_TASK:
      return { ...state, currentTask: action.payload };

    case ActionTypes.SET_ACTIVE_STEP:
      return { ...state, activeStep: action.payload };

    case ActionTypes.SET_REWARD_MESSAGE:
      return { ...state, rewardMessage: action.payload };

    case ActionTypes.RESET:
      return initialState;

    default:
      return state;
  }
}

/**
 * Provider del estado global de la app
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Funciones de conveniencia para dispatch
  const setCurrentScreen = (screen) =>
    dispatch({ type: ActionTypes.SET_SCREEN, payload: screen });

  const setBarrier = (barrier) =>
    dispatch({ type: ActionTypes.SET_BARRIER, payload: barrier });

  const setCurrentTask = (task) =>
    dispatch({ type: ActionTypes.SET_CURRENT_TASK, payload: task });

  const setActiveStep = (step) =>
    dispatch({ type: ActionTypes.SET_ACTIVE_STEP, payload: step });

  const setRewardMessage = (message) =>
    dispatch({ type: ActionTypes.SET_REWARD_MESSAGE, payload: message });

  const goBack = () =>
    dispatch({ type: ActionTypes.GO_BACK });

  const replaceScreen = (screen) =>
    dispatch({ type: ActionTypes.REPLACE_SCREEN, payload: screen });

  const resetApp = () =>
    dispatch({ type: ActionTypes.RESET });

  const value = {
    ...state,
    setCurrentScreen,
    goBack,
    replaceScreen,
    canGoBack: state.navigationHistory.length > 0,
    setBarrier,
    setCurrentTask,
    setActiveStep,
    setRewardMessage,
    resetApp,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
