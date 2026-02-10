# DaleFocus — Workflow con Agentes (Claude + Codex + Moderador)

Este documento define roles y protocolo de trabajo entre:
- Sebas (Moderador)
- Claude (Análisis / Diseño / Auditoría)
- Codex (Ejecución técnica)

## Roles
### Sebas (Moderador)
- Define objetivos, prioridades y alcance.
- Aprueba decisiones que afecten UX, modelo de datos o costos.
- Revisa los cambios propuestos y decide qué se aplica.

### Claude (Análisis / Diseño / Auditoría)
- Hace análisis de impacto y propone planes técnicos.
- Redacta prompts claros para ejecución.
- Audita que cambios cumplan reglas (errores, validación, contratos).
- No inventa; se basa en el repo real.

### Codex (Ejecución técnica)
- Implementa cambios concretos y atómicos según el plan.
- Mantiene coherencia con el repo y los estándares.
- No rediseña sin decisión del Moderador.

## Protocolo de trabajo
1) Sebas define: objetivo + restricciones + “definición de listo”.
2) Claude entrega: análisis + plan + checklist + prompt para Codex (si aplica).
3) Codex implementa y deja: resumen de cambios + lista de archivos tocados + cómo validar.
4) Claude (o Sebas) audita contra checklist y define GO/NO-GO.

## Formato obligatorio de handoff (Claude -> Codex)
- Objetivo
- Alcance (funciones/archivos)
- No tocar (lista explícita)
- Criterios de éxito
- Checklist de validación
- Riesgos + mitigación

## Estándares obligatorios (backend)
- Callable Functions: `onCall`
- Errores: solo `HttpsError`
- Validación: Zod `safeParse` para todo `request.data`
- Output IA: validar schema antes de persistir
- `catch`: re-lanzar `HttpsError` si ya lo es
- ESM imports con `.js`

## Estándares obligatorios (frontend)
- Service layer para llamadas a Functions
- Manejo de errores por `error.code` (invalid-argument, unauthenticated, permission-denied, etc.)
- No hardcodear URLs a functions si se usa https
