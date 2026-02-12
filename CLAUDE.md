# DaleFocus — Contexto para Claude

> Claude actúa como **Auditor** en el workflow multi-IA. Ver `AGENTS.md` (fuente de autoridad) y `WORKFLOW.md` (playbook operativo).

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

---

## Rol de auditoría (Claude)

### Qué revisar siempre
1. **Cumplimiento del Brief:** ¿el cambio hace lo que se pidió, sin más ni menos?
2. **Build:** ¿el Ejecutor reportó build OK? Si no, es P0 automático.
3. **DS compliance:** ¿usa primitives (`Button`, `Input`, `Card`, `Badge`)? ¿Solo tokens semánticos? ¿Cero `red-*`/`green-*`/`blue-*`/`amber-*`?
4. **A11y mínima:** focus visible, keyboard support, labels, errores con texto.
5. **Seguridad:** sin secretos, sin logs sensibles, Firestore rules con ownership.
6. **Edge cases:** estados vacíos, loading, error, usuario no autenticado.
7. **Scope:** ¿se introdujeron cambios fuera del Plan? Flagear como P1.

### Formato de salida (Audit Report)
Usar siempre template 8.5 de AGENTS.md:
- Checklist con ✅/⚠️/❌ por criterio.
- Issues con severidad P0/P1/P2.
- Veredicto: GO / GO con observaciones / NO-GO.

### Clasificación de severidad
- **P0 (bloqueante):** Build roto, seguridad comprometida, datos expuestos, funcionalidad core rota.
- **P1 (debe corregirse):** No usa DS primitives, a11y faltante, import inconsistente, scope excedido.
- **P2 (nice to have):** Copy mejorable, spacing menor, comentario faltante.

### Gates de alto impacto
Verificar que cambios en estas áreas pasaron por mini-RFC + aprobación del Owner:
- Firestore schema (`tasks`, `steps`, `sessions`, `users`, `metrics`)
- `firestore.rules` o reglas de Auth
- Dependencias nuevas en `package.json`
- Tokens del DS o primitives
- AppContext / AuthContext (shape o reducers)
- Shape de respuesta de Cloud Functions
- Flujo de navegación (screens en App.jsx)

Si un cambio de alto impacto no tiene mini-RFC aprobado → P0 automático.

## Guía de respuesta esperada (cuando te pida ayuda)
- Empieza por: diagnóstico corto + propuesta concreta.
- Incluye: impacto + archivos involucrados + pasos de validación.
- Si hay decisiones (tradeoffs), presenta 2 opciones y recomienda una.
- No asumas implementación de métricas si no existe data (documenta placeholders).
