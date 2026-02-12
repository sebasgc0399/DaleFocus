# DaleFocus — Design System v1 Calm Premium

## Objetivo y criterios de éxito

El objetivo de este documento es definir un **sistema de diseño v1 (Calm Premium, Apple-like)** que puedas compartir con **entity["company","Anthropic","ai research company"]** para que “Claude” evalúe **impacto, riesgos y plan de implementación** con cambios controlados (sin romper pantallas existentes).

Los criterios de éxito (medibles) de este v1 son:

- **Percepción premium**: la UI se siente “calma”, con **aire**, **capas** (background/surface/elevation), bordes finos y sombras difusas; el color de marca aparece solo donde guía acciones y estados. citeturn1search2turn0search1turn0search2  
- **Consistencia**: todos los componentes reutilizables (Button/Input/Card/SegmentedTabs) comparten la misma lógica de superficies, bordes, elevación y motion. citeturn4search9turn3search3turn3search23  
- **Accesibilidad base**: foco visible y discernible, targets mínimos razonables, motion respetando preferencias del usuario. citeturn2search0turn4search8turn2search2turn1search1  
- **Implementación incremental**: introducir tokens/utilidades nuevas sin eliminar los tokens semánticos existentes (`primary/gray/success/warning/danger/barrier-*`) y sin obligar un refactor masivo de pantallas en el primer PR. citeturn4search9turn3search3  

---

## Fundamentos respaldados por guías y estándares

### Aire y legibilidad como base de UX

El “Calm Premium” no se logra con más color; se logra con **espaciado consistente** y composición limpia. La investigación práctica de usabilidad enfatiza que el whitespace mejora el escaneo/lectura y reduce la sensación de saturación visual. citeturn1search2turn1search5  

Para que el espaciado sea operable por el equipo (y no “al ojo”), conviene usar una escala estable tipo **múltiplos de 8** (o 4/8/12/16/24/32 como ya planteaste, que es compatible con el enfoque de 8pt grid). citeturn0search8turn0search20  

### Superficies y elevación como “materialidad” moderna

La dirección “superficies > colores” está alineada con tendencias de sistemas modernos: **Material Design 3** enfatiza roles de superficie (surface/surface container) que **no dependen necesariamente de la elevación**, ofreciendo flexibilidad para expresar jerarquía con capas en lugar de saturación o sombras “pesadas”. citeturn4search10turn4search3turn4search7  

En el ecosistema de **entity["company","Apple","consumer electronics firm"]**, las guías de “materials” recomiendan usar materiales/efectos para comunicar estructura y separación entre capas (en web lo emulas con surface + border + shadow suave). citeturn3search0  

### Motion lento y respetuoso

El motion “premium” es **sutil, informativo y no intrusivo**. Para web, es clave respetar la preferencia del sistema para reducir movimiento usando `prefers-reduced-motion`. citeturn1search1turn1search20  

Sobre duraciones/easing: una guía práctica es manejar rangos cortos a moderados y usar curvas tipo ease-out para que la UI se sienta responsiva sin verse “juguetona”; además, Nielsen Norman discute cómo la duración afecta la percepción y la claridad del feedback. citeturn1search25  

### Accesibilidad: foco, contraste y targets

- El foco debe ser visible (teclado) para cumplir la expectativa mínima AA. citeturn2search0turn2search6  
- Los componentes visuales no textuales (bordes de inputs, indicadores de estado, foco personalizado) deben lograr contraste suficiente contra colores adyacentes (3:1 en criterios AA para componentes UI). citeturn4search8turn4search0  
- Los targets de interacción deberían ser al menos **24×24 CSS px** (mínimo AA en WCAG 2.2 para target size, con excepciones). citeturn2search2turn2search4  

Esta parte es crucial porque “Calm Premium” tiende a bordes muy sutiles: si el borde/subtle queda demasiado tenue, puedes perder claridad de affordance y caer en problemas de contraste no textual. citeturn4search8  

---

## Tokens y utilidades base del Calm Premium

Esta sección define el **núcleo implementable**: `bg-app`, `surface-0/surface-1`, `border-subtle`, `ring-soft`, y `elevation-1/elevation-2`.

### Decisión clave de arquitectura: variables CSS + Tailwind como API

Recomendación: definir valores como **CSS variables** (para soporte de dark mode futuro, ajustes finos y consistencia global) y exponerlos como tokens en Tailwind. Tailwind describe cómo tratar “theme variables” como tokens de diseño y exponerlos vía clases utilitarias. citeturn4search9turn3search3  

Además, Tailwind soporta el patrón `rgb(var(--token) / <alpha-value>)` para mantener la ergonomía de opacidad (`/10`, `/20`, etc.), que es útil para halos de focus, borders suaves y overlays. citeturn4search23turn3search26  

> Nota de compatibilidad: Tailwind v4 expone tokens como variables por defecto, pero el enfoque de variables manual funciona igual en v3/v4. citeturn4search2  

### Paleta Calm (valores recomendados para iniciar)

Estos valores están pensados para que el contraste sea suficientemente claro en texto y que los bordes no compitan con el contenido. Ajuste fino después con medición (contrast checker) y revisión visual.

**Primitivos (CSS variables):**
- `--df-surface-0`: `255 255 255` (blanco)  
- `--df-surface-1`: `248 250 252` (gris muy leve)  
- `--df-border-subtle`: `226 232 240` (tipo slate-200)  
- `--df-bg-tint-1`: un acento suave (cian/azul de tu marca, con alpha bajo)  
- `--df-bg-tint-2`: un segundo acento leve (índigo muy suave)  

**Semánticos existentes:** se mantienen (`primary/gray/success/warning/danger/barrier-*`), alineado con la guía de usar el color consistentemente para comunicar estados/acciones. citeturn0search1turn4search18  

### Implementación exacta

#### CSS base (variables + `bg-app` + grain)
- `bg-app` se implementa como **multicapa**: 2 radiales muy suaves + 1 linear base.  
- El grain debe ser **opcional** y extremadamente tenue (si no, se percibe “sucio” o baja claridad).  

#### Tailwind tokens (surfaces/border) y shadows (elevation)

Los tokens de elevación deben ser “difusos”: varias capas de sombra con alphas bajos, evitando sombras duras. Material sugiere que para representar elevación el usuario necesita pistas de separación (edges/overlap/contraste) y no solo “una sombra negra fuerte”. citeturn0search14turn4search16  

**Recomendación operativa:**  
- `elevation-1`: card/containers (principal)  
- `elevation-2`: dropdown/modal/floats (solo cuando tiene sentido)  
- `elevation-0`: sin sombra, solo borde (útil para listas densas)

### Reglas de uso para no degradar el “premium”

- **Cards**: `surface-0 + border-subtle + elevation-1` por defecto; si hay muchas cards juntas, bajar a `elevation-0` para evitar “ruido”. (Esto también reduce fatiga visual). citeturn1search2  
- **Inputs**: `surface-1` ayuda a distinguir el campo sin depender del primario; el foco debe cumplir visibilidad y contraste. citeturn2search0turn4search8  
- **Focus ring**: si usas halo transparente, acompáñalo de un **outline/border** suficientemente contrastado para no fallar Non-text Contrast. citeturn4search0turn4search8  

---

## Componentes y patrones Calm Premium

Esta sección traduce tokens a decisiones de UI para Button/Input/Card/SegmentedTabs.

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["iOS segmented control light mode settings","macOS System Settings light mode segmented control","Apple Human Interface Guidelines materials blur translucency example","calm premium SaaS UI light mode dashboard"],"num_per_query":1}

### Button

**Objetivo UX:** el primario “marca” el camino sin saturar la pantalla.

- **Primary**: solid “soft” (evitar azul eléctrico grande).  
- **Secondary**: superficie clara + borde sutil (parece material, no botón plano).  
- **Ghost**: texto con hover en `surface-1` (sin borde).  
- **Estados**: hover y active con transiciones 150–200ms (rápido), panel transitions 250–320ms (calmo). citeturn1search25  

**A11y**: focus visible y no dependiente del color únicamente (usar outline/halo). citeturn2search0turn4search8  

### Input

**Objetivo UX:** se siente “premium” por materialidad (surface/border), no por color.

- Base: fondo `surface-1`, borde `border-subtle`.  
- Hover: borde ligeramente más marcado (sin volverse oscuro).  
- Focus: outline/border + halo suave; respetar `prefers-reduced-motion` para transiciones si el usuario lo pide. citeturn1search1turn1search4turn4search8  
- HelperText/Errors: siempre visibles y consistentes (no esconder información importante en placeholder). Forms bien agrupados con whitespace mejoran comprensión. citeturn1search5  

### Card

**Objetivo UX:** jerarquía por capas.

- Default: `surface-0 + border-subtle + elevation-1`.  
- Interactive: hover lift de **1px** + sombra apenas más fuerte (sin bounce).  
- Selected: ring/outline sutil (no saturado), manteniendo contraste.

Esto refleja el principio de comunicar estructura y separación con “materialidad” (capas / superficies). citeturn3search0turn0search14  

### Segmented Tabs

Este componente es el “sello” Calm Premium en auth/onboarding:

- Track: `surface-1` (contenedor suave)  
- Thumb activo: `surface-0 + border + elevation-1` (parece pieza física)  
- Motion: 200–250ms ease-out (no rebotar).  
- Focus: cada tab con focus visible; targets táctiles mínimos adecuados. citeturn2search0turn2search2turn1search25  

---

## Implementación en tu proyecto y evaluación de impacto

Esta sección está pensada para minimizar riesgo técnico y facilitar que Claude evalúe el impacto.

### Estrategia de migración por fases

**Fase de fundación (bajo riesgo)**
- Añadir CSS variables globales + clases utilitarias (`bg-app`, `surface-*`, `elevation-*`).  
- Añadir tokens en Tailwind (colors + shadows) sin tocar pantallas aún.  
- Mantener compatibilidad: no eliminar tokens semánticos existentes.

**Fase de primitives (riesgo controlado)**
- Actualizar `Card`, `Input`, `Button` para consumir `surface/elevation` por defecto.  
- Mantener props/variants actuales para no romper imports; cambiar solo estilos internos.

**Fase de pantallas (riesgo visual, bajo riesgo funcional)**
- Reemplazar tabs actuales por `SegmentedTabs` en Login/Register.  
- Aplicar `bg-app` al wrapper raíz (ej. `AppLayout` o main container).  
- Ajustar spacing a escala 4/8/12/16/24/32.

Este enfoque está alineado con usar Tailwind como “API de tokens” y con añadir estilos personalizados dentro de las capas recomendadas (`@layer components`) para mantener mantenibilidad. citeturn4search9turn3search3turn3search23  

### Impacto típico y riesgos

**Riesgos visuales esperables**
- Bordes demasiado sutiles pueden perder affordance (inputs) y chocar con Non-text Contrast. Mitigación: diferenciar `border-subtle` (decorativo) vs `border-control` (inputs) o reforzar focus con outline sólido. citeturn4search8turn4search0  
- Exceso de sombras (muchas cards) puede verse “grisáceo”. Mitigación: usar `elevation-0` en listados densos + `elevation-1` solo en contenedores clave. citeturn1search2  

**Riesgos de accesibilidad**
- Focus ring con alpha muy bajo puede no ser discernible: debe existir un foco visible (AA) y el indicador debe contrastar respecto al fondo/elemento (non-text contrast para estados/bordes). citeturn2search0turn4search8  
- Targets pequeños en tabs/icon buttons: WCAG 2.2 introduce mínimo 24×24 CSS px (con excepciones). citeturn2search2turn2search4  

**Riesgos de motion**
- Animaciones que no respeten reduce motion: deben poder apagarse o reducirse cuando el usuario lo pide (media query). citeturn1search1turn1search20  

### Pruebas mínimas recomendadas para aceptar el v1

- Navegación 100% con teclado: tab order, focus visible, focus no oculto por headers/sticky. citeturn2search0turn0search3  
- Contraste: texto (idealmente ≥ 4.5:1) y componentes/estados (≥ 3:1 para no-text). citeturn4search1turn4search8turn4search5  
- `prefers-reduced-motion`: verificar que transiciones/transform se reduzcan o apaguen. citeturn1search1turn1search4  

---

## Paquete para compartir con Claude

### Contexto operable

- Proyecto web con Tailwind + `@layer components` para clases semánticas; primitives React (`Button`, `Input`, `Card`, `Badge`) ya centralizan estilos (según tu DS v0).  
- Objetivo: elevar percepción a **Calm Premium** sin romper tokens semánticos existentes (`primary/gray/success/warning/danger/barrier-*`).  
- Introducir 3 utilidades base + tokens: `bg-app`, `surface-0/surface-1`, `elevation-1/elevation-2` (+ `border-subtle` y `ring-soft` como soporte).

### Qué debe evaluar Claude (impacto y plan)

1) **Impacto por archivos**:  
   - `tailwind.config.js`: agregar `colors.surface`, `colors.border.subtle`, `boxShadow.elevation-*`, y duraciones/curvas calm. citeturn4search9turn4search23  
   - `src/index.css`: definir variables (`:root`) + clases `bg-app`, `surface-*`, `elevation-*`, `grain` opcional dentro de `@layer components`. citeturn3search3turn3search23  
   - `src/components/ui/*`: actualizar estilos internos para consumir surfaces/elevations.

2) **Compatibilidad/migración**  
   - Mantener API/props existentes en primitives.  
   - Evitar cambios masivos en pantallas en el primer PR: solo reemplazar tabs por `SegmentedTabs` donde aplica y setear wrapper `bg-app`.

3) **Accesibilidad y UX**  
   - Asegurar `focus-visible` consistente (AA) y contrastes de estados/bordes (non-text). citeturn2search0turn4search8  
   - Asegurar targets ≥ 24×24 CSS px en controles y tabs. citeturn2search2  
   - Respetar `prefers-reduced-motion` para transiciones y transforms. citeturn1search1  

4) **Definición final de tokens**  
   - Confirmar valores iniciales de `surface-0`, `surface-1`, `border-subtle` y gradiente `bg-app`.  
   - Recomendar si conviene separar `border-subtle` (decorativo) de `border-control` (inputs) para cumplir non-text contrast sin perder estética. citeturn4search8  

### Restricciones

- No eliminar ni renombrar tokens semánticos existentes.  
- No introducir colores “prohibidos” directos (`red-*`, `green-*`, `blue-*`, etc.) en código nuevo; siempre semantic tokens.  
- Motion suave: sin rebotes, sin animaciones largas; y con soporte a reduce motion. citeturn1search1turn1search25