# DaleFocus — Constitución Operativa Multi-IA

> **Este archivo es la fuente de autoridad.** Ningún AGENTS.md en subcarpeta puede contradecirlo.

---

## 1. Jerarquía de reglas

| Nivel | Archivo | Alcance |
|---|---|---|
| 1 (máximo) | `AGENTS.md` (raíz) | Todo el repo |
| 2 | `AGENTS.md` en subcarpeta | Solo esa carpeta y sus hijos |
| 3 | `CLAUDE.md` | Contexto específico para Claude |

**Regla de herencia:**
- Un `AGENTS.md` en subcarpeta **hereda** todas las reglas de la raíz.
- Puede **agregar** reglas locales (ej: "en frontend usar siempre primitives del DS").
- **Nunca** puede contradecir la raíz (ej: no puede decir "aquí sí se permite `throw new Error()`").

**Ejemplo permitido:** `frontend/AGENTS.md` dice "todo componente nuevo usa `<Card>` en vez de `<div>` manual".
**Ejemplo prohibido:** `frontend/AGENTS.md` dice "aquí no hace falta gate para cambiar tokens del DS".

---

## 2. Roles operativos

| Rol | Responsable | Responsabilidad principal |
|---|---|---|
| **Owner/Piloto** | Sebas (humano) | Define prioridades, scope final, aprueba alto impacto |
| **Arquitecto** | ChatGPT | Plan incremental, trade-offs, criterios de aceptación |
| **Ejecutor** | Codex | Implementa dentro del scope, valida build/lint, entrega evidencia |
| **Auditor** | Claude | Coherencia global, edge cases, seguridad, UX/A11y, compliance DS |

### Autoridad de decisión

- **Owner decide:** scope, prioridades, aprobación de gates, go/no-go final.
- **Arquitecto propone:** plan técnico, pero NO ejecuta código en producción.
- **Ejecutor implementa:** pero NO puede cambiar scope ni tomar decisiones de arquitectura.
- **Auditor valida:** pero NO bloquea sin justificación P0/P1.

---

## 3. Gates de riesgo

### Clasificación de impacto

| Nivel | Criterio | Requiere |
|---|---|---|
| **Alto** | Modelo de datos, auth flows, security rules, dependencias nuevas, refactors >3 archivos, navegación global, DS tokens/primitives, contexts globales | mini-RFC + aprobación Owner ANTES de código |
| **Medio** | Nueva pantalla/componente, cambio en prompts de IA, lógica de Cloud Function, nueva colección | Plan documentado + revisión Arquitecto |
| **Bajo** | Bug fix aislado, ajuste de copy, estilo dentro de tokens existentes, refactor <3 archivos sin cambio de API | Ejecutar + auditoría post |

### Qué activa un gate alto (lista explícita)

1. Agregar/eliminar/renombrar campos en `tasks`, `steps`, `sessions`, `users`, `metrics`.
2. Cambiar `firestore.rules` o reglas de Auth.
3. Agregar dependencia nueva a `package.json` (frontend o functions).
4. Refactors que toquen más de 3 archivos.
5. Cambiar el flujo de navegación (orden de screens en App.jsx).
6. Modificar tokens de color, shadows, radius o primitives en el DS.
7. Cambiar shape de AppContext, AuthContext o sus reducers.
8. Cambiar shape de respuesta de Cloud Functions.

---

## 4. Flujo obligatorio

```
Brief → Plan → Approval Gate → Build → Audit → Close
```

| Fase | Responsable | Artefacto | Output esperado |
|---|---|---|---|
| **Brief** | Owner | Descripción del cambio | Objetivo + restricciones + DoD |
| **Plan** | Arquitecto | Plan técnico | Archivos, approach, criterios, riesgos |
| **Approval Gate** | Owner | Aprobación explícita | "GO" o "NO-GO" con feedback |
| **Build** | Ejecutor | Código + Build Report | Archivos tocados + comandos + resultado |
| **Audit** | Auditor | Audit Report | Checklist ✅/⚠️/❌ + P0/P1 + veredicto |
| **Close** | Owner | Cierre | Merge / deploy / siguiente iteración |

### Reglas del flujo

- **No se salta Approval Gate** para cambios de impacto alto.
- Impacto medio: el Arquitecto puede aprobar si el Owner delegó explícitamente.
- Impacto bajo: ejecutar directamente y auditar después.
- Si Audit encuentra P0, el cambio NO se cierra: vuelve a Build.

---

## 5. Estándares técnicos

### 5.1 Scope control

- No refactors "gratis": si no está en el Brief, no se toca.
- No renombres masivos fuera del ticket.
- No cleanup cosmético fuera del scope.
- No agregar features no solicitadas.

### 5.2 Design System v0 (obligatorio)

- Usar primitives: `<Button>`, `<Input>`, `<Card>`, `<Badge>`.
- Usar tokens semánticos: `primary-*`, `gray-*`, `success-*`, `warning-*`, `danger-*`.
- **Prohibido en código nuevo:** `red-*`, `green-*`, `blue-*`, `amber-*`.
- Los `barrier-*` solo en la UI de barreras (BarrierCheckIn).
- Imports siempre terminan en `/ui/Button`, `/ui/Input`, `/ui/Card`, `/ui/Badge`.

### 5.3 Accesibilidad mínima

- Focus visible en todos los controles interactivos.
- Keyboard support: Enter/Space en controles custom clickeables.
- Labels en todos los inputs (usar prop `label` de `<Input>`).
- Errores con texto descriptivo (no solo color).
- Cards interactivas: `role="button"`, `tabIndex={0}`, `onKeyDown`.

### 5.4 Seguridad

- No secretos en código ni commits (`.env` en `.gitignore`).
- No logs de datos sensibles (tokens, passwords, emails).
- Firestore rules: siempre ownership por `request.auth.uid`.
- Cloud Functions: siempre `onCall` + validar `request.auth`.

### 5.5 Imports y naming

- Orden: React → libs externas → components → contexts → services → utils.
- Naming: PascalCase componentes, camelCase funciones/variables, UPPER_SNAKE constantes.
- No crear barrel files (`index.js`) sin aprobación.

### 5.6 Backend

- Callable Functions con `onCall` (no `onRequest` para el frontend).
- Errores: siempre `HttpsError` (nunca `throw new Error()`).
- Validación: Zod `safeParse` para todo `request.data`.
- Output de IA: validar con schema antes de persistir.
- En `catch`: si el error ya es `HttpsError`, re-lanzarlo.
- ESM: imports relativos con extensión `.js`.

---

## 6. Validación y evidencia

### Mínimo antes de cerrar tarea

- **Si existen scripts:** ejecutar `npm run lint` + `npm run build` (+ `npm test` si hay tests).
- **Si no existen:** ejecutar `npm run build` + smoke manual, y reportar qué se ejecutó.
- **Siempre:** verificar que no hay errores en consola de build.

### Ejecutor (Codex) siempre incluye

- Comandos ejecutados + resultado (pass/fail).
- Lista de archivos creados/modificados/eliminados.
- Notas: limitaciones conocidas, decisiones tomadas, deuda técnica.

### Auditor (Claude) siempre incluye

- Checklist con ✅ (ok), ⚠️ (observación menor), ❌ (bloqueante).
- Clasificación P0 (bloqueante) / P1 (debe corregirse) / P2 (nice to have).
- Veredicto: GO / GO con observaciones / NO-GO (requiere fix).

---

## 7. Definition of Done (DoD) global

Un cambio se considera "Done" cuando:

1. ✅ Cumple el Brief (objetivo + restricciones).
2. ✅ Build pasa sin errores.
3. ✅ Usa DS primitives y tokens (sin colores prohibidos).
4. ✅ Cumple a11y mínima (focus, keyboard, labels, errores con texto).
5. ✅ No introduce secretos ni logs sensibles.
6. ✅ Auditoría sin P0 pendientes.
7. ✅ Owner dio GO (explícito o implícito para bajo impacto).

---

## 8. Templates

### 8.1 mini-RFC (gates de alto impacto)

```
## mini-RFC: [Título]
**Fecha:** YYYY-MM-DD  |  **Autor:** [Rol]  |  **Impacto:** Alto

### Contexto
[Por qué se necesita este cambio]

### Propuesta
[Qué se va a cambiar, approach técnico]

### Archivos afectados
- [ ] archivo1
- [ ] archivo2

### Riesgos
- [Riesgo 1]: [Mitigación]

### Alternativas consideradas
1. [Opción A]: [Pros/Contras]
2. [Opción B]: [Pros/Contras]

### Decisión
[Aprobado/Rechazado por Owner — fecha]
```

### 8.2 Brief (Owner → equipo)

```
## Brief: [Título]
**Prioridad:** P0/P1/P2
**Objetivo:** [Qué se quiere lograr]
**Restricciones:** [Qué NO hacer]
**Definition of Done:** [Cuándo está listo]
**Impacto estimado:** Alto/Medio/Bajo
```

### 8.3 Plan (Arquitecto → Ejecutor)

```
## Plan: [Título]
**Brief ref:** [Referencia al brief]

### Approach
[Cómo se va a implementar]

### Archivos a tocar
- [ ] archivo1 — [qué cambio]
- [ ] archivo2 — [qué cambio]

### No tocar
- archivo3 (razón)

### Criterios de aceptación
1. [Criterio 1]
2. [Criterio 2]

### Riesgos
- [Riesgo]: [Mitigación]

### Validación
- [ ] `npm run build` pasa
- [ ] Smoke test manual: [pasos]
```

### 8.4 Build Report (Ejecutor → Auditor)

```
## Build Report: [Título]
**Plan ref:** [Referencia al plan]

### Archivos tocados
| Archivo | Acción | Detalle |
|---|---|---|
| path/file.js | Creado/Modificado/Eliminado | [Qué se hizo] |

### Comandos ejecutados
npm run build → ✅ OK

### Notas
- [Decisiones tomadas]
- [Limitaciones conocidas]
- [Deuda técnica descubierta]
```

### 8.5 Audit Report (Auditor)

```
## Audit Report: [Título]
**Build Report ref:** [Referencia]

### Checklist
| # | Criterio | Estado | Nota |
|---|---|---|---|
| 1 | Cumple Brief | ✅/⚠️/❌ | |
| 2 | Build sin errores | ✅/⚠️/❌ | |
| 3 | DS compliance | ✅/⚠️/❌ | |
| 4 | A11y mínima | ✅/⚠️/❌ | |
| 5 | Seguridad | ✅/⚠️/❌ | |
| 6 | Scope controlado | ✅/⚠️/❌ | |

### Issues encontrados
| # | Severidad | Descripción | Sugerencia |
|---|---|---|---|
| 1 | P0/P1/P2 | [Qué pasa] | [Cómo arreglar] |

### Veredicto
**GO** / **GO con observaciones** / **NO-GO**
[Justificación]
```
