/**
 * constants.js - Constantes globales de DaleFocus
 *
 * Define las barreras emocionales, personalidades de IA,
 * configuracion del Pomodoro y otras constantes usadas en toda la app.
 */

/**
 * Las 4 barreras emocionales que el usuario puede seleccionar
 * Cada una tiene una estrategia de atomizacion asociada
 */
export const BARRIERS = [
  {
    id: 'overwhelmed',
    label: 'Abrumado',
    emoji: '\u{1F92F}', // 🤯
    description: 'Siento que es demasiado',
    strategy: 'micro_wins',
  },
  {
    id: 'uncertain',
    label: 'Incierto',
    emoji: '\u{1F914}', // 🤔
    description: 'No se por donde empezar',
    strategy: 'structured_exploration',
  },
  {
    id: 'bored',
    label: 'Aburrido',
    emoji: '\u{1F634}', // 😴
    description: 'No tengo ganas',
    strategy: 'quick_momentum',
  },
  {
    id: 'perfectionism',
    label: 'Perfeccionismo',
    emoji: '\u{1F630}', // 😰
    description: 'Quiero que salga perfecto',
    strategy: 'good_enough_iterations',
  },
];

/**
 * Las 4 personalidades para los mensajes motivacionales de la IA
 * El tono de GPT-5-mini se adapta segun la personalidad elegida
 */
export const PERSONALITIES = [
  {
    id: 'coach-pro',
    label: 'Coach Pro',
    description: 'Profesional y motivador',
    example: 'Este primer paso es clave. Tomate 3 minutos para hacerlo.',
  },
  {
    id: 'pana-real',
    label: 'Pana Real',
    description: 'Cercano y coloquial',
    example: 'Dale, pana. Son solo 3 minutos, arrancamos?',
  },
  {
    id: 'sargento',
    label: 'Sargento',
    description: 'Estilo militar, estricto',
    example: '3 minutos. Ahora. Sin excusas. A darle!',
  },
  {
    id: 'meme-lord',
    label: 'Meme-Lord',
    description: 'Humoristico y relajado',
    example: 'Plot twist: este paso te tomara menos que un TikTok',
  },
];

/**
 * Configuracion por defecto del Pomodoro
 * El usuario puede personalizar estos valores en su perfil
 */
export const DEFAULT_POMODORO_CONFIG = {
  workMinutes: 25,           // Duracion del periodo de trabajo
  shortBreak: 5,             // Duracion del descanso corto
  longBreak: 15,             // Duracion del descanso largo
  pomodorosUntilLongBreak: 4, // Pomodoros antes del descanso largo
};

/**
 * Estados posibles de una tarea
 */
export const TASK_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
};

/**
 * Estados posibles de un paso
 */
export const STEP_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

/**
 * Pantallas de la aplicacion
 */
export const SCREENS = {
  CHECKIN: 'checkin',
  TASK_INPUT: 'task-input',
  STEPS: 'steps',
  POMODORO: 'pomodoro',
  DASHBOARD: 'dashboard',
};
