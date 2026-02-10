# 01 Architecture

## Diagrama De Alto Nivel
```
[Web App React + Vite + Tailwind]
          |
          | HTTPS + Authorization: Bearer <ID Token>
          v
[Firebase Cloud Functions Gen2 (onRequest)]
  - atomizeTask
  - completeSession
  - generateReward
  - getUserMetrics
     |                    \
     |                     \
     v                      v
[Cloud Firestore]      [OpenAI API]
(users/tasks/steps/    (gpt-5-2025-08-07,
 sessions/metrics*)     gpt-5-mini-2025-08-07)
```

Nota: en esta base de codigo las funciones son HTTP `onRequest` (no callable).

## Flujo Principal
1. Frontend captura barrera + tarea.
2. Frontend llama `atomizeTask`.
3. Function llama OpenAI, valida JSON y guarda `tasks` + `steps`.
4. Frontend inicia Pomodoro y al terminar llama `completeSession`.
5. Frontend puede pedir mensaje motivacional a `generateReward`.
6. Dashboard consulta `getUserMetrics`.

## Decisiones Tecnicas
- Firebase (Auth, Firestore, Functions, Hosting): reduce friccion de infraestructura y acelera MVP.
- Functions HTTP: contrato simple por endpoint (`POST`/`GET`) consumible desde frontend.
- Firestore: modelo flexible para tareas, pasos y sesiones, con reglas por ownership.
- OpenAI separado por caso de uso:
  - Atomizador: `gpt-5-2025-08-07`.
  - Recompensa: `gpt-5-mini-2025-08-07`.

## Seguridad Implementada
- Firestore Rules por `request.auth.uid` y ownership.
- Guard de token en Functions (`functions/src/auth.js`) con verificacion `verifyIdToken`.
- Verificacion de coherencia `uid` token == `userId` enviado.

## Limites Tecnicos Actuales
- `getUserMetrics` aun no ejecuta agregaciones reales en Firestore.
- `completeSession` no actualiza `metrics/{userId}/daily/{date}` todavia.
- `atomizeTask` y otras functions no tienen rate limit implementado aun.
- `App.jsx` no incluye formulario de login/register final (solo placeholder visual).

## Riesgos Y Mitigaciones
- Riesgo: costos/abuso en endpoints IA.
  - Mitigacion recomendada: rate limiting por `uid` + cuotas diarias.
- Riesgo: metricas percibidas como vacias.
  - Mitigacion recomendada: completar `getUserMetrics` con consultas reales.
