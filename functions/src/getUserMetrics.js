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
import { db } from './index.js';

export const getUserMetrics = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion');
    }

    const userId = request.auth.uid;
    const days = parseInt(request.data?.days) || 7;

    try {
      // Rango de fechas para la consulta
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

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

      // Respuesta placeholder (reemplazar con datos reales)
      const metrics = {
        focusIndex: 0,
        timeToAction: 0,
        momentum: 0,
        barriers: {
          overwhelmed: 0,
          uncertain: 0,
          bored: 0,
          perfectionism: 0,
        },
        pomodorosThisWeek: 0,
        tasksCompletedThisWeek: 0,
      };

      return metrics;
    } catch (error) {
      console.error('Error en getUserMetrics:', error);
      throw new HttpsError('internal', 'Error interno al calcular metricas');
    }
  }
);
