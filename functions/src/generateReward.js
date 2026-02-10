/**
 * generateReward.js - Cloud Function para generar mensajes motivacionales
 *
 * Endpoint: POST /generateReward
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
 * Body esperado:
 * {
 *   userId: string,       // ID del usuario
 *   personality: string,  // Personalidad del usuario
 *   context: string       // Que logro el usuario (ej: "completo un pomodoro de 25 min")
 * }
 *
 * Respuesta:
 * {
 *   message: string       // Mensaje motivacional generado
 * }
 */
import { onRequest } from 'firebase-functions/v2/https';
import OpenAI from 'openai';
import { requireUserAuth } from './auth.js';

// Descripciones de tono por personalidad para el prompt
const PERSONALITY_TONES = {
  'coach-pro': 'Profesional y motivador. Usa un tono de coach deportivo. Ejemplo: "Este primer paso es clave. Tomate 3 minutos para hacerlo."',
  'pana-real': 'Cercano y coloquial, como un amigo latino. Ejemplo: "Dale, pana. Son solo 3 minutos, arrancamos?"',
  'sargento': 'Estilo militar, estricto pero con respeto. Ejemplo: "3 minutos. Ahora. Sin excusas. A darle!"',
  'meme-lord': 'Humoristico y relajado, usa referencias de internet. Ejemplo: "Plot twist: este paso te tomara menos que un TikTok"',
};

export const generateReward = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Metodo no permitido' });
      return;
    }

    try {
      const { userId, personality, context } = req.body;

      // Validaciones
      if (!userId || !personality || !context) {
        res.status(400).json({ error: 'Faltan campos: userId, personality, context' });
        return;
      }

      if (!await requireUserAuth(req, res, userId)) {
        return;
      }

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

      res.status(200).json({ message });
    } catch (error) {
      console.error('Error en generateReward:', error);

      // Fallback: mensaje generico si la IA falla
      res.status(200).json({
        message: 'Buen trabajo! Sigue asi, cada paso cuenta.',
      });
    }
  }
);
