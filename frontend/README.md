# Frontend DaleFocus

Frontend React + Vite de DaleFocus.

## Requisitos
- Node.js 20+
- npm

## Ejecutar en local
```bash
npm install
cp .env.example .env
npm run dev
```

App local: `http://localhost:3000`

## Variables de entorno
Archivo: `.env`

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

La comunicacion con Cloud Functions usa `httpsCallable` del Firebase SDK (no requiere URL manual).

## Scripts
- `npm run dev` - servidor local Vite.
- `npm run build` - build de produccion en `dist/`.
- `npm run preview` - preview local del build.

## Notas
- La app requiere usuario autenticado para operar flujo principal.
- `AuthContext` tiene `login/register/logout`, pero la UI final de login/register sigue pendiente en `src/App.jsx`.

## Estilo y contribucion

Este proyecto usa un **Design System v0** documentado en [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).

### Definition of Done (UI)

Antes de considerar completada cualquier pantalla o feature nueva, verificar:

- [ ] **No clases prohibidas:** 0 usos de `red-*`, `green-*`, `blue-*`, `amber-*`. Solo tokens semanticos (`primary`, `success`, `warning`, `danger`, `gray`).
- [ ] **Usa UI primitives:** Botones con `<Button>`, inputs con `<Input>`, contenedores con `<Card>`, indicadores con `<Badge>`. No replicar estilos a mano.
- [ ] **Tokens semanticos para estados:** errores con `danger-*` o `.alert-error`, exito con `success-*`, alertas con `warning-*`.

Verificacion rapida:
```bash
# Debe dar 0 resultados en src/
grep -rn "red-\|green-\|blue-\|amber-" src/
```
