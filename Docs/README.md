# DaleFocus

App web de productividad que usa IA (GPT-5.1) para atomizar tareas segun el estado emocional del usuario.

## Stack Tecnico

- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Firebase Cloud Functions (Node.js 20, Gen2)
- **Base de datos:** Cloud Firestore
- **Autenticacion:** Firebase Auth
- **Hosting:** Firebase Hosting
- **IA Atomizador:** GPT-5.1 (gpt-5-2025-08-07)
- **IA Recompensas:** GPT-5-mini (gpt-5-mini-2025-08-07)

## Estructura del Proyecto

```
DALEFOCUS/
├── frontend/               # React app (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Context API (Auth + App state)
│   │   ├── hooks/          # Custom hooks (useFirestore)
│   │   ├── services/       # Firebase config y API calls
│   │   └── utils/          # Constantes y utilidades
│   └── ...
├── functions/              # Firebase Cloud Functions
│   └── src/
│       ├── atomizeTask.js      # POST - Atomiza tareas con GPT-5.1
│       ├── completeSession.js  # POST - Registra sesiones Pomodoro
│       ├── generateReward.js   # POST - Genera mensajes motivacionales
│       ├── getUserMetrics.js   # GET  - Calcula metricas del dashboard
│       └── index.js            # Entry point
├── Docs/                   # Documentacion
├── firebase.json           # Config de Firebase
├── firestore.rules         # Reglas de seguridad de Firestore
└── .firebaserc             # Proyecto Firebase
```

## Setup Local

### Requisitos
- Node.js 20+
- npm o yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Cuenta de Firebase con proyecto creado
- API Key de OpenAI (para GPT-5.1 y GPT-5-mini)

### Frontend
```bash
cd frontend
cp .env.example .env        # Completar con credenciales Firebase
npm install
npm run dev                  # Inicia en http://localhost:3000
```

### Cloud Functions
```bash
cd functions
cp .env.example .env        # Agregar OPENAI_API_KEY
npm install
firebase emulators:start    # Inicia emuladores locales
```

### Deploy
```bash
# Build del frontend
cd frontend && npm run build

# Deploy completo (hosting + functions + rules)
firebase deploy
```

## Flujo Principal

1. El usuario hace **check-in emocional** seleccionando su barrera
2. Escribe su **tarea** a realizar
3. La IA **atomiza** la tarea en pasos concretos segun la barrera
4. El usuario trabaja con **Pomodoros** integrados
5. Recibe **recompensas motivacionales** al completar sesiones
6. Ve su progreso en el **Dashboard** de metricas

## Barreras Emocionales

| Barrera | Estrategia IA | Descripcion |
|---------|--------------|-------------|
| Abrumado | micro_wins | Pasos ultra cortos (3-10 min) |
| Incierto | structured_exploration | Exploracion antes de decidir |
| Aburrido | quick_momentum | Primer paso trivial para arrancar |
| Perfeccionismo | good_enough_iterations | Borradores, no versiones finales |

## Personalidades IA

- **Coach Pro** - Profesional y motivador
- **Pana Real** - Cercano y coloquial
- **Sargento** - Estilo militar, estricto
- **Meme-Lord** - Humoristico y relajado
