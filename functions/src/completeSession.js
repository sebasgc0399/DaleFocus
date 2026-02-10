/**
 * completeSession.js - Callable Function para registrar sesiones Pomodoro
 *
 * Registra el fin de una sesion Pomodoro en Firestore.
 * Actualiza contadores y puede marcar pasos como completados.
 *
 * Input (request.data):
 * {
 *   taskId: string|null,     // ID de la tarea asociada (opcional)
 *   stepId: string|null,     // ID del paso asociado (opcional)
 *   durationMinutes: number, // Duracion real en minutos
 *   completed: boolean       // Si se completo normalmente o se interrumpio
 * }
 *
 * Output:
 * {
 *   sessionId: string,
 *   message: string
 * }
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from './index.js';

export const completeSession = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion');
    }

    const userId = request.auth.uid;
    const { taskId, stepId, durationMinutes, completed } = request.data;

    // Validaciones basicas
    if (durationMinutes === undefined || durationMinutes === null) {
      throw new HttpsError('invalid-argument', 'Falta campo requerido: durationMinutes');
    }

    try {
      // Crear registro de sesion en Firestore
      const sessionData = {
        userId,
        taskId: taskId || null,
        stepId: stepId || null,
        startAt: new Date(Date.now() - durationMinutes * 60 * 1000),
        endAt: new Date(),
        durationMinutes,
        completed: Boolean(completed),
      };

      const sessionRef = await db.collection('sessions').add(sessionData);

      // TODO: Actualizar metricas diarias en metrics/{userId}/daily/{date}
      // - Incrementar pomodorosCompleted si completed === true
      // - Actualizar averageSessionDuration
      // - Si es el primer pomodoro del dia, calcular timeToFirstPomodoro

      // TODO: Si se especifico un taskId y es la primera sesion de esa tarea,
      // registrar firstSessionAt en el documento de la tarea (para Time-to-Action)

      return {
        sessionId: sessionRef.id,
        message: completed
          ? 'Pomodoro completado! Buen trabajo.'
          : 'Sesion registrada (incompleta).',
      };
    } catch (error) {
      console.error('Error en completeSession:', error);
      throw new HttpsError('internal', 'Error interno al registrar la sesion');
    }
  }
);
