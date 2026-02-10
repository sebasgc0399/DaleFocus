/**
 * getUserMetrics.js - Callable Function para calcular metricas del usuario
 *
 * Calcula y devuelve las metricas clave para el Dashboard:
 * - Focus Index: promedio de pomodoros por tarea completada
 * - Time-to-Action: tiempo promedio hasta iniciar trabajo (minutos)
 * - Momentum: porcentaje de pasos completados vs planificados
 * - Barriers: frecuencia de cada barrera en la ultima semana
 *
 * Input (request.data):
 * {
 *   days: number  // (opcional, default 7) rango de dias a consultar
 * }
 *
 * Output:
 * {
 *   focusIndex: number,
 *   timeToAction: number,
 *   momentum: number,
 *   barriers: { overwhelmed: n, uncertain: n, bored: n, perfectionism: n },
 *   pomodorosThisWeek: number,
 *   tasksCompletedThisWeek: number
 * }
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { CALLABLE_RUNTIME } from './runtimeOptions.js';
import { getUserMetricsInputSchema } from './schemas.js';
import { validateOrThrow } from './validation.js';

export const getUserMetrics = onCall(
  CALLABLE_RUNTIME.getUserMetrics,
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion');
    }

    const { days = 7 } = validateOrThrow(
      getUserMetricsInputSchema,
      request.data ?? {},
      'Parametros invalidos'
    );

    try {
      // TODO: Consultar Firestore para calcular metricas reales
      // Las siguientes son las consultas necesarias:

      // 1. Focus Index = totalPomodoros / totalTareasCompletadas
      // const sessionsSnap = await db.collection('sessions')
      //   .where('userId', '==', userId)
      //   .where('completed', '==', true)
      //   .where('startAt', '>=', startDate)
      //   .get();
      //
      // const tasksSnap = await db.collection('tasks')
      //   .where('userId', '==', userId)
      //   .where('status', '==', 'completed')
      //   .where('completedAt', '>=', startDate)
      //   .get();

      // 2. Time-to-Action = promedio(firstSessionAt - createdAt) en minutos
      // TODO: Calcular desde tareas que tengan firstSessionAt

      // 3. Momentum = (pasosCompletados / totalPasos) * 100
      // const stepsSnap = await db.collection('steps')
      //   .where('taskId', 'in', taskIds)
      //   .get();

      // 4. Barreras = conteo de cada tipo en el periodo
      // TODO: Contar barreras de las tareas creadas en el periodo

      // Placeholder explicito hasta implementar el calculo real
      throw new HttpsError(
        'failed-precondition',
        'Métricas aún no disponibles. Primero registra sesiones y completa tareas; vuelve a intentarlo en unos días.',
        { fn: 'getUserMetrics', days }
      );
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      console.error('Error en getUserMetrics:', error);
      throw new HttpsError('internal', 'Error interno al calcular métricas', {
        fn: 'getUserMetrics',
        stage: 'unknown',
      });
    }
  }
);
