# 01 Architecture

## Diagrama De Alto Nivel
```
[Web App React + Vite + Tailwind]
          |
          | httpsCallable (Firebase SDK, auth automatica)
          v
[Firebase Cloud Functions Gen2 (onCall - Callable)]
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

Las funciones usan `onCall` (Callable). Firebase SDK maneja auth, CORS y serializacion automaticamente.

## Flujo Principal
1. Frontend captura barrera + tarea.
2. Frontend llama `atomizeTask`.
3. Function llama OpenAI, valida JSON y guarda `tasks` + `steps`.
4. Frontend inicia Pomodoro y al terminar llama `completeSession`.
5. Frontend puede pedir mensaje motivacional a `generateReward`.
6. Dashboard consulta `getUserMetrics`.

## Decisiones Tecnicas
- Firebase (Auth, Firestore, Functions, Hosting): reduce friccion de infraestructura y acelera MVP.
- Callable Functions (`onCall`): auth automatica via Firebase SDK, sin CORS ni URL manual.
- Firestore: modelo flexible para tareas, pasos y sesiones, con reglas por ownership.
- OpenAI separado por caso de uso:
  - Atomizador: `gpt-5-2025-08-07`.
  - Recompensa: `gpt-5-mini-2025-08-07`.

## Seguridad Implementada
- Firestore Rules por `request.auth.uid` y ownership.
- Callable Functions (`onCall`): Firebase valida el token automaticamente. El `userId` se obtiene de `request.auth.uid` en el servidor, nunca enviado por el cliente.

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
