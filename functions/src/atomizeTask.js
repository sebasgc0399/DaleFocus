/**
 * atomizeTask.js - Cloud Function para atomizar tareas con GPT-5.1
 *
 * Endpoint: POST /atomizeTask
 *
 * Recibe el titulo de la tarea y la barrera emocional del usuario.
 * Construye un prompt con las reglas de atomizacion segun la barrera
 * y llama a GPT-5.1 para generar un plan de pasos atomizados.
 * Guarda la tarea y los pasos en Firestore.
 *
 * Body esperado:
 * {
 *   taskTitle: string,     // Titulo de la tarea
 *   barrier: string,       // 'overwhelmed' | 'uncertain' | 'bored' | 'perfectionism'
 *   userId: string         // ID del usuario autenticado
 * }
 *
 * Respuesta:
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
import { onRequest } from 'firebase-functions/v2/https';
import OpenAI from 'openai';
import { db } from './index.js';

// Barreras validas
const VALID_BARRIERS = ['overwhelmed', 'uncertain', 'bored', 'perfectionism'];

/**
 * Construye el prompt del sistema para GPT-5.1
 * Incluye las reglas de atomizacion para cada barrera
 */
function buildSystemPrompt() {
  // TODO: Prompt completo basado en la Seccion 3 del Plan de Desarrollo
  return `Eres un asistente experto en combatir la procrastinacion mediante atomizacion inteligente de tareas.

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
 * Cloud Function: atomizeTask
 */
export const atomizeTask = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    // Solo aceptar POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Metodo no permitido' });
      return;
    }

    try {
      const { taskTitle, barrier, userId } = req.body;

      // Validaciones
      if (!taskTitle || !barrier || !userId) {
        res.status(400).json({ error: 'Faltan campos requeridos: taskTitle, barrier, userId' });
        return;
      }

      if (!VALID_BARRIERS.includes(barrier)) {
        res.status(400).json({ error: `Barrera invalida. Debe ser: ${VALID_BARRIERS.join(', ')}` });
        return;
      }

      if (taskTitle.length > 200) {
        res.status(400).json({ error: 'El titulo de la tarea no debe exceder 200 caracteres' });
        return;
      }

      // TODO: Verificar autenticacion (req.auth o token Bearer)
      // TODO: Implementar rate limiting (max 5 atomizaciones/min por usuario)

      // Llamar a GPT-5.1
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(taskTitle, barrier) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      // Parsear respuesta de la IA
      const plan = JSON.parse(completion.choices[0].message.content);

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

      // Devolver resultado completo
      res.status(200).json({
        taskId: taskRef.id,
        ...plan,
      });
    } catch (error) {
      console.error('Error en atomizeTask:', error);
      res.status(500).json({ error: 'Error interno al atomizar la tarea' });
    }
  }
);
