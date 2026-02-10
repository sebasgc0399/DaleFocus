# 04 DemoScript

## Pre-Demo Checklist (30s antes)
- Tener usuario autenticado en Firebase Auth.
- Verificar que `OPENAI_API_KEY` este configurada en functions.
- Abrir app en estado limpio (pantalla inicial del flujo).

## Guion 60s (Version Pitch)

### 0s - 8s: Problema
"Todos tenemos tareas que no empezamos por bloqueo emocional, no por falta de lista de pendientes. DaleFocus ataca ese punto exacto."

### 8s - 18s: Login + Check-in
1. Mostrar login (o sesion ya iniciada).
2. Elegir barrera emocional (ejemplo: `overwhelmed`).

### 18s - 34s: Atomizador IA
3. Escribir tarea real (ejemplo: "Preparar demo para inversionistas").
4. Click en "Atomizar tarea".
5. Mostrar que llega un JSON de pasos accionables (titulo, accion, minutos, criterios).

### 34s - 48s: Ejecucion + Pomodoro
6. Abrir primer paso recomendado.
7. Iniciar Pomodoro y explicar el loop: accion pequena -> progreso.

### 48s - 55s: Recompensa
8. Cerrar sesion y mencionar recompensa motivacional personalizada (`generateReward`).

### 55s - 60s: Dashboard
9. Ir a Dashboard y cerrar con metricas clave: Focus Index, TTA, Momentum y barreras.

Cierre sugerido:
"No solo te dice que hacer: te ayuda a empezar, sostener y medir tu avance."

## Guion 3 Min (Version Jurado)

### Bloque 1 (0:00 - 0:35) Contexto y Diferencial
- Problema: procrastinacion por bloqueo emocional.
- Diferencial: input emocional + atomizacion JSON + ejecucion + analitica.

### Bloque 2 (0:35 - 1:25) Flujo Producto
1. Login con Firebase Auth.
2. Check-in emocional (4 barreras).
3. Crear tarea y atomizar con IA.
4. Revisar pasos y `nextBestActionId`.
5. Iniciar Pomodoro sobre un paso concreto.
6. Registrar sesion con `completeSession`.

### Bloque 3 (1:25 - 2:10) Arquitectura
- Frontend React/Vite.
- Cloud Functions Gen2 (`onCall` Callable) para logica y OpenAI.
- Firestore para `users`, `tasks`, `steps`, `sessions`.
- Seguridad: Firestore Rules + verificacion de ID token en backend.

### Bloque 4 (2:10 - 2:45) Metricas
- Explicar formulas objetivo:
  - Focus Index = pomodoros completados / tareas completadas.
  - TTA = promedio desde crear tarea hasta primera sesion.
  - Momentum = pasos completados / pasos planificados.
- Aclarar estado actual del repo: endpoint de metricas aun devuelve placeholder en `0`.

### Bloque 5 (2:45 - 3:00) Roadmap
- Login UI final.
- Calculo real de metricas.
- Integracion de recompensa en timer en vivo.
- Rate limiting en atomizador.

## Frases Cortas Para Q&A
- "El core no es un chat: es un contrato JSON ejecutable por UI."
- "La barrera emocional cambia la estrategia de pasos, no solo el copy."
- "La seguridad se apoya en reglas por ownership y auth automatica de Callable Functions."
