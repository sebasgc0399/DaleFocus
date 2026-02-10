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

const FUNCTION_NAME = 'completeSession';
const MAX_DURATION_MINUTES = 240;

function invalidArgument(message) {
  return new HttpsError('invalid-argument', message);
}

function normalizeOptionalId(value, fieldName) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw invalidArgument(`${fieldName} inválido`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw invalidArgument(`${fieldName} inválido`);
  }

  return normalized;
}

export const completeSession = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion');
    }

    const userId = request.auth.uid;
    const { taskId, stepId, durationMinutes, completed } = request.data ?? {};

    const normalizedTaskId = normalizeOptionalId(taskId, 'taskId');
    const normalizedStepId = normalizeOptionalId(stepId, 'stepId');

    if (
      typeof durationMinutes !== 'number' ||
      !Number.isFinite(durationMinutes) ||
      durationMinutes <= 0 ||
      durationMinutes > MAX_DURATION_MINUTES
    ) {
      throw invalidArgument('durationMinutes inválido');
    }

    if (typeof completed !== 'boolean') {
      throw invalidArgument('completed inválido');
    }

    const completedBool = completed === true;

    try {
      if (normalizedTaskId) {
        const taskDoc = await db.collection('tasks').doc(normalizedTaskId).get();
        if (!taskDoc.exists) {
          throw invalidArgument('taskId inválido');
        }

        const taskDocData = taskDoc.data();

        if (taskDocData.userId !== userId) {
          throw new HttpsError('permission-denied', 'No tienes acceso a esta tarea');
        }

        if (taskDocData.status === 'completed' && completedBool) {
          throw new HttpsError('failed-precondition', 'La tarea ya está completada');
        }
      }

      if (normalizedStepId) {
        const stepDoc = await db.collection('steps').doc(normalizedStepId).get();
        if (!stepDoc.exists) {
          throw invalidArgument('stepId inválido');
        }

        const stepData = stepDoc.data();
        const stepTaskId = typeof stepData.taskId === 'string' ? stepData.taskId.trim() : '';
        if (!stepTaskId) {
          throw invalidArgument('stepId inválido');
        }

        if (normalizedTaskId) {
          if (stepTaskId !== normalizedTaskId) {
            throw invalidArgument('stepId inválido');
          }
        } else {
          const ownerTaskDoc = await db.collection('tasks').doc(stepTaskId).get();
          if (!ownerTaskDoc.exists) {
            throw invalidArgument('stepId inválido');
          }

          const ownerTaskData = ownerTaskDoc.data();
          if (ownerTaskData.userId !== userId) {
            throw new HttpsError('permission-denied', 'No tienes acceso a esta tarea');
          }
        }
      }

      const now = new Date();
      const startAt = new Date(now.getTime() - durationMinutes * 60 * 1000);
      if (startAt.getTime() > now.getTime()) {
        throw invalidArgument('durationMinutes inválido');
      }

      // Crear registro de sesion en Firestore
      const sessionData = {
        userId,
        taskId: normalizedTaskId,
        stepId: normalizedStepId,
        startAt,
        endAt: now,
        durationMinutes,
        completed: completedBool,
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
        message: completedBool
          ? 'Pomodoro completado! Buen trabajo.'
          : 'Sesion registrada (incompleta).',
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      console.error(`[${FUNCTION_NAME}] error`, {
        fn: FUNCTION_NAME,
        stage: 'firestore',
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });

      throw new HttpsError('internal', 'Error interno al registrar la sesión', {
        fn: FUNCTION_NAME,
        stage: 'firestore',
      });
    }
  }
);
