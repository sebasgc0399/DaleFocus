/**
 * generateReward.js - Callable Function para generar mensajes motivacionales
 *
 * Usa GPT-5-mini para generar un mensaje de recompensa personalizado
 * segun la personalidad elegida por el usuario.
 *
 * Personalidades disponibles:
 * - Coach Pro:  profesional y motivador
 * - Pana Real:  cercano y coloquial
 * - Sargento:   estilo militar, estricto
 * - Meme-Lord:  humoristico y relajado
 *
 * Input (request.data):
 * {
 *   personality: string,  // Personalidad del usuario
 *   context: string       // Que logro el usuario (ej: "completo un pomodoro de 25 min")
 * }
 *
 * Output:
 * {
 *   message: string       // Mensaje motivacional generado
 * }
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import OpenAI from 'openai';
import { CALLABLE_RUNTIME } from './runtimeOptions.js';

// Descripciones de tono por personalidad para el prompt
const PERSONALITY_TONES = {
  'coach-pro': 'Profesional y motivador. Usa un tono de coach deportivo. Ejemplo: "Este primer paso es clave. Tomate 3 minutos para hacerlo."',
  'pana-real': 'Cercano y coloquial, como un amigo latino. Ejemplo: "Dale, pana. Son solo 3 minutos, arrancamos?"',
  'sargento': 'Estilo militar, estricto pero con respeto. Ejemplo: "3 minutos. Ahora. Sin excusas. A darle!"',
  'meme-lord': 'Humoristico y relajado, usa referencias de internet. Ejemplo: "Plot twist: este paso te tomara menos que un TikTok"',
};
const FUNCTION_NAME = 'generateReward';
const OPENAI_TIMEOUT_MS = 12000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim() ?? '';
const OPENAI_CLIENT = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const SYSTEM_PROMPT_TEMPLATE = `Eres un asistente motivacional de la app DaleFocus. Genera mensajes de celebracion cortos (1-2 frases max).

TONO: __TONE__

Reglas:
- Maximo 2 frases
- Referencia brevemente lo que el usuario logro
- Se positivo y energetico
- No uses hashtags ni emojis excesivos (maximo 1 emoji)`;
const SYSTEM_PROMPT = Object.freeze(
  Object.fromEntries(
    Object.entries(PERSONALITY_TONES).map(([key, tone]) => [key, SYSTEM_PROMPT_TEMPLATE.replace('__TONE__', tone)])
  )
);

function invalidArgument(message) {
  return new HttpsError('invalid-argument', message);
}

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

export const generateReward = onCall(
  CALLABLE_RUNTIME.generateReward,
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion');
    }

    const { personality, context } = request.data ?? {};

    if (typeof personality !== 'string') {
      throw invalidArgument('personality inválido');
    }

    const normalizedPersonality = personality.trim();
    if (!normalizedPersonality) {
      throw invalidArgument('personality inválido');
    }

    if (typeof context !== 'string') {
      throw invalidArgument('context inválido');
    }

    const normalizedContext = context.trim();
    if (!normalizedContext) {
      throw invalidArgument('context inválido');
    }

    if (normalizedContext.length > 300) {
      throw invalidArgument('context inválido (max 300 caracteres)');
    }

    const personalityKey = PERSONALITY_TONES[normalizedPersonality]
      ? normalizedPersonality
      : 'coach-pro';
    const systemPrompt = SYSTEM_PROMPT[personalityKey];

    if (!OPENAI_API_KEY || !OPENAI_CLIENT) {
      throw new HttpsError('failed-precondition', 'Servicio de IA no configurado');
    }

    try {
      const completion = await createChatCompletionWithTimeout(
        OPENAI_CLIENT,
        {
          model: 'gpt-5-mini-2025-08-07',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `El usuario acaba de: ${normalizedContext}. Genera un mensaje de celebracion.`,
            },
          ],
          temperature: 0.9,
          max_tokens: 100,
        },
        OPENAI_TIMEOUT_MS
      );

      const message = completion?.choices?.[0]?.message?.content?.trim();
      if (!message) {
        throw new Error('Respuesta vacia de OpenAI');
      }

      // TODO: Opcionalmente guardar el mensaje en Firestore para historial

      return { message };
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] error`, {
        fn: FUNCTION_NAME,
        stage: 'openai',
        name: error?.name,
        status: error?.status,
        message: error?.message,
        stack: error?.stack,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      if (isOpenAITimeoutOrAbort(error)) {
        throw new HttpsError('deadline-exceeded', 'La IA tardó demasiado. Intenta de nuevo.', {
          fn: FUNCTION_NAME,
          stage: 'openai',
        });
      }

      if (error?.status === 429) {
        throw new HttpsError('resource-exhausted', 'Alta demanda. Intenta en un momento.');
      }

      if (error?.status === 401 || error?.status === 403) {
        throw new HttpsError('failed-precondition', 'Configuración de IA inválida.');
      }

      throw new HttpsError('internal', 'Error interno al generar recompensa', {
        fn: FUNCTION_NAME,
        stage: 'unknown',
      });
    }
  }
);
