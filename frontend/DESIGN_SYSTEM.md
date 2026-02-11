# DaleFocus — Design System v0

## Proposito

Sistema de tokens, clases CSS y componentes React que unifica la identidad visual de DaleFocus.
Todo componente nuevo o pantalla debe usar exclusivamente lo definido aqui.
Archivo de referencia CSS: `src/index.css` (`@layer components`).

---

## Tokens permitidos

### Colores

| Grupo | Clases Tailwind | Uso |
|---|---|---|
| `primary-*` (50–900) | Acciones principales, enlaces, logo, focus rings | Marca |
| `gray-*` (50–900) | Texto, fondos, bordes, estados neutros | Neutros |
| `success-*` (50–700) | Progreso completado, badges de descanso | Semantico |
| `warning-*` (50–700) | Alertas no criticas, estados pendientes | Semantico |
| `danger-*` (50–700) | Errores, badges de enfoque, acciones destructivas | Semantico |
| `barrier-*` | `overwhelmed` / `uncertain` / `bored` / `perfectionism` | Dominio |

> **Prohibido en codigo nuevo:** `red-*`, `green-*`, `blue-*`, `amber-*`.
> Usar siempre los tokens semanticos (`danger`, `success`, `warning`, `primary`).
> Los `barrier-*` son colores de dominio y estan permitidos solo para la UI de barreras.

### Shadows

| Token | Uso |
|---|---|
| `shadow-sm` | Cards en reposo, header |
| `shadow-lg` | Dropdowns, elementos flotantes |
| `shadow-xl` | Modales |
| `shadow-soft` | Cards que necesiten sombra mas sutil |

### Border Radius

| Token | Uso |
|---|---|
| `rounded-lg` | Botones, inputs, badges, alertas, dropdowns |
| `rounded-xl` | Cards (default via `.card`) |
| `rounded-2xl` | Modales |
| `rounded-full` | Checkboxes, progress bars, badges pill |

### Tipografia

| Clase | Tamano | Uso |
|---|---|---|
| `text-xs` | 12px | Hints, labels de metricas, meta |
| `text-sm` | 14px | Labels, botones nav, badges, texto secundario |
| `text-base` | 16px | Body text, contenido de steps |
| `text-lg` | 18px | Subtitulos de seccion |
| `text-xl` | 20px | Logo, titulos de card |
| `text-2xl` | 24px | Titulos de pantalla |
| `text-7xl` | 72px | Display del timer Pomodoro (solo) |

Pesos: `font-normal` (body), `font-medium` (labels/nav), `font-semibold` (botones), `font-bold` (titulos).

---

## UI Primitives — `src/components/ui/`

### Button

```jsx
import { Button } from './ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>Guardar</Button>
<Button variant="secondary" size="sm">Cancelar</Button>
<Button variant="ghost" size="sm">Dashboard</Button>
<Button variant="danger">Eliminar</Button>
<Button fullWidth loading={isLoading} type="submit">Enviar</Button>
```

| Prop | Tipo | Default | Descripcion |
|---|---|---|---|
| `variant` | `'primary'` \| `'secondary'` \| `'ghost'` \| `'danger'` | `'primary'` | Estilo visual |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Tamano |
| `fullWidth` | `boolean` | `false` | Ocupa 100% del ancho |
| `loading` | `boolean` | `false` | Muestra "Cargando..." y deshabilita |
| `disabled` | `boolean` | `false` | Deshabilitado |
| `type` | `'button'` \| `'submit'` | `'button'` | Tipo HTML |
| `className` | `string` | — | Clases extra (ej: `mt-4`) |

### Input

```jsx
import { Input } from './ui/Input';

<Input id="email" type="email" label="Email" placeholder="tu@email.com" className="mb-4" />
<Input id="task" label="Tarea" error="Campo requerido" />
<Input id="notes" label="Notas" helperText="Opcional" />
```

| Prop | Tipo | Descripcion |
|---|---|---|
| `label` | `string` | Texto del label (renderiza `<label>`) |
| `error` | `string` | Mensaje de error (activa borde danger + texto) |
| `helperText` | `string` | Texto de ayuda (se oculta si hay error) |
| `id` | `string` | Vincula label con input via `htmlFor` |
| `className` | `string` | Clases en el wrapper `<div>` (ej: `mb-4`) |
| `inputClassName` | `string` | Clases extra en el `<input>` |
| `...inputProps` | — | Cualquier prop nativa de `<input>` |

### Card

```jsx
import { Card } from './ui/Card';

<Card>Contenido default (p-6)</Card>
<Card padding="sm">Item de lista (p-4)</Card>
<Card padding="lg">Modal (p-8)</Card>
<Card selected>Card activa con ring</Card>
<Card muted>Card completada (opacity-60)</Card>
<Card interactive onClick={handleClick}>Card clickeable</Card>
```

| Prop | Tipo | Default | Descripcion |
|---|---|---|---|
| `padding` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | p-4 / p-6 / p-8 |
| `selected` | `boolean` | `false` | ring-2 primary |
| `muted` | `boolean` | `false` | opacity-60 |
| `interactive` | `boolean` | `false` | hover:shadow-md + scale + cursor |
| `className` | `string` | — | Clases extra |

### Badge

```jsx
import { Badge } from './ui/Badge';

<Badge variant="focus">Enfoque</Badge>
<Badge variant="break">Descanso</Badge>
<Badge variant="info">Tip</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="neutral">Draft</Badge>
```

| Prop | Tipo | Default | Descripcion |
|---|---|---|---|
| `variant` | `'focus'` \| `'break'` \| `'info'` \| `'warning'` \| `'neutral'` | `'neutral'` | Esquema de color |
| `className` | `string` | — | Clases extra |

---

## Clases CSS disponibles (`@layer components`)

| Categoria | Clases |
|---|---|
| Buttons | `.btn-base`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg` |
| Inputs | `.input-base`, `.input-error`, `.label` |
| Cards | `.card`, `.card-sm`, `.card-lg`, `.card-selected`, `.card-muted`, `.card-interactive` |
| Badges | `.badge`, `.badge-focus`, `.badge-break`, `.badge-info`, `.badge-warning`, `.badge-neutral` |
| Alerts | `.alert-error` |

---

## Patrones

- **Alertas de error:** usar clase `.alert-error` (fondo danger-50, borde danger-200, texto danger-700).
- **Botones:** usar `<Button>` siempre. Solo usar clases `.btn-*` si no puedes usar el componente React.
- **Inputs con label:** usar `<Input>` siempre. No crear `<label>` + `<input>` a mano.
- **Cards contenedoras:** usar `<Card>` siempre. No crear `<div className="card">` a mano en codigo nuevo.

---

## Do / Don't

**DO** — Usar primitives y tokens semanticos:
```jsx
// Boton con variante
<Button variant="danger" onClick={handleDelete}>Eliminar</Button>

// Error con token semantico
<div className="alert-error mb-4 text-sm">{error}</div>
```

**DON'T** — Clases sueltas o colores hardcodeados:
```jsx
// MAL: clases sueltas replicando un boton
<button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
  Eliminar
</button>

// MAL: error con color directo
<p className="text-red-500 text-sm">{error}</p>
```

---

## Convencion de imports

Importar siempre desde `src/components/ui/{Componente}`:

```jsx
// Desde src/components/ (pantallas)
import { Button } from './ui/Button';
import { Input }  from './ui/Input';
import { Card }   from './ui/Card';
import { Badge }  from './ui/Badge';

// Desde src/ (App.jsx)
import { Button } from './components/ui/Button';
```

**Regla:** la ruta siempre termina en `/ui/Button`, `/ui/Input`, `/ui/Card`, `/ui/Badge`.
No crear alias ni re-exports (`index.js` barrel) por ahora.

### Verificacion de imports consistentes

Buscar imports rotos o inconsistentes con:

```bash
# Debe devolver SOLO rutas terminadas en /ui/Button (o Input, Card, Badge)
grep -rn "from.*Button" src/components/ src/App.jsx
grep -rn "from.*Input"  src/components/ src/App.jsx
grep -rn "from.*Card"   src/components/ src/App.jsx
grep -rn "from.*Badge"  src/components/ src/App.jsx
```

Patrones validos: `'./ui/Button'`, `'../ui/Button'`, `'./components/ui/Button'`.
Cualquier otra ruta indica un import incorrecto.
