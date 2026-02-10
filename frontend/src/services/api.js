/**
 * api.js - Servicio de comunicacion con Cloud Functions
 *
 * Funciones para llamar a los endpoints de Firebase Cloud Functions:
 * - atomizeTask: enviar tarea a GPT-5.1 para atomizacion
 * - completeSession: registrar sesion de Pomodoro completada
 * - generateReward: obtener mensaje motivacional de GPT-5-mini
 * - getUserMetrics: obtener metricas del dashboard
 *
 * Todas las funciones incluyen el token de autenticacion del usuario.
 */
import { auth } from './firebase';

// URL base de las Cloud Functions
// TODO: Actualizar con la URL real del proyecto Firebase desplegado
const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_URL
  || 'http://localhost:5001/dalefocus/us-central1';

/**
 * Helper para hacer peticiones autenticadas a Cloud Functions
 */
async function authenticatedFetch(endpoint, data) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Usuario no autenticado');
  }

  const response = await fetch(`${FUNCTIONS_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}`);
  }

  return response.json();
}

/**
 * Atomizar una tarea usando GPT-5.1
 * Envia el titulo y la barrera emocional, recibe un plan con pasos
 *
 * @param {Object} params
 * @param {string} params.taskTitle - Titulo de la tarea
 * @param {string} params.barrier - Barrera emocional (overwhelmed|uncertain|bored|perfectionism)
 * @param {string} params.userId - ID del usuario
 * @returns {Promise<Object>} Plan atomizado con pasos
 */
export async function atomizeTask({ taskTitle, barrier, userId }) {
  // TODO: Implementar llamada real al endpoint
  return authenticatedFetch('atomizeTask', { taskTitle, barrier, userId });
}

/**
 * Registrar una sesion Pomodoro completada o abandonada
 *
 * @param {Object} params
 * @param {string} params.userId - ID del usuario
 * @param {string|null} params.taskId - ID de la tarea asociada
 * @param {string|null} params.stepId - ID del paso asociado
 * @param {number} params.durationMinutes - Duracion en minutos
 * @param {boolean} params.completed - Si la sesion se completo normalmente
 * @returns {Promise<Object>} Confirmacion del registro
 */
export async function completeSession({ userId, taskId, stepId, durationMinutes, completed }) {
  // TODO: Implementar llamada real al endpoint
  return authenticatedFetch('completeSession', {
    userId, taskId, stepId, durationMinutes, completed,
  });
}

/**
 * Generar mensaje de recompensa motivacional usando GPT-5-mini
 *
 * @param {Object} params
 * @param {string} params.userId - ID del usuario
 * @param {string} params.personality - Personalidad del usuario
 * @param {string} params.context - Contexto de lo logrado
 * @returns {Promise<Object>} Mensaje motivacional
 */
export async function generateReward({ userId, personality, context }) {
  // TODO: Implementar llamada real al endpoint
  return authenticatedFetch('generateReward', { userId, personality, context });
}

/**
 * Obtener metricas del usuario para el dashboard
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Metricas calculadas (focusIndex, timeToAction, momentum, barriers)
 */
export async function getUserMetrics(userId) {
  // TODO: Implementar llamada real al endpoint
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(`${FUNCTIONS_BASE_URL}/getUserMetrics?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }

  return response.json();
}
