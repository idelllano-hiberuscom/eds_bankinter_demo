# Instrucciones de Bloque: feature-columns
> Generado por: Figma Analyst (Fase 1) · Creado tras confirmación humana (Decisión 2)
> Archivo Figma: Bankinter Luxembourg — fileKey `Wa7TozkduEgnYQDF4ClQo4`
> Nodo(s) de referencia: desktop `1:306` (features) · `1:352` (¿Por qué Luxemburgo?) · `1:370` (¿Por qué Bankinter?) · `1:407` (Somos una referencia) — mobile `1:82` / `1:128` / `1:152` / `1:190`
> Nombre EDS: `feature-columns`
> Tipo: **NUEVO** bloque (sustituye el uso del core `columns` en estas 4 secciones)
> Complejidad: **Media**
> Requiere JS: **no** (solo CSS; layout y orden controlados por config/clases)
> Modelo UE: xwalk (patrón `container` + `items`)

---

## 1. Descripción y propósito

Bloque de **dos paneles** (texto ↔ media) reutilizado en **cuatro secciones** de la landing.
Sustituye al core `columns` para dar a los autores un modelo semántico propio (icono, eyebrow,
título, body con listas, CTA, imagen) y control de orientación sin tocar código.

| Sección | Nodo desktop | Panel A | Panel B | Orientación |
|---|---|---|---|---|
| Seguridad / Con el servicio | `1:306` | icono + título "Seguridad" + body | icono + título "Con el servicio Bankinter" + **lista** (5 checks) | `equal` (dos paneles texto) |
| ¿Por qué Luxemburgo? | `1:352` | **imagen** mapa-luxemburgo.png | título + body (con énfasis) | `media-content` (media izq.) |
| ¿Por qué Bankinter Luxemburgo? | `1:370` | título + intro + **lista** (4 items) + CTA | **imagen** Pq-BK-Lux555.jpg | `content-media` (media der.) |
| Somos una referencia | `1:407` | **imagen** "Reconocidos como" | eyebrow + título + body + CTA | `media-content` (media izq.) |

### Modelo elegido (resumen de la decisión)

Patrón `container` + `items` donde **cada item = UN panel** (un lado). La **orientación** se controla
con un campo `select` a nivel de bloque (`layout`). Cada panel admite icono, imagen, eyebrow, título,
body (richtext con listas) y CTA — los campos no usados quedan vacíos.

**Justificación:**
- Un **único modelo de panel reutilizable** cubre los 4 casos (texto-only, imagen-only, texto+lista+CTA)
  sin duplicar campos por sección → evita over-engineering.
- El `select` de orientación a nivel de bloque resuelve el alternado imagen↔texto **sin** clonar el
  modelo ni crear variantes redundantes.
- `container`+`items` deja preparada la posibilidad de >2 paneles en el futuro sin rehacer el modelo,
  pero el uso actual se documenta con **exactamente 2 items por bloque**.

## 2. Variantes detectadas

Controladas por el campo de bloque `layout` (no por clases manuales del autor):

- **`media-content`** (default): media a la izquierda, contenido a la derecha — clase `.feature-columns--media-content`.
- **`content-media`**: contenido a la izquierda, media a la derecha — clase `.feature-columns--content-media`.
- **`equal`**: dos paneles de texto equivalentes lado a lado — clase `.feature-columns--equal`.

## 3. Estructura DOM

### ENTRADA — Matriz EDS (lo que `decorate(block)` recibe)

Patrón `container` + `items`: una fila de config de bloque (opcional) + una fila por panel.

> ⚠️ No asumir que todo hijo directo de `block` es un panel: la primera fila puede ser config.

```
block.feature-columns
  └── div (FILA DE CONFIG DE BLOQUE — opcional)
        └── div ← layout → <p> "media-content" | "content-media" | "equal" (texto plano)

  └── div (FILA PANEL A)
        ├── div (col A) → <picture> ← icon (campo reference; vacío si no aplica)
        ├── div (col B) → <p> ← iconAlt (texto plano)
        ├── div (col C) → <picture> ← image (campo reference; vacío si no aplica)
        ├── div (col D) → <p> ← imageAlt (texto plano)
        ├── div (col E) → <p> ← eyebrow (texto plano; vacío si no aplica)
        ├── div (col F) → <h2> ← título
        ├── div (col G) → richtext body → <p> y/o <ul><li>…</li></ul> (listas con check)
        ├── div (col H) → <p> ← ctaText (texto plano; vacío si no aplica)
        └── div (col I) → <p><a href="..."> ← ctaLink (enlace envuelto en <p>)

  └── div (FILA PANEL B)
        └── … misma estructura de 9 celdas que el panel A
```

> Tipo de nodo por celda: imágenes (`icon`, `image`) → `<picture>`; textos cortos → `<p>`; título →
> `<h2>` (las 4 secciones son subsecciones, no el H1 de la página); body → richtext (`<p>` y/o `<ul>`);
> CTA → `<p><a href>`. Las celdas de campos no usados llegan **vacías** (div sin contenido); el
> Developer debe tratarlas como ausentes.

### SALIDA — DOM decorado (lo que `decorate()` produce)

Ejemplo con `layout = media-content` (media izquierda) y dos paneles:

```html
<div class="feature-columns block feature-columns--media-content">

  <!-- PANEL con media -->
  <div class="feature-columns-panel feature-columns-panel--media">
    <div class="feature-columns-media">
      <picture><!-- image (EDS) --></picture>
    </div>
  </div>

  <!-- PANEL con contenido -->
  <div class="feature-columns-panel feature-columns-panel--content">
    <div class="feature-columns-icon"><!-- icon opcional (caja coloreada) --></div>
    <p class="feature-columns-eyebrow">Reconocidos como</p>
    <h2 class="feature-columns-title">Somos una referencia</h2>
    <div class="feature-columns-body">
      <p><!-- body --></p>
      <ul class="feature-columns-list"><li><!-- check + texto --></li></ul>
    </div>
    <a class="feature-columns-cta button" href="…">Saber más</a>
  </div>

</div>
```

- El JS **reusa y mueve** los nodos autorados (`<picture>`, `<h2>`, `<p>`, `<ul>`) a sus wrappers
  `.feature-columns-panel` + `.feature-columns-media`/`-content`; solo añade clases y wrappers vacíos.
  No reconstruye el DOM.
- El orden visual imagen↔texto se resuelve **por CSS** según la clase de `layout` (p. ej. `order` o
  `grid-template-areas`), **no** reordenando nodos en el DOM.
- Las clases siguen scoping `.feature-columns *`. Se **evitan** `feature-columns-container` y
  `feature-columns-wrapper` (reservadas para sección/bloque por EDS).

## 4. Campos editables para Universal Editor (xwalk)

Dos modelos: contenedor/bloque (config) e item (panel). En Fase 3 el contenedor necesita
`data-aue-filter` para el botón "+" de añadir panel.

### 4a. Campos del CONTENEDOR / bloque (`id: feature-columns`)

| Campo | `name` | `component` | `valueType` | ¿Requerido? |
|---|---|---|---|---|
| Orientación | `layout` | `select` (media-content / content-media / equal) | `string` | no (default `media-content`) |

> El contenedor declara un **filtro** (`id: feature-columns`) que permite el componente
> `feature-columns-panel`. Definición del bloque: `template.model: "feature-columns"` +
> `template.filter: "feature-columns"`.

### 4b. Campos de cada ITEM / panel (`id: feature-columns-panel`)

| Campo | `name` | `component` | `valueType` | ¿Requerido? |
|---|---|---|---|---|
| Icono | `icon` | `reference` | `string` | no |
| Alt del icono | `iconAlt` | `text` | `string` | no |
| Imagen | `image` | `reference` | `string` | no |
| Alt de la imagen | `imageAlt` | `text` | `string` | no (sí si hay imagen, a11y) |
| Eyebrow | `eyebrow` | `text` | `string` | no |
| Título | `title` | `text` | `string` | no |
| Texto (body + listas) | `text` | `richtext` | `string` | no |
| Texto del CTA | `ctaText` | `text` | `string` | no |
| Enlace del CTA | `ctaLink` | `aem-content` | `string` | no |

> **Convención de enlaces:** coherente con `models/_button.json` (`aem-content` para URL + `text` para
> el texto visible). El UE Specialist puede homogeneizar nombres a `link`/`linkText` si se prefiere.
> **Convención de imagen:** coherente con `_hero.json`/`_cards.json` (`reference`/`string` + campo alt
> de texto separado).

> **Filtro UE (Fase 3):** `id: feature-columns` → `components: ["feature-columns-panel"]`. Restaurar
> `data-aue-filter="feature-columns"` sobre el contenedor tras decorar para el botón "+ Añadir panel".

## 5. Variables de diseño aplicables

- Texto: `--color-text` (#191b1c) · `--font-display` (títulos H2) · `--font-body` (eyebrow, body, CTA)
- Tamaños: `--fs-eyebrow` (16/19.2) · `--fs-heading` (24/36) · `--fs-body-lg` (20/32) · `--fs-body` (16/24)
- Caja de icono: fondos de acento `--color-accent-teal` (#b5f0ef) / `--color-accent-yellow` (#fed430) según sección — ⚠️ color exacto por sección a confirmar
- Lista con check: marcador con color `--color-cta` (#ff821c)
- CTA: `--color-cta` / `--color-cta-border`, `--radius-pill` (32px), alto 48px
- Imagen: fondo redondeado `--radius-image` (⚠️ valor a confirmar)
- Gaps: `--space-md` (24px) entre columnas; `--space-sm` (16px) entre elementos internos

## 6. Comportamiento responsivo

- **Desktop (≥900px):** dos paneles lado a lado (`display:flex`/`grid` 2 col). Orden imagen↔texto
  según `layout`.
- **Tablet (768–899px):** mantener 2 columnas si cabe; reducir tipografías y gaps.
- **Mobile (<900px):** apilado vertical. La imagen suele ir **arriba** del texto (revisar frames
  `1:82`/`1:128`/`1:152`/`1:190`). En `content-media`, en mobile la imagen pasa arriba igualmente.

| Auto-layout Figma | CSS equivalente |
|---|---|
| Section horizontal (texto + media) | `display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;` |
| Orden media↔contenido | `.feature-columns--content-media { grid-template-areas: "content media"; }` |
| Container vertical gap 16px | `display:flex; flex-direction:column; gap:1rem;` |
| Lista con check | `list-style:none; padding:0;` + `li::before` con icono |
| Apilado mobile | `@media (max-width:899px){ grid-template-columns:1fr; }` |

## 7. Accesibilidad

- ♿ Títulos como `<h2>` (subsecciones); mantener jerarquía bajo el `<h1>` del hero.
- ♿ Listas como `<ul>/<li>` reales (no `<p>` con guiones); el icono de check es decorativo
  (`::before` o SVG `aria-hidden="true"`).
- ♿ Imágenes con `alt` desde `imageAlt`; iconos decorativos con `alt=""` o `aria-hidden`.
- ♿ CTA como `<a>` con texto descriptivo (evitar "Saber más" aislado si es ambiguo — añadir contexto vía `aria-label` si procede).
- ♿ Foco visible (`:focus-visible`) en CTAs.

## 8. Gestión de imágenes y media

Todas las imágenes provienen de **celdas del bloque** (campos `icon`/`image` reference) → EDS entrega
`<picture>`. **No** se requiere `createOptimizedPicture`.

| Imagen | Origen | LCP | Tratamiento |
|---|---|---|---|
| Imágenes de paneles (mapa, foto, "Reconocidos como") | Celda del panel → `<picture>` | **No** (below-the-fold; el LCP es el hero) | `loading="lazy"` + `decoding="async"` |
| Iconos (Seguridad, servicio) | Celda del panel → `<picture>` | No | `loading="lazy"`; tamaño pequeño en caja coloreada |

- **Breakpoints de `srcset`** (según `global-tokens.md`): base (≤599px), `600px`, `900px`, `1200px`.
- Proporciones: ⚠️ ratios exactos por imagen no extraídos; respetar los del frame original.

## 9. Interacciones y animaciones

- **Hover de CTA:** resoluble **solo CSS** (`:hover`, `:focus-visible`, `transition`).
- No se detectan acordeones, tabs ni carruseles en estas secciones → **no requiere JS** de comportamiento.
- ⚠️ Cualquier animación de entrada (fade-in al hacer scroll) no está confirmada en Figma; si se desea,
  resolver con CSS (`@keyframes` + `prefers-reduced-motion`) sin JS.

## 10. Notas y ambigüedades

- ✅ **Resuelto (Decisión 2):** nuevo bloque `feature-columns` sustituye el uso del core `columns` en
  estas 4 secciones. El antiguo `columns-instructions.md` queda **DEPRECADO** (redirige aquí).
- ⚠️ Color exacto de la caja de icono por sección (teal vs amarillo) no confirmado en los nodos.
- ⚠️ Radio del fondo de imagen (`--radius-image`) y tamaños tipográficos mobile no extraídos.
- ⚠️ Texto/orden exacto de listas y CTAs por sección debe verificarse contra el contenido autorado real.
- 🔧 **Fase 2:** CSS scoped a `.feature-columns`; evitar `feature-columns-container`/`-wrapper`.
  Resolver el alternado imagen↔texto por CSS (`order`/`grid-template-areas`), no reordenando DOM.
- 🔧 **Fase 3 (UE):** filtro `feature-columns` → `["feature-columns-panel"]`; restaurar
  `data-aue-filter="feature-columns"` tras decorar; nunca inventar `data-aue-resource`; usar
  `moveInstrumentation` solo si se crean elementos NUEVOS que sustituyan filas originales.
