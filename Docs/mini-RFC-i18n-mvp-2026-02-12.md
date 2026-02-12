## mini-RFC: i18n MVP (es default + en)
**Fecha:** 2026-02-12  |  **Autor:** Codex (Ejecutor)  |  **Impacto:** Alto

### Contexto
DaleFocus requiere soporte bilingue (es/en) con selector visible de idioma, persistencia local, deteccion inicial por navegador y fallback robusto, sin backend adicional.

### Propuesta
Implementar i18n con `i18next` + `react-i18next` usando recursos embebidos en `src/i18n/locales`, idioma default/fallback `es`, `LanguageSwitcher` compacto en UI auth/no-auth, y migracion incremental de strings por pantalla prioritaria.

### Archivos afectados
- [x] `frontend/package.json`
- [x] `frontend/src/main.jsx`
- [x] `frontend/src/i18n/index.js`
- [x] `frontend/src/i18n/language.js`
- [x] `frontend/src/i18n/constants.js`
- [x] `frontend/src/i18n/locales/es/*.json`
- [x] `frontend/src/i18n/locales/en/*.json`
- [x] `frontend/src/components/ui/LanguageSwitcher.jsx`
- [x] `frontend/src/components/ui/Button.jsx`
- [x] `frontend/src/App.jsx`
- [x] `frontend/src/components/Login.jsx`
- [x] `frontend/src/components/Dashboard.jsx`
- [x] `frontend/src/components/PomodoroTimer.jsx`
- [x] `frontend/src/components/BarrierCheckIn.jsx`
- [x] `frontend/src/components/TaskInput.jsx`
- [x] `frontend/src/components/StepList.jsx`
- [x] `frontend/src/components/ui/BottomNav.jsx`
- [x] `frontend/src/components/Settings.jsx`
- [x] `frontend/src/components/RewardPopup.jsx`
- [x] `frontend/src/utils/authErrors.js`
- [x] `frontend/src/test/setup.js`
- [x] `frontend/src/components/Login.test.jsx`
- [x] `frontend/src/utils/authErrors.test.js`
- [x] `frontend/src/i18n/i18n.test.js`

### Riesgos
- Riesgo de regresiones por copy en tests: mitigado con setup i18n fijo en `es` y asserts con `i18n.t(...)`.
- Riesgo de idioma mixto durante migracion: mitigado con prioridad por pantallas core y fallback `es`.
- Riesgo en entornos sin `window`: mitigado con detector/persistencia seguros para tests.

### Alternativas consideradas
1. `src` embebido (elegida): simple, offline, menor riesgo.
2. `/public/locales` + backend HTTP: mas flexible, mayor complejidad para MVP.

### Decision
Aprobado por Owner (Sebas) en este hilo - 2026-02-12.
