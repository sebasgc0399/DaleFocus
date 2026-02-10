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

// Descripciones de tono por personalidad para el prompt
const PERSONALITY_TONES = {
  'coach-pro': 'Profesional y motivador. Usa un tono de coach deportivo. Ejemplo: "Este primer paso es clave. Tomate 3 minutos para hacerlo."',
  'pana-real': 'Cercano y coloquial, como un amigo latino. Ejemplo: "Dale, pana. Son solo 3 minutos, arrancamos?"',
  'sargento': 'Estilo militar, estricto pero con respeto. Ejemplo: "3 minutos. Ahora. Sin excusas. A darle!"',
  'meme-lord': 'Humoristico y relajado, usa referencias de internet. Ejemplo: "Plot twist: este paso te tomara menos que un TikTok"',
};

export const generateReward = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion');
    }

    const { personality, context } = request.data;

    // Validaciones
    if (!personality || !context) {
      throw new HttpsError('invalid-argument', 'Faltan campos: personality, context');
    }

    try {
      const tone = PERSONALITY_TONES[personality] || PERSONALITY_TONES['coach-pro'];

      // Llamar a GPT-5-mini para generar el mensaje
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente motivacional de la app DaleFocus. Genera mensajes de celebracion cortos (1-2 frases max).

TONO: ${tone}

Reglas:
- Maximo 2 frases
- Referencia brevemente lo que el usuario logro
- Se positivo y energetico
- No uses hashtags ni emojis excesivos (maximo 1 emoji)`,
          },
          {
            role: 'user',
            content: `El usuario acaba de: ${context}. Genera un mensaje de celebracion.`,
          },
        ],
        temperature: 0.9,
        max_tokens: 100,
      });

      const message = completion.choices[0].message.content.trim();

      // TODO: Opcionalmente guardar el mensaje en Firestore para historial

      return { message };
    } catch (error) {
      console.error('Error en generateReward:', error);

      // Fallback: mensaje generico si la IA falla
      return {
        message: 'Buen trabajo! Sigue asi, cada paso cuenta.',
      };
    }
  }
);
