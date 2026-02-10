# DaleFocus

DaleFocus reduce la procrastinacion: toma una tarea difusa, detecta tu barrera emocional y la convierte en un plan accionable con IA + Pomodoro + metricas.

- ✅ Demo: https://dalefocus-3f26d.web.app/
- ✅ Repo: https://github.com/sebasgc0399/DaleFocus

## Elevator Pitch (15s)
DaleFocus combina un atomizador IA que devuelve JSON estructurado, un loop de dopamina (accion -> sesion -> recompensa) y un dashboard con metricas de enfoque (Focus Index, Time-to-Action y Momentum) para pasar de "no se por donde empezar" a "ya avance" en minutos.

## Como Funciona (Demo Path 60s)
1. Login: el usuario entra con Firebase Auth (email/password).
2. Check-in emocional: selecciona su barrera (`overwhelmed`, `uncertain`, `bored`, `perfectionism`).
3. Escribe tarea -> Atomizar: `atomizeTask` llama OpenAI y devuelve JSON con pasos.
4. Ejecuta pasos + Pomodoro: el usuario inicia foco con temporizador y registra sesion.
5. Completa sesion -> recompensa: `completeSession` guarda la sesion y `generateReward` puede generar refuerzo motivacional.
6. Dashboard -> metricas: `getUserMetrics` entrega Focus Index, TTA, Momentum y barreras.

Nota de estado actual: el flujo visual existe; la UI de login y el calculo real de metricas siguen en progreso (ver `Docs/03_Metrics.md`).

## Diferenciadores Para El Reto
- Atomizador Core: salida JSON accionable, no texto largo.
- Flujo circular: accion pequena -> progreso visible -> motivacion -> siguiente accion.
- Analitica orientada a habitos: Focus Index, Time-to-Action, Momentum.
- Barreras emocionales como input estructural del plan, no solo como etiqueta.

## Arquitectura (Alto Nivel)
```
[React + Vite + Tailwind]
         |
         | HTTPS (Firebase ID token)
         v
[Cloud Functions Gen2 - onRequest]
   | atomizeTask / completeSession / generateReward / getUserMetrics
   |
   +--> [Cloud Firestore]
   |
   +--> [OpenAI Chat Completions]
```

## Modelo De Datos (Alto Nivel)
- `users/{uid}`: perfil del usuario, personalidad y config Pomodoro.
- `tasks/{taskId}`: tarea atomizada, barrera, estrategia y estado.
- `steps/{stepId}`: pasos atomizados por tarea.
- `sessions/{sessionId}`: sesiones Pomodoro completadas/interrumpidas.
- `metrics/{userId}/daily/{date}`: reservado por reglas; aun no persistido por funciones.

Detalle completo en `Docs/02_DataModel.md`.

## Seguridad
- Firestore Rules: ownership por usuario (`request.auth.uid`) para `users`, `tasks`, `steps`, `sessions` y `metrics`.
- Functions HTTP: validan `Authorization: Bearer <Firebase ID token>` y exigen match entre `uid` del token y `userId` recibido.
- Pendiente en backend: rate limiting y endurecer validaciones de negocio adicionales.

## Setup Local
### Requisitos
- Node.js 20+
- npm
- Firebase CLI (`npm i -g firebase-tools`)

### 1) Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Completar VITE_FIREBASE_* y, recomendado, VITE_FUNCTIONS_URL
npm run dev
```

### 2) Functions (nuevo terminal)
```bash
cd functions
npm install
cp .env.example .env
# OPENAI_API_KEY=...
npm run serve
```

### Variables de entorno
| Archivo | Variable | Requerida | Uso |
|---|---|---|---|
| `frontend/.env` | `VITE_FIREBASE_API_KEY` | Si | Firebase Web SDK |
| `frontend/.env` | `VITE_FIREBASE_AUTH_DOMAIN` | Si | Firebase Auth |
| `frontend/.env` | `VITE_FIREBASE_PROJECT_ID` | Si | Firebase project |
| `frontend/.env` | `VITE_FIREBASE_STORAGE_BUCKET` | Si | Firebase Storage config |
| `frontend/.env` | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Si | Firebase config |
| `frontend/.env` | `VITE_FIREBASE_APP_ID` | Si | Firebase config |
| `frontend/.env` | `VITE_FUNCTIONS_URL` | Recomendado | Base URL de Functions (si no, usa default local en `api.js`) |
| `functions/.env` | `OPENAI_API_KEY` | Si | Llamadas OpenAI en `atomizeTask` y `generateReward` |

## Deploy
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Deploy (hosting + functions + firestore)
firebase deploy --only hosting,functions,firestore:rules,firestore:indexes
```

## Roadmap Corto (Post-Reto)
- Cerrar login/register UI en frontend (AuthContext ya implementado).
- Implementar calculo real de metricas en `getUserMetrics`.
- Conectar `generateReward` en el timer para mostrar recompensa en tiempo real.
- Agregar rate limiting por usuario para `atomizeTask`.

## Documentacion
- [Overview](Docs/00_Overview.md)
- [Architecture](Docs/01_Architecture.md)
- [DataModel](Docs/02_DataModel.md)
- [Metrics](Docs/03_Metrics.md)
- [DemoScript](Docs/04_DemoScript.md)
- [PlatziPost](Docs/05_PlatziPost.md)
- [Docs Index](Docs/README.md)
- [Plan de Desarrollo](Docs/Plan%20de%20Desarrollo%20de%20DaleFocus.md)
