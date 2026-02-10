/**
 * getUserMetrics.js - Cloud Function para calcular metricas del usuario
 *
 * Endpoint: GET /getUserMetrics?userId=xxx
 *
 * Calcula y devuelve las metricas clave para el Dashboard:
 * - Focus Index: promedio de pomodoros por tarea completada
 * - Time-to-Action: tiempo promedio hasta iniciar trabajo (minutos)
 * - Momentum: porcentaje de pasos completados vs planificados
 * - Barriers: frecuencia de cada barrera en la ultima semana
 *
 * Query params:
 * - userId: string (requerido)
 * - days: number (opcional, default 7 - rango de dias a consultar)
 *
 * Respuesta:
 * {
 *   focusIndex: number,
 *   timeToAction: number,
 *   momentum: number,
 *   barriers: { overwhelmed: n, uncertain: n, bored: n, perfectionism: n },
 *   pomodorosThisWeek: number,
 *   tasksCompletedThisWeek: number
 * }
 */
import { onRequest } from 'firebase-functions/v2/https';
import { db } from './index.js';

export const getUserMetrics = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Metodo no permitido' });
      return;
    }

    try {
      const userId = req.query.userId;
      const days = parseInt(req.query.days) || 7;

      if (!userId) {
        res.status(400).json({ error: 'Se requiere userId' });
        return;
      }

      // TODO: Verificar autenticacion

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

      res.status(200).json(metrics);
    } catch (error) {
      console.error('Error en getUserMetrics:', error);
      res.status(500).json({ error: 'Error interno al calcular metricas' });
    }
  }
);
