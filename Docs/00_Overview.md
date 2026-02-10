# 00 Overview

## Que Es DaleFocus
DaleFocus es una app web de productividad que convierte tareas ambiguas en pasos concretos usando IA, considerando primero la barrera emocional del usuario.

## Usuario Objetivo
- Estudiantes y profesionales que procrastinan al iniciar tareas.
- Personas que saben que hacer, pero se bloquean para empezar.
- Usuarios que necesitan avance visible en bloques cortos (Pomodoro).

## Problema
La mayoria de apps de tareas guardan pendientes, pero no destraban el momento mas dificil: iniciar accion cuando hay bloqueo emocional (abrumado, incierto, aburrido o perfeccionismo).

## Solucion
DaleFocus combina cuatro piezas:
1. Check-in emocional rapido.
2. Atomizador IA que devuelve JSON estructurado y accionable.
3. Ejecucion por pasos + temporizador Pomodoro.
4. Dashboard de metricas de comportamiento.

## Alcance MVP Actual (Segun Codigo)
- Check-in emocional con 4 barreras en `frontend/src/components/BarrierCheckIn.jsx`.
- Atomizacion por IA via `atomizeTask` en `functions/src/atomizeTask.js`.
- Registro de sesiones Pomodoro via `completeSession` en `functions/src/completeSession.js`.
- Generacion de recompensa via `generateReward` en `functions/src/generateReward.js` (endpoint listo).
- Dashboard que consume `getUserMetrics` en `frontend/src/components/Dashboard.jsx`.
- Persistencia base en Firestore: `users`, `tasks`, `steps`, `sessions`.

## Estado Actual Importante
- `getUserMetrics` hoy retorna valores placeholder en `0` (contrato definido, calculo real pendiente).
- El contexto de autenticacion existe (`AuthContext`), pero la UI de login/register en `App.jsx` sigue como TODO.
- Las Functions HTTP ya validan Firebase ID token y match de `userId`.

## Fuera De Alcance En Esta Version
- Gamificacion avanzada (insignias, rachas, ranking).
- Social/accountability entre usuarios.
- Personalizacion automatica avanzada del atomizador segun historial.
