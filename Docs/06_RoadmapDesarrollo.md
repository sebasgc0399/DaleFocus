# Roadmap de Desarrollo DaleFocus — 10-14 Días

> **Última actualización:** 2026-02-10
> **Objetivo:** Completar MVP funcional end-to-end para demo de Reto Developer Foundations

---

## 📋 Tabla de Contenidos

- [Contexto y Objetivos](#contexto-y-objetivos)
- [Roadmap por Fases](#roadmap-por-fases)
  - [Fase 0: Estabilización Demo (Días 1-3)](#fase-0-estabilización-demo-días-1-3)
  - [Fase 1: UX Core (Días 4-7)](#fase-1-ux-core-días-4-7)
  - [Fase 2: Métricas/Momentum (Días 8-11)](#fase-2-métricasmomentum-días-8-11)
  - [Fase 3: Pulido y Presentación (Días 12-14)](#fase-3-pulido-y-presentación-días-12-14)
- [Lista Priorizada de Features](#lista-priorizada-de-features)
- [Checklist Demo Day](#checklist-demo-day)
- [3 Mejoras Alto Impacto](#3-mejoras-alto-impacto)
- [Guías Rápidas](#guías-rápidas)
- [Archivos Críticos](#archivos-críticos)

---

## 🎯 Contexto y Objetivos

### Problema a Resolver
Necesito un roadmap que maximice:
1. **Demo sólida** sin bugs (cualquiera puede probar y votar)
2. **Valor visible** (features que se noten)
3. **Seguridad y costos controlados** (sin sobre-ingeniería)

### Estado Actual del MVP

**✅ Implementado:**
- Backend IA funcional (atomizeTask, generateReward, completeSession)
- Seguridad Firestore robusta con ownership
- Validación Zod + HttpsError en todas las functions
- Componentes React del flujo principal

**🔴 Gaps Críticos:**
1. Login/Register UI ausente → **BLOQUEANTE** para acceso real
2. Métricas retornan placeholder → **IMPACTO ALTO** en demostración de valor
3. Pomodoro sin auto-switch ni recompensas → **IMPACTO MEDIO** en experiencia completa

### Resultado Esperado
Al completar este plan tendré un MVP funcional end-to-end donde cualquier usuario puede:
- Registrarse e iniciar sesión
- Atomizar tareas con IA
- Ejecutar Pomodoros completos con recompensas
- Ver métricas reales de progreso

---

## 🗓️ Roadmap por Fases

## Fase 0: Estabilización Demo (Días 1-3)
**Objetivo:** Hacer funcional el flujo básico completo sin bloqueantes

### 📅 Día 1 — Login/Register UI + Navegación

**Objetivo del día:** Desbloquear acceso a la app y navegación básica

**🎯 Tareas:**

1. **Crear `frontend/src/components/Login.jsx`** (archivo nuevo)
   ```jsx
   // Estructura esperada:
   // - Tabs: "Iniciar Sesión" / "Registrarse"
   // - Campos: email, password, confirmPassword (en registro)
   // - Validación: email válido, password ≥6 chars
   // - Estados: isLoading, error
   ```

   Errores Firebase a manejar:
   - `auth/invalid-email` → "Email inválido"
   - `auth/user-not-found` → "Usuario no encontrado"
   - `auth/wrong-password` → "Contraseña incorrecta"
   - `auth/weak-password` → "La contraseña debe tener al menos 6 caracteres"
   - `auth/email-already-in-use` → "Este email ya está registrado"

2. **Helper `frontend/src/utils/authErrors.js`**
   ```js
   export function parseAuthError(errorCode) {
     const errorMap = {
       'auth/invalid-email': 'Email inválido',
       'auth/user-not-found': 'Usuario no encontrado',
       // ... resto de mapeo
     };
     return errorMap[errorCode] || 'Error al autenticar';
   }
   ```

3. **Integrar Login en `App.jsx`** (líneas 34-44)
   ```jsx
   // Reemplazar:
   {/* TODO: Componente de Login/Register */}
   // Por:
   <Login />
   ```

4. **Navegación en header** (`App.jsx` línea 71)
   - Botón "Dashboard" cuando `currentScreen !== 'dashboard'`
   - Botón "Nueva tarea" cuando `currentScreen === 'dashboard'`
   - Dropdown: `user.displayName` + botón "Cerrar sesión"

**✅ Criterio de Listo:**
- [ ] Usuario puede registrarse con email/password
- [ ] Usuario puede iniciar sesión y ver su nombre en header
- [ ] Navegación funciona entre todas las pantallas
- [ ] Cerrar sesión redirige a login
- [ ] Errores Firebase muestran mensajes claros en español

**⚠️ Riesgo:** Firebase Auth errors no manejados
**🛡️ Mitigación:** Helper centralizado `parseAuthError` + testing con credenciales inválidas

---

### 📅 Día 2 — Real-time Firestore + Completado de Pasos

**Objetivo del día:** Sincronización automática de pasos y marcado como completados

**🎯 Tareas:**

1. **Activar suscripciones real-time en `StepList.jsx`** (línea 20)
   ```jsx
   // Cambiar:
   const steps = currentTask?.steps || [];
   // Por:
   const { steps, isLoading, error } = useSteps(currentTask?.id);
   ```

2. **Implementar completado de pasos** (línea 30)
   ```jsx
   const handleToggleStep = async (stepId) => {
     await markStepCompleted(stepId); // Ya existe en useFirestore.js:119
     // UI se actualiza automáticamente vía real-time
   };
   ```
   - Eliminar estado local `completedSteps` (Set)
   - Deshabilitar checkbox si `step.status === 'completed'`

3. **Recalcular nextBestAction** (línea 87)
   ```jsx
   const nextBestStep = steps.find(s => s.status === 'pending');
   // Agregar indicador visual "⭐ Siguiente paso recomendado"
   ```

4. **Auto-completar tarea** (nuevo)
   ```jsx
   useEffect(() => {
     const allCompleted = steps.every(s => s.status === 'completed');
     if (allCompleted && steps.length > 0) {
       updateTaskStatus(taskId, 'completed');
       // Mostrar modal: "🎉 ¡Tarea completada!"
     }
   }, [steps]);
   ```

**✅ Criterio de Listo:**
- [ ] Marcar paso completo actualiza UI instantáneamente
- [ ] Cambios se reflejan en tiempo real (testar en 2 tabs)
- [ ] Completar último paso marca tarea como completada
- [ ] Modal de celebración aparece

**⚠️ Riesgo:** Race conditions al marcar múltiples pasos
**🛡️ Mitigación:** Confiar en `serverTimestamp()` y transacciones de Firestore

---

### 📅 Día 3 — Pomodoro Completo + Integración generateReward

**Objetivo del día:** Loop completo de Pomodoro con recompensas motivacionales

**🎯 Tareas:**

1. **Auto-switch trabajo/descanso** (`PomodoroTimer.jsx` líneas 37-49)
   ```jsx
   useEffect(() => {
     if (timeLeft === 0) {
       if (!isBreak) {
         setIsBreak(true);
         setTimeLeft(5 * 60); // 5 min descanso
         setPomodoroCount(prev => prev + 1);
       } else {
         setIsBreak(false);
         setTimeLeft(25 * 60); // 25 min trabajo
       }
     }
   }, [timeLeft, isBreak]);
   ```
   - Agregar botón "Saltar descanso" (solo visible en breaks)

2. **Integrar generateReward** (línea 90-91)
   ```jsx
   // Descomentar y agregar fallback:
   const fallbackMessages = [
     "¡Excelente trabajo! Cada paso cuenta.",
     "Sigue así. El progreso es tuyo.",
     "Bien hecho. Siguiente paso."
   ];

   try {
     const result = await generateReward({
       personality: userProfile.personality,
       context: `completó un pomodoro de ${durationMinutes} min en "${activeStep.title}"`
     });
     setRewardMessage(result.message);
   } catch (error) {
     const randomMsg = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
     setRewardMessage(randomMsg);
   }
   ```

3. **Notificaciones** (nuevo)
   - Reproducir sonido: `new Audio('/sounds/complete.mp3').play()`
   - Actualizar `document.title` cada segundo: `"24:32 - Enfoque | DaleFocus"`
   - Solicitar permiso de notificaciones en mount
   - Mostrar notificación cuando `timeLeft === 0`

4. **Persistir firstSessionAt** (`completeSession.js` línea 123)
   ```js
   // Antes de crear sesión:
   const previousSessions = await db.collection('sessions')
     .where('taskId', '==', taskId)
     .limit(1)
     .get();

   if (previousSessions.empty) {
     await db.collection('tasks').doc(taskId).update({
       firstSessionAt: sessionData.startAt
     });
   }
   ```

**✅ Criterio de Listo:**
- [ ] Pomodoro completo: 25min → auto-switch → 5min → auto-switch → 25min
- [ ] Recompensa aparece al terminar cada pomodoro de trabajo
- [ ] Si generateReward falla, muestra fallback (usuario no ve error)
- [ ] `firstSessionAt` se registra en Firestore (validar en Console)
- [ ] Notificaciones y sonido funcionan (opcional)

**⚠️ Riesgo:** `generateReward` puede fallar por timeout/rate limits
**🛡️ Mitigación:** Sistema de fallback robusto con mensajes genéricos aleatorios

---

## Fase 1: UX Core (Días 4-7)
**Objetivo:** Mejorar experiencia de usuario en funcionalidades clave

### 📅 Día 4 — Manejo de Errores Global

**Objetivo del día:** Feedback claro al usuario en todos los flujos

**🎯 Tareas:**

1. **Sistema de toasts** (`frontend/src/components/Toast.jsx`)
   ```jsx
   // Componente simple:
   // - Card flotante esquina superior derecha
   // - Props: type (success/error/warning/info), message, onClose
   // - Auto-cierre 5s
   // - Animación CSS: slide-in desde arriba
   ```

2. **ToastContext** (`frontend/src/contexts/ToastContext.jsx`)
   ```jsx
   const [toasts, setToasts] = useState([]);

   const showToast = (type, message) => {
     const id = Date.now();
     setToasts(prev => [...prev, { id, type, message }]);
     setTimeout(() => removeToast(id), 5000);
   };
   ```

3. **Mejorar error handling** en:
   - **TaskInput.jsx** (línea 37-50):
     - `invalid-argument`: "Verifica que el título sea válido (5-200 caracteres)"
     - `deadline-exceeded`: "La IA tardó demasiado. Intenta con una tarea más corta."
     - `resource-exhausted`: "Has alcanzado el límite (5 req/min). Intenta en [countdown]s."

   - **PomodoroTimer.jsx** (líneas 87, 127):
     - Al fallar `completeSession`: toast warning "No se pudo registrar la sesión"

   - **Dashboard.jsx** (línea 37):
     - Si `failed-precondition`: empty state "Aún no tienes datos suficientes"

4. **ErrorBoundary** (`frontend/src/components/ErrorBoundary.jsx`)
   ```jsx
   // Capturar errores React no manejados
   // UI: "Algo salió mal. [Reintentar]"
   ```

**✅ Criterio de Listo:**
- [ ] Todo error de backend muestra mensaje claro en español
- [ ] Usuario nunca ve errores técnicos raw
- [ ] Toasts aparecen y desaparecen correctamente
- [ ] Countdown de rate limit funciona (testar con 6 requests rápidas)

**⚠️ Riesgo:** Over-engineering del sistema de toasts
**🛡️ Mitigación:** Implementación minimalista (50 líneas máximo), sin librerías

---

### 📅 Día 5 — Loading States y Animaciones

**Objetivo del día:** UI pulida con feedback visual

**🎯 Tareas:**

1. **Loading skeletons en StepList**
   ```jsx
   {isLoading && (
     <>
       <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />
       <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />
       <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />
     </>
   )}
   ```

2. **Progreso visual en atomización** (TaskInput.jsx)
   ```jsx
   const [progress, setProgress] = useState(0);

   // Durante llamada:
   setProgress(30); // 3s
   setTimeout(() => setProgress(60), 3000); // 6s
   // Al responder: setProgress(100)

   // Mensajes rotativos:
   const messages = [
     "Analizando tu tarea...",
     "Identificando pasos clave...",
     "Casi listo..."
   ];
   ```

3. **Loading states mejorados**
   - Dashboard: skeleton cards (3 cards para métricas)
   - AuthContext: spinner en botones durante llamada

4. **Animaciones Tailwind**
   - Transiciones de pantalla: `transition-opacity duration-300`
   - Completado de pasos: `animate-bounce` por 0.5s
   - Botón "Siguiente paso": `animate-pulse`

**✅ Criterio de Listo:**
- [ ] Nunca hay UI congelada sin feedback
- [ ] Animaciones sutiles (200-300ms)
- [ ] Usuario entiende que algo está pasando
- [ ] Barra de progreso da sensación de avance

---

### 📅 Día 6 — Copywriting y Microcopy

**Objetivo del día:** Mejorar textos para conversión y claridad

**🎯 Cambios de Copy:**

| Componente | Antes | Después |
|------------|-------|---------|
| BarrierCheckIn | "¿Qué sientes?" | "¿Qué te está bloqueando hoy?" |
| TaskInput | "Atomizar tarea" | "Crear mi plan" |
| TaskInput placeholder | - | "Ej: Preparar presentación para inversionistas" |
| StepList botón | "Iniciar Pomodoro" | "Comenzar ahora" |
| Dashboard título | "Dashboard" | "Tu progreso" |

**Agregar:**
- Subtítulo BarrierCheckIn: "Vamos a crear un plan que se adapte a cómo te sientes"
- Helper text TaskInput: "Describe la tarea tal como la tienes en mente. No te preocupes por los detalles."
- Tooltips en Dashboard:
  - **Focus Index:** "Promedio de pomodoros por tarea. Más alto = mayor concentración sostenida."
  - **Time-to-Action:** "Minutos desde crear tarea hasta empezarla. Más bajo = menos procrastinación."
  - **Momentum:** "Porcentaje de pasos completados. Más alto = mejor ejecución."

**Landing (Login.jsx):**
- Tagline: "Deja de postergar. Empieza hoy."
- Bullets:
  - "✓ Convierte cualquier tarea en pasos accionables con IA"
  - "✓ Ejecuta con Pomodoro y celebra cada avance"
  - "✓ Mide tu enfoque con métricas que importan"

**✅ Criterio de Listo:**
- [ ] Textos claros, concisos y orientados a acción
- [ ] Sin jerga técnica innecesaria
- [ ] Copy testeable con usuarios no técnicos

---

### 📅 Día 7 — Pulido Visual y Responsividad

**Objetivo del día:** UI profesional en todos los dispositivos

**🎯 Tareas:**

1. **Auditoría de estilos**
   - Espaciados: escala 4-6-8-12-16-24 (múltiplos de 4)
   - Colores: usar variables de `tailwind.config.js`
   - Bordes: `rounded-lg` para cards, `rounded-md` para botones

2. **Responsividad mobile**
   - Testar viewports: 375px (iPhone SE), 768px (iPad), 1920px (Desktop)
   - Inputs: mínimo 16px (evita auto-zoom iOS)
   - Botones: mínimo 44x44px (iOS touch targets)
   - PomodoroTimer: 90% viewport en mobile
   - BarrierCheckIn: grid 2x2 desktop, 1 columna mobile

3. **Empty states**
   - Dashboard sin datos: emoji grande + "Crear tu primera tarea"
   - StepList sin pasos: "No hay pasos aún"

4. **Favicon y meta tags** (index.html)
   ```html
   <link rel="icon" href="/favicon.png" /> <!-- emoji 🚀 -->
   <meta name="description" content="Vence la procrastinación con IA. Atomiza tareas, ejecuta con Pomodoro y mide tu progreso." />
   <meta property="og:title" content="DaleFocus - Atomiza tareas con IA" />
   <meta property="og:description" content="Convierte cualquier tarea en pasos accionables" />
   <meta property="og:image" content="/og-image.png" />
   ```

**✅ Criterio de Listo:**
- [ ] UI funciona en 375px y 1920px
- [ ] No hay overflow horizontal
- [ ] Look & feel profesional y coherente
- [ ] Meta tags correctos (validar con Open Graph validator)

**⚠️ Riesgo:** Demasiado tiempo en detalles visuales
**🛡️ Mitigación:** Timebox 4 horas, priorizar funcionalidad sobre perfección

---

## Fase 2: Métricas/Momentum (Días 8-11)
**Objetivo:** Implementar métricas reales y acumulación de datos

### 📅 Día 8 — Persistencia de Métricas Diarias

**Objetivo del día:** Acumular datos para cálculos futuros

**🎯 Tareas:**

1. **Actualizar métricas en `completeSession.js`** (líneas 118-124)
   ```js
   const now = new Date();
   const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

   await db.collection('metrics').doc(userId).collection('daily').doc(dateStr).set({
     date: admin.firestore.Timestamp.fromDate(new Date(dateStr)),
     pomodorosCompleted: admin.firestore.FieldValue.increment(completed ? 1 : 0),
     totalSessionMinutes: admin.firestore.FieldValue.increment(durationMinutes),
     sessionsCount: admin.firestore.FieldValue.increment(1),
     updatedAt: admin.firestore.FieldValue.serverTimestamp()
   }, { merge: true });
   ```

2. **Incrementar contadores en tareas**
   ```js
   if (taskId) {
     await db.collection('tasks').doc(taskId).update({
       sessionsCount: admin.firestore.FieldValue.increment(1)
     });
   }
   ```

3. **Agregar índice Firestore** (firestore.indexes.json)
   ```json
   {
     "collectionGroup": "sessions",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "userId", "order": "ASCENDING" },
       { "fieldPath": "completed", "order": "ASCENDING" },
       { "fieldPath": "startAt", "order": "DESCENDING" }
     ]
   }
   ```

**✅ Criterio de Listo:**
- [ ] Cada sesión actualiza documento de métricas diarias
- [ ] Datos visibles en Firestore Console
- [ ] No hay errores de permisos o índices
- [ ] Contadores usan `increment()` (atómico)

**⚠️ Riesgo:** Race conditions al actualizar métricas
**🛡️ Mitigación:** `FieldValue.increment()` es transaccional

---

### 📅 Día 9 — Implementar getUserMetrics (Parte 1)

**Objetivo del día:** Focus Index y Barriers calculados desde datos reales

**🎯 Tareas:**

1. **Calcular Focus Index** (getUserMetrics.js líneas 47-58)
   ```js
   const userId = request.auth.uid;
   const startDate = new Date();
   startDate.setDate(startDate.getDate() - days);

   // Total pomodoros completados
   const sessionsSnap = await db.collection('sessions')
     .where('userId', '==', userId)
     .where('completed', '==', true)
     .where('startAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
     .get();
   const totalPomodoros = sessionsSnap.size;

   // Total tareas completadas
   const tasksSnap = await db.collection('tasks')
     .where('userId', '==', userId)
     .where('status', '==', 'completed')
     .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
     .get();
   const totalTasks = tasksSnap.size;

   const focusIndex = totalTasks > 0 ? (totalPomodoros / totalTasks).toFixed(1) : 0;
   ```

2. **Calcular Barriers** (líneas 68-69)
   ```js
   const allTasksSnap = await db.collection('tasks')
     .where('userId', '==', userId)
     .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
     .get();

   const barriers = { overwhelmed: 0, uncertain: 0, bored: 0, perfectionism: 0 };
   allTasksSnap.forEach(doc => {
     const barrier = doc.data().barrier;
     if (barriers.hasOwnProperty(barrier)) {
       barriers[barrier]++;
     }
   });
   ```

3. **Manejar caso sin datos**
   ```js
   // Eliminar: throw new HttpsError('failed-precondition', ...)
   // Retornar:
   return {
     focusIndex: 0,
     timeToAction: 0,
     momentum: 0,
     barriers: { overwhelmed: 0, uncertain: 0, bored: 0, perfectionism: 0 },
     pomodorosThisWeek: 0,
     tasksCompletedThisWeek: 0
   };
   ```

**✅ Criterio de Listo:**
- [ ] Dashboard muestra Focus Index real (no 0 hardcoded)
- [ ] Gráfico de barreras refleja tareas del periodo
- [ ] Usuario sin datos ve 0s con empty state
- [ ] Queries en < 2 segundos

---

### 📅 Día 10 — Implementar getUserMetrics (Parte 2)

**Objetivo del día:** Time-to-Action y Momentum calculados

**🎯 Tareas:**

1. **Calcular Time-to-Action** (líneas 60-61)
   ```js
   const tasksWithFirstSession = await db.collection('tasks')
     .where('userId', '==', userId)
     .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
     .get();

   let ttaSum = 0;
   let ttaCount = 0;

   tasksWithFirstSession.forEach(doc => {
     const data = doc.data();
     if (data.firstSessionAt && data.createdAt) {
       const ttaMs = data.firstSessionAt.toMillis() - data.createdAt.toMillis();
       const ttaMinutes = Math.round(ttaMs / (1000 * 60));
       ttaSum += ttaMinutes;
       ttaCount++;
     }
   });

   const timeToAction = ttaCount > 0 ? Math.round(ttaSum / ttaCount) : 0;
   ```

2. **Calcular Momentum** (líneas 63-66)
   ```js
   const taskIds = tasksSnap.docs.map(doc => doc.id);

   if (taskIds.length === 0) {
     const momentum = 0;
   } else {
     const stepsSnap = await db.collection('steps')
       .where('taskId', 'in', taskIds.slice(0, 10)) // Límite 10 para MVP
       .get();

     let stepsCompleted = 0;
     let totalSteps = 0;

     stepsSnap.forEach(doc => {
       totalSteps++;
       if (doc.data().status === 'completed') {
         stepsCompleted++;
       }
     });

     const momentum = totalSteps > 0 ? Math.round((stepsCompleted / totalSteps) * 100) : 0;
   }
   ```

3. **Cache en frontend** (Dashboard.jsx)
   ```jsx
   const cacheKey = `metrics-${user.uid}-${days}`;
   const cached = sessionStorage.getItem(cacheKey);
   if (cached) {
     const { data, timestamp } = JSON.parse(cached);
     if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 min
       return data;
     }
   }
   // ... después de fetch:
   sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
   ```

**✅ Criterio de Listo:**
- [ ] Time-to-Action muestra promedio correcto
- [ ] Momentum refleja porcentaje real
- [ ] Queries en < 3 segundos
- [ ] Cache evita llamadas innecesarias

---

### 📅 Día 11 — Gráfico de Progreso Semanal

**Objetivo del día:** Visualización de progreso en Dashboard

**🎯 Tareas:**

1. **Agregar weeklyPomodoros a getUserMetrics**
   ```js
   const weeklyPomodoros = [];
   for (let i = 6; i >= 0; i--) {
     const dayDate = new Date();
     dayDate.setDate(dayDate.getDate() - i);
     const dayStr = dayDate.toISOString().split('T')[0];

     const daySessions = await db.collection('sessions')
       .where('userId', '==', userId)
       .where('completed', '==', true)
       .where('startAt', '>=', admin.firestore.Timestamp.fromDate(new Date(dayStr)))
       .where('startAt', '<', admin.firestore.Timestamp.fromDate(new Date(dayStr + 'T23:59:59')))
       .get();

     weeklyPomodoros.push(daySessions.size);
   }

   return {
     // ... otras métricas
     weeklyPomodoros,
     weekLabels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
   };
   ```

2. **Gráfico en Dashboard.jsx**
   ```jsx
   <div className="flex items-end gap-2 h-32">
     {metrics.weeklyPomodoros.map((count, i) => {
       const maxCount = Math.max(...metrics.weeklyPomodoros);
       return (
         <div key={i} className="flex-1 flex flex-col items-center gap-1">
           <div
             className="w-full bg-primary-500 rounded-t flex items-center justify-center"
             style={{ height: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
           >
             <span className="text-xs text-white">{count}</span>
           </div>
           <span className="text-xs text-gray-500">{metrics.weekLabels[i]}</span>
         </div>
       );
     })}
   </div>
   ```

3. **Indicador de racha**
   ```js
   let currentStreak = 0;
   for (let i = weeklyPomodoros.length - 1; i >= 0; i--) {
     if (weeklyPomodoros[i] > 0) {
       currentStreak++;
     } else {
       break;
     }
   }
   // Mostrar: "🔥 Llevas X días consecutivos" (solo si streak > 0)
   ```

**✅ Criterio de Listo:**
- [ ] Gráfico se renderiza con datos reales
- [ ] Altura de barras proporcional
- [ ] Responsive en mobile
- [ ] Indicador de racha aparece cuando corresponde

---

## Fase 3: Pulido y Presentación (Días 12-14)
**Objetivo:** Optimizar para demo, testing final

### 📅 Día 12 — Rate Limiting en generateReward

**Objetivo del día:** Proteger costos de OpenAI

**🎯 Tareas:**

1. **Implementar rate limiting** (generateReward.js)
   ```js
   const RATE_LIMIT_WINDOW_MS = 60 * 1000;
   const RATE_LIMIT_MAX_REQUESTS = 10;

   // Copiar lógica de atomizeTask.js líneas 139-193
   // Colección: rate_limits_reward/{userId}
   ```

2. **Fallback cuando se excede**
   ```js
   const FALLBACK_MESSAGES = [
     "¡Excelente trabajo! Cada paso cuenta.",
     "Sigue así. El progreso es tuyo.",
     "Bien hecho. Siguiente paso.",
     "Lo estás logrando. No pares.",
     "Avanzas bien. Continúa."
   ];

   if (rateLimitExceeded) {
     const randomIndex = Math.floor(Math.random() * FALLBACK_MESSAGES.length);
     return { message: FALLBACK_MESSAGES[randomIndex] };
   }
   ```

**✅ Criterio de Listo:**
- [ ] `generateReward` rechaza más de 10 req/60s
- [ ] Usuario ve fallback (no error)
- [ ] Costos protegidos
- [ ] Testar: 11 llamadas rápidas

---

### 📅 Día 13 — Testing End-to-End y Fixes

**Objetivo del día:** Probar flujo completo y corregir bugs

**🎯 Checklist de Testing:**

**Happy Path:**
- [ ] Registro de usuario nuevo
- [ ] Iniciar sesión
- [ ] Check-in con barrera "Abrumado"
- [ ] Crear tarea: "Preparar demo para inversionistas"
- [ ] Atomizar (verificar 3-5 pasos)
- [ ] Marcar primer paso como activo
- [ ] Iniciar Pomodoro 25 min
- [ ] Completar Pomodoro (acortar en DevTools)
- [ ] Verificar recompensa aparece
- [ ] Completar todos los pasos
- [ ] Modal "Tarea completada"
- [ ] Dashboard con métricas reales (Focus Index > 0)
- [ ] Cerrar sesión
- [ ] Login y verificar persistencia

**Test 4 Barreras:**
- [ ] Crear tarea con cada barrera
- [ ] Verificar estrategias IA diferentes
- [ ] Validar gráfico de barreras en Dashboard

**Casos Edge:**
- [ ] Usuario cierra browser en medio de pomodoro
- [ ] Tarea muy corta ("responder email")
- [ ] 6 atomizaciones en 1 minuto (rate limit)
- [ ] Dashboard sin datos (empty state)
- [ ] Marcar mismo paso dos veces rápido

**Performance:**
- [ ] Lighthouse score > 70
- [ ] Carga inicial < 3s
- [ ] Atomización < 20s
- [ ] No memory leaks

**✅ Criterio de Listo:**
- [ ] Flujo completo sin errores en Chrome Desktop y Mobile
- [ ] 0 bugs bloqueantes
- [ ] Máximo 2-3 bugs importantes conocidos

---

### 📅 Día 14 — Demo Script y Presentación Final

**Objetivo del día:** Preparar presentación y deploy final

**🎯 Tareas:**

1. **Actualizar `Docs/04_DemoScript.md`**
   - Ajustar timing del guion de 60s
   - Actualizar guion de 3 min para jurado

2. **Crear cuenta demo con datos seed**
   - Email: `demo@dalefocus.app` / Password: `Demo2024!`
   - 3 tareas completadas:
     - "Preparar presentación para reto" (overwhelmed, 4 pasos)
     - "Revisar documentación técnica" (bored, 3 pasos)
     - "Definir alcance del MVP" (uncertain, 5 pasos)
   - 1 tarea en progreso: "Implementar login" (overwhelmed, 2/4 pasos)
   - ~12 sesiones → Focus Index ≈ 3.5
   - Time-to-Action ≈ 15 min
   - Momentum ≈ 80%

3. **Screenshots para README**
   - Capturar: Login, Check-in, Atomización, StepList, Pomodoro, Dashboard
   - Guardar en `Docs/screenshots/`

4. **Actualizar README.md**
   - Estado: "✅ MVP funcional"
   - Galería de screenshots
   - Link al demo live

5. **Video demo 60s** (opcional)
   - Screen recording con voz
   - Subir a YouTube/Loom
   - Agregar link en README

6. **Deploy final**
   ```bash
   cd frontend && npm run build && cd ..
   firebase deploy --only hosting,functions,firestore:rules,firestore:indexes
   ```
   - Verificar demo live funciona
   - Testar en mobile real

7. **Ensayo de presentación**
   - Practicar demo 60s (3 veces mínimo)
   - Preparar respuestas a Q&A:
     - "¿Por qué Firebase?" → Velocidad + seguridad built-in
     - "¿Cómo evitas costos OpenAI?" → Rate limiting transaccional
     - "¿Qué sigue?" → Calendarios, móvil nativa, más personalidades

**✅ Criterio de Listo:**
- [ ] Demo 60s ensayado 3+ veces
- [ ] README atractivo con screenshots
- [ ] Deploy estable en producción
- [ ] Cuenta demo lista
- [ ] Video de respaldo grabado

---

## 📊 Lista Priorizada de Features

### 🔴 MUST (Indispensable)

| # | Feature | Justificación | Día |
|---|---------|---------------|-----|
| 1 | Login/Register UI | **SIN ESTO NO HAY DEMO** | 1 |
| 2 | Pomodoro completo | **CORE DEL PRODUCTO** | 3 |
| 3 | generateReward integrado | **DIFERENCIADOR** | 3 |
| 4 | Real-time StepList | **PERCEPCIÓN MODERNIDAD** | 2 |
| 5 | Métricas reales | **PRUEBA DE VALOR** | 9 |
| 6 | Manejo de errores | **EVITA FRUSTRACIÓN** | 4 |

### 🟡 SHOULD (Mejora fuerte)

| # | Feature | Justificación | Día |
|---|---------|---------------|-----|
| 7 | Time-to-Action y Momentum | **DIFERENCIADOR TÉCNICO** | 10 |
| 8 | Gráfico semanal | **ENGAGEMENT VISUAL** | 11 |
| 9 | Loading states | **PULIDO PROFESIONAL** | 5 |
| 10 | Copywriting mejorado | **AUMENTA COMPRENSIÓN** | 6 |
| 11 | Rate limiting reward | **CONTROL COSTOS** | 12 |
| 12 | Responsividad mobile | **ALCANCE AMPLIO** | 7 |

### 🟢 COULD (Nice-to-have)

| # | Feature | Justificación | Día |
|---|---------|---------------|-----|
| 13 | Notificaciones/sonidos | **DELIGHT EXTRA** | 3 |
| 14 | Indicador de racha | **GAMIFICACIÓN** | 11 |
| 15 | Video demo | **MARKETING** | 14 |

---

## ✅ Checklist Demo Day

### Verificación técnica (30s)
- [ ] Abrir https://dalefocus-3f26d.web.app/ en incógnito
- [ ] Carga en < 3s sin errores
- [ ] Firebase conectado

### Login y check-in (30s)
- [ ] Login: `demo@dalefocus.app` / `Demo2024!`
- [ ] Nombre aparece en header
- [ ] Dashboard → métricas reales (Focus Index ≈ 3.5)
- [ ] Click "Nueva tarea"

### Atomización (45s)
- [ ] Seleccionar "Abrumado"
- [ ] Tarea: "Preparar demo para inversionistas"
- [ ] Click "Crear mi plan"
- [ ] Barra de progreso funciona
- [ ] IA responde en < 15s con 3-5 pasos

### Pomodoro (30s)
- [ ] Click "Comenzar ahora"
- [ ] Temporizador inicia 25:00
- [ ] DevTools: `window.dispatchEvent(new Event('test-complete-pomodoro'))`
- [ ] Recompensa aparece

### Dashboard final (15s)
- [ ] Navegar a Dashboard
- [ ] Métricas reales (no 0s)
- [ ] Gráfico semanal renderiza
- [ ] Barreras correctas

### Backup plan
- [ ] Slides con screenshots
- [ ] Video pre-grabado 60s
- [ ] Respuesta preparada si falla

---

## 🚀 3 Mejoras Alto Impacto

### 1. Personalidad IA Seleccionable

**Esfuerzo:** 2-3 horas | **Impacto:** Alto

**Implementación:**
Pantalla después de registro: "¿Cómo te motivo mejor?"

- 🏆 **Coach Pro:** "¡Increíble! Cada paso te acerca a tu meta."
- 🤙 **Pana Real:** "¡Vamos! Lo estás rompiendo."
- 🎖️ **Sargento:** "Buen trabajo, soldado. No afloje."
- 😂 **Meme Lord:** "LET'S GOOOO 🔥"

Guardar en `users/{uid}.personality` (ya usado por backend)

**Por qué aumenta votos:**
- Feature único y memorable
- Demuestra sofisticación técnica
- Genera conversación social
- Personalización = producto maduro

---

### 2. Micro-animaciones Celebración

**Esfuerzo:** 1-2 horas | **Impacto:** Medio-Alto

**Implementación:**
```bash
npm install canvas-confetti
```

```js
import confetti from 'canvas-confetti';

// Al completar paso:
confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

// Al completar tarea:
confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
```

**Por qué aumenta votos:**
- Feedback emocional positivo
- Refuerzo del loop de dopamina
- Percepción de app "completa"
- Aumenta shareability

---

### 3. Compartir Logros en Redes

**Esfuerzo:** 2 horas | **Impacto:** Alto

**Implementación:**
Botón "Compartir mi progreso" en Dashboard

```js
const shareText = `Esta semana completé ${metrics.pomodorosThisWeek} pomodoros y terminé ${metrics.tasksCompletedThisWeek} tareas con @DaleFocus.

Mi Focus Index es ${metrics.focusIndex}. ¿Cuál es el tuyo?

Pruébalo: dalefocus-3f26d.web.app`;

// Links:
// Twitter: https://twitter.com/intent/tweet?text={encodeURIComponent(shareText)}
// LinkedIn: https://www.linkedin.com/sharing/share-offsite/?url={url}
// WhatsApp: https://wa.me/?text={encodeURIComponent(shareText)}
```

**Por qué aumenta votos:**
- Awareness orgánico
- Prueba social
- Call-to-action para jurado
- Viralidad = product-market fit

---

## 🔧 Guías Rápidas

### Manejo de Errores por Código

| Código | Contexto | Mensaje | Acción UI |
|--------|----------|---------|-----------|
| `invalid-argument` | Validación Zod | "Verifica los datos" | Highlight campo |
| `unauthenticated` | Token expiró | "Sesión expirada" | Redirect login (3s) |
| `deadline-exceeded` | OpenAI timeout | "IA tardó demasiado" | Botón "Reintentar" |
| `resource-exhausted` | Rate limit | "Límite alcanzado. [60s]" | Countdown |
| `failed-precondition` | Sin API key | "Servicio no disponible" | CTA apropiado |
| `internal` | Error inesperado | "Algo salió mal" | "Reportar problema" |

---

### Estrategia Rate Limiting

**atomizeTask** (implementado ✅)
- **Límite:** 5 requests / 60s
- **Recomendación:** MANTENER
- **Justificación:** Suficiente para uso normal, protege contra abuso

**generateReward** (implementar Día 12)
- **Límite:** 10 requests / 60s
- **Fallback:** Mensajes genéricos (no error)
- **Justificación:** Más generoso, modelo más barato, previene abuso

**Monitoreo:**
- Firebase Console: invocations por función
- Alertas si costos > $10/día
- Ajustar basado en uso real

---

## 📁 Archivos Críticos

### CREAR (nuevos)
```
frontend/src/components/Login.jsx             → Día 1 (BLOQUEANTE)
frontend/src/utils/authErrors.js              → Día 1
frontend/src/components/Toast.jsx             → Día 4
frontend/src/contexts/ToastContext.jsx        → Día 4
frontend/src/components/ErrorBoundary.jsx     → Día 4
```

### MODIFICAR (existentes)

| Archivo | Líneas | Cambio | Día |
|---------|--------|--------|-----|
| `frontend/src/App.jsx` | 34-44, 71 | Login + header nav | 1 |
| `frontend/src/components/StepList.jsx` | 20, 30, 87 | Real-time + completado | 2 |
| `frontend/src/components/PomodoroTimer.jsx` | 37-49, 90-91 | Auto-switch + reward | 3 |
| `functions/src/completeSession.js` | 118-124 | Métricas + firstSessionAt | 3, 8 |
| `functions/src/getUserMetrics.js` | 44-76 | Cálculo real | 9-10 |
| `frontend/src/components/Dashboard.jsx` | 37+ | Errors + gráfico + cache | 4, 11 |
| `functions/src/generateReward.js` | + | Rate limiting | 12 |
| `Docs/04_DemoScript.md` | Todo | Actualizar | 14 |
| `README.md` | Todo | Screenshots + MVP | 14 |

---

## 📝 Notas Finales

### Decisiones Arquitectónicas
- ✅ Priorizar demo funcional end-to-end antes que features avanzadas
- ✅ Implementar fallbacks graciosos en lugar de mostrar errores
- ✅ Usar `FieldValue.increment()` para atomicidad
- ✅ Cachear métricas en frontend (5 min)
- ✅ Rate limiting con fallback (no bloqueo duro)

### Cuándo Conectar generateReward
**Día 3 (Fase 0)** — Es parte del core loop, no nice-to-have. Sin esto, la propuesta de valor está incompleta.

### Si Algo Sale Mal
- **Días 1-3:** Priorizar Login (Día 1) y Pomodoro (Día 3). Real-time (Día 2) puede postponerse.
- **Días 9-11:** Si métricas es complejo, implementar solo Focus Index y Barriers (Día 9), postponer TTA y Momentum.
- **Día 13:** Priorizar fixes de happy path sobre casos edge.

### Riesgo Global Más Crítico
Descubrir problemas arquitectónicos en Día 10-12.
**Mitigación:** Testing incremental cada 2-3 días, no esperar al Día 13.

---

**✨ ¡Éxito con el desarrollo! Este roadmap maximiza demo sólida, valor visible y costos controlados.**
