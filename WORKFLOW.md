# DaleFocus — Workflow Operativo

> Playbook paso a paso para el equipo multi-IA. Complementa `AGENTS.md` (fuente de autoridad).

---

## Cómo operar en 10 minutos (resumen ejecutivo)

1. **Owner** escribe Brief (objetivo + restricciones + DoD).
2. **Arquitecto** analiza y entrega Plan con archivos a tocar y criterios.
3. Si impacto alto → Owner aprueba (Approval Gate). Si bajo → directo a Build.
4. **Ejecutor** implementa siguiendo el Plan. Entrega Build Report.
5. **Auditor** revisa con checklist. Entrega Audit Report con veredicto.
6. **Owner** cierra (merge/deploy) o pide correcciones.

> **Regla de oro:** Si dudas sobre el impacto, trátalo como alto. Es más barato un gate que un rollback.

---

## Flujo detallado

### Paso 1: Brief (Owner)

**Qué produce:** Brief con objetivo, restricciones, DoD e impacto estimado.
**Formato:** Template 8.2 en AGENTS.md.
**Entrega:** Chat directo con Arquitecto o issue en el repo.

**Checklist del Owner:**
- [ ] ¿Definí qué quiero lograr (no cómo)?
- [ ] ¿Listé restricciones explícitas (qué NO hacer)?
- [ ] ¿Definí cuándo está "listo"?
- [ ] ¿Estimé el impacto (alto/medio/bajo)?

---

### Paso 2: Plan (Arquitecto)

**Input:** Brief del Owner.
**Qué produce:** Plan técnico con approach, archivos, criterios y riesgos.
**Formato:** Template 8.3 en AGENTS.md.

**Checklist del Arquitecto:**
- [ ] ¿El approach es el más simple que cumple el Brief?
- [ ] ¿Listé todos los archivos que se tocan?
- [ ] ¿Definí "No tocar" explícitamente?
- [ ] ¿Los criterios de aceptación son verificables?
- [ ] ¿Identifiqué riesgos y mitigaciones?
- [ ] Si impacto alto → ¿incluí mini-RFC?

---

### Paso 3: Approval Gate (Owner)

**Se activa si:** impacto alto (ver clasificación en AGENTS.md §3).
**Se salta si:** impacto bajo (se pasa directo a Build).
**Impacto medio:** Arquitecto puede aprobar si Owner delegó.

**Owner evalúa:**
- ¿El Plan cumple mi intención original?
- ¿Los riesgos son aceptables?
- ¿El scope está controlado?

**Output:** "GO" (con o sin ajustes) o "NO-GO" (con feedback para revisar el Plan).

---

### Paso 4: Build (Ejecutor)

**Input:** Plan aprobado (o Brief directo si impacto bajo).
**Qué produce:** Código implementado + Build Report.
**Formato:** Template 8.4 en AGENTS.md.

**Reglas del Ejecutor:**
1. Implementar SOLO lo que está en el Plan/Brief.
2. Si encuentra algo fuera de scope → anotarlo como "descubrimiento", no arreglarlo.
3. Ejecutar validación mínima (build como mínimo).
4. No tomar decisiones de arquitectura → escalar al Arquitecto.
5. No cambiar APIs, schemas o tokens del DS → escalar al Owner.

#### Handoff a Codex (qué debe contener el Plan para ejecutar)

- Objetivo claro en 1-2 frases.
- Lista de archivos con qué cambio hacer en cada uno.
- "No tocar": archivos que NO debe modificar.
- Criterios de aceptación verificables.
- Comando de validación: `npm run build` mínimo.
- Contexto relevante (snippets de código actual si es necesario).

---

### Paso 5: Audit (Auditor)

**Input:** Build Report del Ejecutor.
**Qué produce:** Audit Report con checklist + veredicto.
**Formato:** Template 8.5 en AGENTS.md.

**Qué revisa Claude siempre:**
1. Cumplimiento del Brief (objetivo + restricciones + DoD).
2. Build sin errores (verificar que Ejecutor reportó build OK).
3. DS compliance: primitives usados, tokens correctos, sin colores prohibidos.
4. A11y mínima: focus visible, keyboard support, labels, errores con texto.
5. Seguridad: sin secretos, sin logs sensibles, Firestore rules coherentes.
6. Edge cases: estados vacíos, loading, errores, usuario no autenticado.
7. Scope: no se introdujeron cambios fuera del Plan.

#### Handoff a Claude (qué debe contener el Build Report para auditar)

- Referencia al Plan original.
- Lista completa de archivos tocados con descripción.
- Comandos ejecutados y su resultado.
- Decisiones tomadas durante la implementación.
- Deuda técnica o limitaciones descubiertas.

---

### Paso 6: Close (Owner)

**Input:** Audit Report con veredicto GO.
**Acciones posibles:**
- Merge a branch principal.
- Deploy (si aplica).
- Abrir Brief de siguiente iteración.
- Anotar P1/P2 pendientes en backlog.

---

## Severidad y prioridad

| Severidad | Criterio | Ejemplos en DaleFocus |
|---|---|---|
| **P0** | Rompe funcionalidad core o seguridad | Build falla, datos de otro usuario visibles, auth bypass, atomizeTask retorna error sin manejo |
| **P1** | Degrada experiencia o calidad | Botón sin focus visible, error sin mensaje, componente no usa DS primitive, import inconsistente |
| **P2** | Mejora menor o cosmética | Copy mejorable, spacing inconsistente dentro de tokens válidos, comentario faltante |

### Reglas de severidad

- **P0:** NO-GO. Vuelve a Build. No se cierra hasta que se resuelve.
- **P1:** GO con observaciones. Fix en siguiente iteración. Owner decide prioridad.
- **P2:** GO. Se anota en backlog. No bloquea cierre.

---

## Checklist UX / A11y mínima

Usar en cada Audit Report:

| # | Criterio | Verificación |
|---|---|---|
| 1 | Focus visible | Tab through: ¿se ve outline/ring en cada control? |
| 2 | Keyboard nav | ¿Se puede completar el flujo sin mouse? |
| 3 | Labels | ¿Todo `<input>` tiene label asociado (htmlFor)? |
| 4 | Errores | ¿Los errores tienen texto descriptivo (no solo color)? |
| 5 | Loading | ¿Los botones muestran estado loading y se deshabilitan? |
| 6 | Empty states | ¿Qué se ve si no hay datos? ¿Tiene mensaje? |
| 7 | Responsive | ¿Se ve razonable en mobile (320px+)? |
| 8 | Contraste | ¿El texto cumple ratio mínimo sobre su fondo? |

---

## Protocolo de descubrimiento (durante Build)

Si el Ejecutor encuentra algo inesperado durante la implementación:

1. **No arreglarlo** si está fuera de scope.
2. **Anotarlo** en la sección "Notas" del Build Report.
3. **Clasificarlo:** bug existente / deuda técnica / mejora potencial.
4. **Si bloquea la tarea actual:** escalar inmediatamente al Arquitecto.
5. **Si no bloquea:** continuar con el Plan y documentar.

---

## Reglas de comunicación

- **Handoff siempre escrito:** no se asume contexto verbal.
- **Templates obligatorios** para impacto alto y medio.
- **Impacto bajo:** formato libre pero debe incluir: objetivo + archivos + validación.
- **Cada rol entrega su artefacto antes de pasar al siguiente paso.**
- **Si un paso no se completó, no se avanza al siguiente.**

---

## Referencia rápida de artefactos por fase

| Fase | Template | Quién lo escribe | Quién lo consume |
|---|---|---|---|
| Brief | 8.2 | Owner | Arquitecto |
| mini-RFC | 8.1 | Arquitecto | Owner (aprueba) |
| Plan | 8.3 | Arquitecto | Ejecutor |
| Build Report | 8.4 | Ejecutor | Auditor |
| Audit Report | 8.5 | Auditor | Owner (decide) |
