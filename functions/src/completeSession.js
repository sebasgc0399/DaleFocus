/**
 * completeSession.js - Cloud Function para registrar sesiones Pomodoro
 *
 * Endpoint: POST /completeSession
 *
 * Registra el fin de una sesion Pomodoro en Firestore.
 * Actualiza contadores y puede marcar pasos como completados.
 *
 * Body esperado:
 * {
 *   userId: string,          // ID del usuario
 *   taskId: string|null,     // ID de la tarea asociada (opcional)
 *   stepId: string|null,     // ID del paso asociado (opcional)
 *   durationMinutes: number, // Duracion real en minutos
 *   completed: boolean       // Si se completo normalmente o se interrumpio
 * }
 *
 * Respuesta:
 * {
 *   sessionId: string,
 *   message: string
 * }
 */
import { onRequest } from 'firebase-functions/v2/https';
import { db } from './index.js';
import { requireUserAuth } from './auth.js';

export const completeSession = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Metodo no permitido' });
      return;
    }

    try {
      const { userId, taskId, stepId, durationMinutes, completed } = req.body;

      // Validaciones basicas
      if (!userId || durationMinutes === undefined) {
        res.status(400).json({ error: 'Faltan campos requeridos: userId, durationMinutes' });
        return;
      }

      if (!await requireUserAuth(req, res, userId)) {
        return;
      }

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

      res.status(200).json({
        sessionId: sessionRef.id,
        message: completed
          ? 'Pomodoro completado! Buen trabajo.'
          : 'Sesion registrada (incompleta).',
      });
    } catch (error) {
      console.error('Error en completeSession:', error);
      res.status(500).json({ error: 'Error interno al registrar la sesion' });
    }
  }
);
