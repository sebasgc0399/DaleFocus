/**
 * atomizeTask.js - Callable Function para atomizar tareas con GPT-5.1
 *
 * Recibe el titulo de la tarea y la barrera emocional del usuario.
 * Construye un prompt con las reglas de atomizacion segun la barrera
 * y llama a GPT-5.1 para generar un plan de pasos atomizados.
 * Guarda la tarea y los pasos en Firestore.
 *
 * Input (request.data):
 * {
 *   taskTitle: string,     // Titulo de la tarea
 *   barrier: string,       // 'overwhelmed' | 'uncertain' | 'bored' | 'perfectionism'
 *   taskId?: string        // Opcional (backward-compatible)
 * }
 *
 * Output:
 * {
 *   taskId: string,
 *   taskTitle: string,
 *   barrier: string,
 *   strategy: string,
 *   estimatedPomodoros: number,
 *   steps: Array<Step>,
 *   nextBestActionId: string,
 *   antiProcrastinationTip: string
 * }
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import OpenAI from 'openai';
import { db } from './index.js';
import { CALLABLE_RUNTIME } from './runtimeOptions.js';

// Barreras validas
const VALID_BARRIERS = ['overwhelmed', 'uncertain', 'bored', 'perfectionism'];
const FUNCTION_NAME = 'atomizeTask';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim() ?? '';
const OPENAI_CLIENT = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const SYSTEM_PROMPT = `Eres un asistente experto en combatir la procrastinacion mediante atomizacion inteligente de tareas.

REGLAS DE ATOMIZACION segun barrera:

Si barrier === "overwhelmed":
- Crea pasos de maximo 10 minutos cada uno.
- El primer paso debe tomar <= 3 minutos.
- Usa lenguaje ultra especifico ("Escribe X", no "Piensa en X").
- Criterios de aceptacion tangibles y minimos.
- Estrategia: "micro_wins"

Si barrier === "uncertain":
- El primer paso es siempre una exploracion de 15 min (investigar, leer, etc.).
- El segundo paso: definir estructura basandose en lo investigado.
- Evita decisiones importantes en los primeros 2 pasos.
- Estrategia: "structured_exploration"

Si barrier === "bored":
- El primer paso debe ser muy facil y corto (~2 min) para iniciar.
- El segundo paso puede ser mas sustancioso (15-20 min).
- Usa tono energetico y coloquial ("Dale, comienza por...").
- Estrategia: "quick_momentum"

Si barrier === "perfectionism":
- Siempre indica que el resultado puede ser un borrador o version 1.
- Prohibido usar palabras como "perfecto", "definitivo".
- El ultimo paso puede ser "pulir o iterar" (opcional si hay tiempo).
- Estrategia: "good_enough_iterations"

OUTPUT FORMAT (JSON) ESTRICTO:
{
  "taskTitle": string,
  "barrier": string,
  "strategy": string,
  "estimatedPomodoros": number,
  "steps": [
    {
      "id": "s1",
      "title": string,
      "action": string,
      "estimateMinutes": number,
      "acceptanceCriteria": [string],
      "order": number
    }
  ],
  "nextBestActionId": "s1",
  "antiProcrastinationTip": string
}

Responde SOLO con el JSON. No incluyas texto adicional.`;

function resolveOpenAITimeoutMs() {
  const parsed = Number.parseInt(process.env.OPENAI_TIMEOUT_MS ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30000;
}

const OPENAI_TIMEOUT_MS = resolveOpenAITimeoutMs();

function makeOpenAITimeoutError(timeoutMs) {
  const timeoutError = new Error(`OpenAI timeout after ${timeoutMs}ms`);
  timeoutError.code = 'OPENAI_TIMEOUT';
  return timeoutError;
}

function isOpenAITimeoutOrAbort(error) {
  return (
    error?.code === 'OPENAI_TIMEOUT' ||
    error?.name === 'AbortError' ||
    error?.name === 'APIConnectionTimeoutError' ||
    error?.name === 'APIUserAbortError'
  );
}

async function createChatCompletionWithTimeout(openai, payload, timeoutMs) {
  const controller = new AbortController();
  let timeoutId = null;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(makeOpenAITimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      openai.chat.completions.create(payload, {
        signal: controller.signal,
        timeout: timeoutMs,
      }),
      timeoutPromise,
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Construye el prompt del usuario con los datos de la tarea
 */
function buildUserPrompt(taskTitle, barrier) {
  return `CONTEXTO DEL USUARIO:
- Tarea: ${taskTitle}
- Barrera principal: ${barrier}
- Tiempo disponible estimado: 4 horas

Genera ahora el plan atomizado en formato JSON segun las reglas.`;
}

/**
 * Callable Function: atomizeTask
 */
export const atomizeTask = onCall(
  CALLABLE_RUNTIME.atomizeTask,
  async (request) => {
    // Auth automatica via Firebase SDK
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion');
    }

    const userId = request.auth.uid;
    const { taskTitle, barrier, taskId } = request.data ?? {};

    // Validacion estricta de taskTitle
    if (typeof taskTitle !== 'string') {
      throw new HttpsError('invalid-argument', 'taskTitle debe ser un string');
    }

    const normalizedTaskTitle = taskTitle.trim();
    if (!normalizedTaskTitle) {
      throw new HttpsError('invalid-argument', 'taskTitle no puede estar vacio');
    }

    if (normalizedTaskTitle.length > 200) {
      throw new HttpsError('invalid-argument', 'El titulo de la tarea no debe exceder 200 caracteres');
    }

    if (typeof barrier !== 'string' || !barrier.trim()) {
      throw new HttpsError('invalid-argument', 'Falta campo requerido: barrier');
    }

    const normalizedBarrier = barrier.trim();
    if (!VALID_BARRIERS.includes(normalizedBarrier)) {
      throw new HttpsError('invalid-argument', `Barrera invalida. Debe ser: ${VALID_BARRIERS.join(', ')}`);
    }

    // Backward-compatible: taskId opcional para detectar tarea completada
    if (taskId !== undefined && taskId !== null) {
      if (typeof taskId !== 'string' || !taskId.trim()) {
        throw new HttpsError('invalid-argument', 'taskId inválido');
      }

      const normalizedTaskId = taskId.trim();
      const taskDoc = await db.collection('tasks').doc(normalizedTaskId).get();

      if (!taskDoc.exists) {
        throw new HttpsError('invalid-argument', 'taskId inválido');
      }

      const existingTask = taskDoc.data();
      if (existingTask.userId !== userId) {
        throw new HttpsError('permission-denied', 'No tienes permisos para acceder a esta tarea');
      }

      if (existingTask.status === 'completed') {
        throw new HttpsError('failed-precondition', 'La tarea ya está completada');
      }
    }

    if (!OPENAI_API_KEY || !OPENAI_CLIENT) {
      throw new HttpsError('failed-precondition', 'Servicio de IA no configurado');
    }

    // TODO: Implementar rate limiting (max 5 atomizaciones/min por usuario)

    try {
      const completion = await createChatCompletionWithTimeout(
        OPENAI_CLIENT,
        {
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(normalizedTaskTitle, normalizedBarrier) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        },
        OPENAI_TIMEOUT_MS
      );

      // Parsear respuesta de la IA
      let plan;
      try {
        const rawPlan = completion?.choices?.[0]?.message?.content;
        if (typeof rawPlan !== 'string') {
          throw new SyntaxError('Respuesta de OpenAI sin JSON valido');
        }

        plan = JSON.parse(rawPlan);
      } catch (parseError) {
        console.error(`[${FUNCTION_NAME}] parse error`, {
          fn: FUNCTION_NAME,
          stage: 'parse',
          message: parseError?.message,
          stack: parseError?.stack,
        });

        throw new HttpsError('internal', 'Error interno al procesar la respuesta de IA', {
          fn: FUNCTION_NAME,
          stage: 'parse',
        });
      }

      // Guardar tarea en Firestore
      const taskRef = await db.collection('tasks').add({
        userId,
        title: plan.taskTitle,
        barrier: plan.barrier,
        strategy: plan.strategy,
        estimatedPomodoros: plan.estimatedPomodoros,
        status: 'active',
        createdAt: new Date(),
        completedAt: null,
      });

      // Guardar pasos en Firestore
      const stepsPromises = plan.steps.map((step) =>
        db.collection('steps').add({
          taskId: taskRef.id,
          title: step.title,
          action: step.action,
          estimateMinutes: step.estimateMinutes,
          acceptanceCriteria: step.acceptanceCriteria,
          order: step.order,
          status: 'pending',
          completedAt: null,
        })
      );
      await Promise.all(stepsPromises);

      // Devolver resultado completo (shape exacto consumido por frontend)
      return {
        taskId: taskRef.id,
        ...plan,
      };
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] error`, {
        fn: FUNCTION_NAME,
        stage: error?.details?.stage ?? 'unknown',
        name: error?.name,
        status: error?.status,
        message: error?.message,
        stack: error?.stack,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      if (isOpenAITimeoutOrAbort(error)) {
        throw new HttpsError('deadline-exceeded', 'La solicitud tardó demasiado en responder', {
          fn: FUNCTION_NAME,
          stage: 'openai',
        });
      }

      if (error?.status === 429) {
        throw new HttpsError('resource-exhausted', 'Alta demanda. Intenta en un momento.', {
          fn: FUNCTION_NAME,
          stage: 'openai',
        });
      }

      if (error?.status === 401 || error?.status === 403) {
        throw new HttpsError('failed-precondition', 'Servicio de IA no configurado correctamente', {
          fn: FUNCTION_NAME,
          stage: 'openai',
        });
      }

      throw new HttpsError('internal', 'Error interno al atomizar la tarea', {
        fn: FUNCTION_NAME,
        stage: 'unknown',
      });
    }
  }
);
