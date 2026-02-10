/**
 * api.js - Servicio de comunicacion con Cloud Functions (Callable)
 *
 * Usa httpsCallable del Firebase SDK para llamar a las Cloud Functions.
 * La autenticacion se maneja automaticamente via Firebase Auth (no necesita
 * token manual ni VITE_FUNCTIONS_URL).
 *
 * Funciones:
 * - atomizeTask: enviar tarea a GPT-5.1 para atomizacion
 * - completeSession: registrar sesion de Pomodoro completada
 * - generateReward: obtener mensaje motivacional de GPT-5-mini
 * - getUserMetrics: obtener metricas del dashboard
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Atomizar una tarea usando GPT-5.1
 * Envia el titulo y la barrera emocional, recibe un plan con pasos
 *
 * @param {Object} params
 * @param {string} params.taskTitle - Titulo de la tarea
 * @param {string} params.barrier - Barrera emocional (overwhelmed|uncertain|bored|perfectionism)
 * @returns {Promise<Object>} Plan atomizado con pasos
 */
export async function atomizeTask({ taskTitle, barrier }) {
  const fn = httpsCallable(functions, 'atomizeTask');
  const { data } = await fn({ taskTitle, barrier });
  return data;
}

/**
 * Registrar una sesion Pomodoro completada o abandonada
 *
 * @param {Object} params
 * @param {string|null} params.taskId - ID de la tarea asociada
 * @param {string|null} params.stepId - ID del paso asociado
 * @param {number} params.durationMinutes - Duracion en minutos
 * @param {boolean} params.completed - Si la sesion se completo normalmente
 * @returns {Promise<Object>} Confirmacion del registro (sessionId, message)
 */
export async function completeSession({ taskId, stepId, durationMinutes, completed }) {
  const fn = httpsCallable(functions, 'completeSession');
  const { data } = await fn({ taskId, stepId, durationMinutes, completed });
  return data;
}

/**
 * Generar mensaje de recompensa motivacional usando GPT-5-mini
 *
 * @param {Object} params
 * @param {string} params.personality - Personalidad del usuario
 * @param {string} params.context - Contexto de lo logrado
 * @returns {Promise<Object>} Mensaje motivacional ({ message })
 */
export async function generateReward({ personality, context }) {
  const fn = httpsCallable(functions, 'generateReward');
  const { data } = await fn({ personality, context });
  return data;
}

/**
 * Obtener metricas del usuario para el dashboard
 *
 * @param {number} [days=7] - Rango de dias a consultar
 * @returns {Promise<Object>} Metricas calculadas (focusIndex, timeToAction, momentum, barriers)
 */
export async function getUserMetrics(days = 7) {
  const fn = httpsCallable(functions, 'getUserMetrics');
  const { data } = await fn({ days });
  return data;
}
