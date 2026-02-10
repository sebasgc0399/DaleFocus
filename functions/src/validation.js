import { HttpsError } from 'firebase-functions/v2/https';

export function validateOrThrow(schema, data, message) {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new HttpsError('invalid-argument', message, {
      issues: parsed.error.flatten(),
    });
  }

  return parsed.data;
}

export function validateAIOrThrow(schema, data) {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new HttpsError(
      'internal',
      'La IA devolvio un formato invalido. Intenta de nuevo.',
      {
        stage: 'ai_schema',
        issues: parsed.error.flatten(),
      }
    );
  }

  return parsed.data;
}
