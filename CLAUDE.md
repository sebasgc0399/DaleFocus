# DaleFocus — Contexto para Claude

Este repo es el MVP de DaleFocus (Reto Developer Foundations, 15 días). Objetivo: ayudar a vencer la procrastinación atomizando tareas en micro-acciones accionables y ejecutarlas con Pomodoro.

## Demo y repo
- Demo: https://dalefocus-3f26d.web.app/
- Repo: https://github.com/sebasgc0399/DaleFocus

## Stack
- Frontend: React + Vite + Tailwind
- Backend: Firebase Cloud Functions v2 (Node 20, ESM)
- Datos: Firestore
- Auth: Firebase Authentication
- IA: OpenAI (SDK `openai`)

## Arquitectura (alto nivel)
Frontend -> Callable Functions (httpsCallable / onCall) -> Firestore
                                  \-> OpenAI (atomizeTask / generateReward)

## Reglas de ingeniería (IMPORTANTE)
1) No inventes nombres de funciones, colecciones o rutas. Usa lo que existe en el repo.
2) No cambies el shape de las respuestas sin actualizar callers.
3) Nunca uses `throw new Error()` en callable functions: siempre `HttpsError`.
4) Validación obligatoria: toda callable valida `request.data` con Zod (`safeParse`).
5) `atomizeTask` debe validar el JSON de la IA con schema antes de guardar en Firestore.
6) En `catch`: si el error ya es `HttpsError`, re-lánzalo (no lo tapes con `internal`).
7) Mantén ESM: imports relativos con extensión `.js`.

## Cloud Functions (nombres esperados)
- `atomizeTask` (IA + escribe tasks/steps)
- `completeSession` (escribe sessions)
- `generateReward` (IA)
- `getUserMetrics` (placeholder por ahora)

## Firestore (colecciones esperadas)
- `tasks` (userId, title, barrier, strategy, estimatedPomodoros, status, createdAt, completedAt)
- `steps` (taskId, title, action, estimateMinutes, acceptanceCriteria, order, status, completedAt)
- `sessions` (userId, taskId, stepId, startAt, endAt, durationMinutes, completed)

## Entorno
### Functions
- `OPENAI_API_KEY` requerido para atomizeTask y generateReward.

### Frontend
- Variables `VITE_FIREBASE_*` (ver `.env.example` del frontend si existe).

## Guía de respuesta esperada (cuando te pida ayuda)
- Empieza por: diagnóstico corto + propuesta concreta.
- Incluye: impacto + archivos involucrados + pasos de validación.
- Si hay decisiones (tradeoffs), presenta 2 opciones y recomienda una.
- No asumas implementación de métricas si no existe data (documenta placeholders).
