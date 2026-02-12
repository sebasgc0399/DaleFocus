# Frontend — Reglas Locales (AGENTS.md)

> **Hereda de `AGENTS.md` raíz.** Este archivo agrega reglas específicas para `frontend/`. No contradice ninguna regla del documento raíz.

---

## Design System v0 (obligatorio)

### Primitives

Todo componente nuevo DEBE usar los primitives de `src/components/ui/`:

| Primitive | Import | Cuándo usarlo |
|---|---|---|
| `<Button>` | `./ui/Button` | Toda acción clickeable que no sea navegación |
| `<Input>` | `./ui/Input` | Todo campo de entrada (incluye label y error) |
| `<Card>` | `./ui/Card` | Todo contenedor con borde/sombra |
| `<Badge>` | `./ui/Badge` | Etiquetas de estado, indicadores |

**No crear** `<button>`, `<input>`, `<div className="card">` manuales en código nuevo.

### Colores

- **Usar:** `primary-*`, `gray-*`, `success-*`, `warning-*`, `danger-*`.
- **Prohibido en código nuevo:** `red-*`, `green-*`, `blue-*`, `amber-*`.
- **Excepción:** `barrier-*` solo dentro de `BarrierCheckIn.jsx`.

### Imports de primitives

La ruta siempre termina en `/ui/{Componente}`:

```jsx
// Desde src/components/ (pantallas)
import { Button } from './ui/Button';
import { Input }  from './ui/Input';
import { Card }   from './ui/Card';
import { Badge }  from './ui/Badge';

// Desde src/ (App.jsx)
import { Button } from './components/ui/Button';
```

No crear barrel files (`index.js`) ni alias sin aprobación.

---

## Accesibilidad (reglas frontend)

- `<Card interactive>` debe tener: `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space).
- `<Input>` siempre con prop `label` (nunca input sin label visible).
- Errores con prop `error` de `<Input>` (texto descriptivo, no solo borde rojo).
- `<Button loading>` deshabilita el botón y muestra feedback visual.
- Focus ring visible en todos los controles (no remover `outline` sin reemplazo).

---

## React / Tailwind

- Estado global via `useApp()` (AppContext) y `useAuth()` (AuthContext).
- No crear nuevos contexts sin gate de alto impacto (ver AGENTS.md §3).
- Navegación por `currentScreen` en AppContext. No usar react-router sin aprobación.
- Llamadas a Cloud Functions via `src/services/api.js`. No llamar `httpsCallable` directamente.
- Manejo de errores por `error.code` (invalid-argument, unauthenticated, etc.).

---

## Orden de imports

```jsx
// 1. React
import { useState, useEffect } from 'react';

// 2. Libs externas
import { collection, query } from 'firebase/firestore';

// 3. Components
import { Button } from './ui/Button';
import { Card } from './ui/Card';

// 4. Contexts
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

// 5. Services / Utils
import { atomizeTask } from '../services/api';
import { BARRIERS } from '../utils/constants';
```
