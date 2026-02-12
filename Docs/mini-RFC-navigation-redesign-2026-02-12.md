## mini-RFC: Bottom Nav Movil + Transiciones + Limpieza de Header
**Fecha:** 2026-02-12  |  **Autor:** Codex (Ejecutor)  |  **Impacto:** Alto

### Contexto
La navegacion actual de frontend usa header con acceso directo a Dashboard y no tiene una navegacion movil persistente. Se requiere un rediseño para mejorar escalabilidad en mobile y consistencia de interacciones.

### Propuesta
Implementar una bottom nav movil con tabs Focus y Dashboard, agregar transiciones suaves entre pantallas, limpiar el header (Dashboard dentro del dropdown) y eliminar el boton de regreso redundante en Settings.

### Archivos afectados
- [x] `frontend/src/index.css`
- [x] `frontend/src/components/ui/BottomNav.jsx`
- [x] `frontend/src/components/ui/ScreenTransition.jsx`
- [x] `frontend/src/App.jsx`
- [x] `frontend/src/components/Settings.jsx`
- [x] `frontend/src/components/Login.test.jsx`

### Riesgos
- Riesgo de conflicto de navegacion entre header y bottom nav: mitigado con reglas claras de visibilidad por breakpoint.
- Riesgo de accesibilidad en tabs moviles: mitigado con `role="tablist"`, `role="tab"` y keyboard nav.
- Riesgo de ocultar contenido bajo barra inferior: mitigado con utilidad `pb-bottom-nav`.

### Alternativas consideradas
1. Mantener Dashboard en header y no usar bottom nav: menor cambio, peor UX movil.
2. Migrar a router completo: mayor alcance y riesgo fuera de este ticket.

### Decisión
Aprobado por Owner (Sebas) en brief operativo del cambio - 2026-02-12.
