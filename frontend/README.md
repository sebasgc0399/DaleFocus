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
- `VITE_FUNCTIONS_URL` (recomendado)

Si `VITE_FUNCTIONS_URL` no existe, `src/services/api.js` usa por defecto:
- `http://localhost:5001/dalefocus/us-central1`

## Scripts
- `npm run dev` - servidor local Vite.
- `npm run build` - build de produccion en `dist/`.
- `npm run preview` - preview local del build.

## Notas
- La app requiere usuario autenticado para operar flujo principal.
- `AuthContext` tiene `login/register/logout`, pero la UI final de login/register sigue pendiente en `src/App.jsx`.
