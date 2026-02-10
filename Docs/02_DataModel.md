# 02 DataModel

## Colecciones Principales

### 1) `users/{uid}`
Origen: `frontend/src/contexts/AuthContext.jsx` (registro de usuario).

Campos observados en codigo:
- `displayName: string`
- `personality: 'coach-pro' | 'pana-real' | 'sargento' | 'meme-lord'`
- `pomodoroConfig: { workMinutes, shortBreak, longBreak, pomodorosUntilLongBreak }`
- `createdAt: Date`

Regla de ownership:
- Solo el propio usuario puede leer/escribir su perfil.

---

### 2) `tasks/{taskId}`
Origen: `functions/src/atomizeTask.js`.

Campos escritos hoy:
- `userId: string`
- `title: string`
- `barrier: 'overwhelmed' | 'uncertain' | 'bored' | 'perfectionism'`
- `strategy: string`
- `estimatedPomodoros: number`
- `status: 'active' | 'completed' | 'abandoned'` (en codigo hoy se crea como `'active'`)
- `createdAt: Date`
- `completedAt: Date | null`

Notas:
- `firstSessionAt` aparece en comentarios de metricas, pero no se guarda aun.

Regla de ownership:
- Create: `request.auth.uid == request.resource.data.userId`
- Read/Update/Delete: `request.auth.uid == resource.data.userId`

---

### 3) `steps/{stepId}`
Origen: `functions/src/atomizeTask.js`.

Campos escritos hoy:
- `taskId: string`
- `title: string`
- `action: string`
- `estimateMinutes: number`
- `acceptanceCriteria: string[]`
- `order: number`
- `status: 'pending' | 'in_progress' | 'completed'` (en codigo hoy se crea como `'pending'`)
- `completedAt: Date | null`

Regla de ownership:
- No usa `userId` directo en el documento `step`.
- El acceso se valida por owner de la tarea padre `tasks/{taskId}`.

---

### 4) `sessions/{sessionId}`
Origen: `functions/src/completeSession.js`.

Campos escritos hoy:
- `userId: string`
- `taskId: string | null`
- `stepId: string | null`
- `startAt: Date`
- `endAt: Date`
- `durationMinutes: number`
- `completed: boolean`

Regla de ownership:
- Create: `request.auth.uid == request.resource.data.userId`
- Read/Update/Delete: `request.auth.uid == resource.data.userId`

---

### 5) `metrics/{userId}/daily/{date}`
Origen: reglas + comentarios de backend (`completeSession`, `getUserMetrics`).

Estado actual:
- Definida en reglas de seguridad.
- Aun no hay escritura activa desde functions.

Regla de ownership:
- Solo el propio `userId` del path puede leer/escribir.

## Relacion Entre Entidades
- Un `user` crea muchas `tasks`.
- Una `task` tiene muchos `steps`.
- Un `user` registra muchas `sessions`.
- Una `session` puede apuntar a una `task` y/o `step`.

## Consultas Usadas En Frontend
- `tasks` por usuario, ordenadas por fecha:
  - `where('userId', '==', userId)` + `orderBy('createdAt', 'desc')`
- `steps` por tarea, ordenados por orden:
  - `where('taskId', '==', taskId)` + `orderBy('order', 'asc')`

Fuente: `frontend/src/hooks/useFirestore.js`.

## Indices Firestore
Archivo: `firestore.indexes.json`

Indices compuestos recomendados/definidos para las consultas actuales:
1. `tasks`: `userId ASC`, `createdAt DESC`
2. `steps`: `taskId ASC`, `order ASC`

## Reglas De Ownership (Resumen)
Archivo: `firestore.rules`

- `users/{userId}`: owner directo por path.
- `tasks/{taskId}`: owner por campo `userId`.
- `steps/{stepId}`: owner heredado de `tasks/{taskId}`.
- `sessions/{sessionId}`: owner por campo `userId`.
- `metrics/{userId}/daily/{date}`: owner directo por path.

## Gap Conocido
- Si en el futuro se crean `tasks` sin `userId`, las reglas romperan lectura/escritura sobre esa data.
- Mitigacion: mantener `userId` obligatorio en toda creacion de `task` (ya se valida en `atomizeTask`).
