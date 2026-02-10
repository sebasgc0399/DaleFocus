# 03 Metrics

Este documento describe las metricas exactamente como estan definidas en el codigo actual.

Fuente principal: `functions/src/getUserMetrics.js`.

## Estado Actual Del Endpoint
`GET /getUserMetrics?userId=<uid>&days=<n>`:
- Acepta `days` opcional (default: `7`).
- Valida autenticacion y match de `userId`.
- Hoy retorna placeholder fijo:
  - `focusIndex: 0`
  - `timeToAction: 0`
  - `momentum: 0`
  - `barriers: { overwhelmed: 0, uncertain: 0, bored: 0, perfectionism: 0 }`
  - `pomodorosThisWeek: 0`
  - `tasksCompletedThisWeek: 0`

## Definiciones Objetivo (Ya Indicadas En Comentarios De Codigo)

### 1) Focus Index
Definicion (comentada en codigo):
`Focus Index = totalPomodorosCompletados / totalTareasCompletadas`

Interpretacion:
- Pomodoros completados: sesiones en `sessions` con `completed == true` dentro del rango.
- Tareas completadas: tareas en `tasks` con `status == 'completed'` y `completedAt` en rango.

Ejemplo pequeno:
- 12 sesiones completadas
- 3 tareas completadas
- `Focus Index = 12 / 3 = 4.0`

---

### 2) Time-to-Action (TTA)
Definicion (comentada en codigo):
`TTA = promedio(firstSessionAt - createdAt) en minutos`

Interpretacion:
- Por cada tarea con `firstSessionAt`, medir minutos desde creacion de tarea hasta primer inicio real.

Ejemplo pequeno:
- Tarea A: 20 min
- Tarea B: 40 min
- Tarea C: 10 min
- `TTA = (20 + 40 + 10) / 3 = 23.3 min`

Nota de implementacion:
- `firstSessionAt` aun no se persiste en tareas; por eso este calculo todavia no puede ejecutarse de punta a punta.

---

### 3) Momentum
Definicion (comentada en codigo):
`Momentum = (pasosCompletados / totalPasos) * 100`

Interpretacion:
- Se compara avance real sobre lo planificado en pasos atomizados.

Ejemplo pequeno:
- 9 pasos completados de 12 planificados
- `Momentum = (9 / 12) * 100 = 75%`

---

### 4) Barreras Semanales
Definicion (comentada en codigo):
Conteo de frecuencia por barrera en tareas creadas dentro del rango (`days`, default 7).

Categorias:
- `overwhelmed`
- `uncertain`
- `bored`
- `perfectionism`

Ejemplo pequeno (7 dias):
- overwhelmed: 4
- uncertain: 2
- bored: 3
- perfectionism: 1

## Donde Se Alimentan Los Datos
- `tasks`: creadas por `atomizeTask`.
- `steps`: creados por `atomizeTask`.
- `sessions`: creadas por `completeSession`.

## Gap Tecnico Actual
Para pasar de placeholder a metricas reales faltan, como minimo:
1. Implementar consultas reales en `getUserMetrics`.
2. Registrar `firstSessionAt` en la tarea cuando inicia la primera sesion.
3. Marcar pasos/tareas completadas de forma consistente en flujo productivo.
