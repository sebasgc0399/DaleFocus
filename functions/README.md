# Functions DaleFocus

Backend serverless con Firebase Cloud Functions Gen2 (`onRequest`).

## Requisitos
- Node.js 20+
- Firebase CLI

## Setup local
```bash
npm install
cp .env.example .env
npm run serve
```

## Variables de entorno
Archivo: `.env`

- `OPENAI_API_KEY` (requerida para `atomizeTask` y `generateReward`)

## Runtime (Gen2)
- Region unica centralizada en `src/runtimeOptions.js` (`us-central1`).
- `atomizeTask` usa `1GiB` para reducir cold starts percibidos (incluyendo LATAM/Colombia); esto incrementa costo por instancia.

## Endpoints HTTP exportados
Desde `src/index.js`:
- `POST /atomizeTask`
- `POST /completeSession`
- `POST /generateReward`
- `GET /getUserMetrics?userId=<uid>&days=<n>`

## Seguridad de endpoints
- Todas las funciones validan `Authorization: Bearer <Firebase ID token>`.
- `userId` del request debe coincidir con el `uid` del token.

## Scripts
- `npm run serve` - emulador de Functions.
- `npm run deploy` - deploy de Functions.

## Prueba rapida con curl
```bash
curl -X POST "$FUNCTIONS_BASE_URL/atomizeTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -d '{"taskTitle":"Preparar pitch","barrier":"overwhelmed","userId":"<UID>"}'
```

Donde `FUNCTIONS_BASE_URL` puede ser:
- Local: `http://localhost:5001/<project-id>/us-central1`
- Produccion: `https://us-central1-<project-id>.cloudfunctions.net`
