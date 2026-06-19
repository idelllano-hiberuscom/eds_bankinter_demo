# Instrucciones de Bloque: hero
> Generado por: Figma Analyst (Fase 1) · Actualizado tras confirmación humana (Decisión 1)
> Archivo Figma: Bankinter Luxembourg — fileKey `Wa7TozkduEgnYQDF4ClQo4`
> Nodo(s) de referencia: desktop `1:283` · mobile `1:58`
> Nombre EDS: `hero`
> Tipo: **MODIFICACIÓN** del bloque existente `hero`
> Complejidad: **Alta**
> Requiere JS: **sí** (carrusel real multi-imagen: navegación, teclado, indicadores, autoplay opcional)
> Modelo UE: xwalk (patrón `container` + `items`)

---

## 1. Descripción y propósito

Bloque de cabecera principal de la landing, ahora confirmado como **CARRUSEL REAL multi-imagen**.
Cada diapositiva (slide) presenta: un *eyebrow* ("BANKINTER LUXEMBOURG"), un título display, un
párrafo introductorio, un botón CTA naranja y una imagen grande. Sobre la esquina inferior izquierda
de la imagen, **dos botones amarillos cuadrados (prev/next)** (`#fed430`, 62×62px) controlan la
rotación de slides. Se añaden además **indicadores (dots)** generados por JS.

> El bloque `hero` existente solo modelaba `image` + `imageAlt` + `text` y su `hero.js` está
> **vacío**. Esta MODIFICACIÓN convierte el bloque en un **contenedor de slides repetibles**
> (patrón `container` + `items`, igual que `cards`/`card`) e introduce **lógica JS de carrusel**.

### Modelo elegido (resumen de la decisión)

Cada slide tiene **su propia imagen y sus propios textos** (eyebrow, título, body, CTA).

**Justificación:** el diseño Figma muestra controles prev/next reales pero un único frame visible,
sin evidencia de que el texto sea fijo entre slides. Modelar textos por-slide da **máxima
flexibilidad de autoría** (cada slide puede contar una historia distinta) sin coste añadido: si el
autor quiere que solo rote la imagen, simplemente repite los mismos textos. Lo contrario (texto fijo
+ solo imágenes repetibles) bloquearía un caso de uso habitual en banners de cabecera. Por tanto el
**item = slide completo** (imagen + textos), no solo imagen.

## 2. Variantes detectadas

- **Default:** carrusel horizontal, imagen a la derecha + contenido a la izquierda (desktop).
- **Autoplay (opcional, config de bloque):** rotación automática con intervalo configurable —
  clase modificadora `.hero--autoplay` activada por el campo de config (ver §4).
- ⚠️ No se detectaron variantes visuales adicionales (dark / centered) en los nodos analizados.

## 3. Estructura DOM

### ENTRADA — Matriz EDS (lo que `decorate(block)` recibe)

Patrón `container` + `items`. Puede existir una **fila de configuración a nivel de bloque** ANTES
de las filas de items (slides). Esta fila de config es **opcional**: si el autor no la completa,
EDS no la entrega y el carrusel usa los valores por defecto del JS.

> ⚠️ **Importante (memoria xwalk):** no asumas que todo hijo directo de `block` es un slide. La
> primera fila puede ser config de bloque. El Developer debe distinguir la fila de config (celdas
> de texto sueltas, sin `<picture>`) de las filas de slides (siempre con `<picture>`).

```
block.hero
  └── div (FILA DE CONFIG DE BLOQUE — opcional)
        ├── div ← autoplay   → <p> "true" | "false" (texto plano)
        ├── div ← interval   → <p> "5000" (texto plano, ms)
        └── div ← loop       → <p> "true" | "false" (texto plano)

  └── div (FILA SLIDE 1)
        ├── div (col A) → <picture> ← imagen del slide (campo reference → EDS genera <picture>)
        ├── div (col B) → <p> ← imageAlt (texto plano, alt de la imagen)
        ├── div (col C) → <p> ← eyebrow "BANKINTER LUXEMBOURG" (texto plano)
        ├── div (col D) → <h1> | <p> ← título display
        ├── div (col E) → richtext body → uno o varios <p> (puede incluir <strong>)
        ├── div (col F) → <p> ← ctaText "PRODUCTOS Y SERVICIOS" (texto plano)
        └── div (col G) → <p><a href="..."> ← ctaLink (enlace envuelto en <p>)

  └── div (FILA SLIDE 2)
        ├── div (col A) → <picture>
        ├── div (col B) → <p> imageAlt
        ├── div (col C) → <p> eyebrow
        ├── div (col D) → <h1>|<p> título
        ├── div (col E) → richtext body
        ├── div (col F) → <p> ctaText
        └── div (col G) → <p><a> ctaLink

  └── div (FILA SLIDE N) … se repite por cada slide que añada el autor
```

> Tipo de nodo por celda confirmado: imagen → `<picture>`; textos cortos → `<p>`; título → `<h1>`
> (único de la página) o `<p>`; body → richtext (`<p>`/`<strong>`); CTA → `<p><a href>`.
> El Developer debe leer las celdas **por posición dentro de la fila del item**, no por un índice
> global del bloque.

### SALIDA — DOM decorado (lo que `decorate()` produce)

```html
<div class="hero block" role="region" aria-roledescription="carrusel" aria-label="Destacados">
  <div class="hero-carousel">

    <!-- viewport + pista de slides -->
    <div class="hero-track" aria-live="polite" aria-atomic="false">

      <div class="hero-slide" role="group" aria-roledescription="diapositiva" aria-label="1 de N">
        <div class="hero-media">
          <picture><!-- imagen slide 1 (EDS) — LCP --></picture>
        </div>
        <div class="hero-content">
          <p class="hero-eyebrow">BANKINTER LUXEMBOURG</p>
          <h1 class="hero-title">Bienvenido a Bankinter Luxembourg</h1>
          <div class="hero-body"><!-- richtext: <p>…</p> --></div>
          <a class="hero-cta button" href="…">Productos y servicios
            <span class="hero-cta-icon" aria-hidden="true"><!-- flecha --></span>
          </a>
        </div>
      </div>

      <!-- .hero-slide adicionales (idéntica estructura) -->

    </div>

    <!-- controles prev/next (UI NUEVA insertada por JS) -->
    <div class="hero-controls">
      <button class="hero-prev" type="button" aria-label="Imagen anterior"></button>
      <button class="hero-next" type="button" aria-label="Imagen siguiente"></button>
    </div>

    <!-- indicadores / dots (UI NUEVA insertada por JS) -->
    <div class="hero-dots" role="tablist" aria-label="Seleccionar diapositiva">
      <button class="hero-dot" type="button" role="tab" aria-selected="true"
              aria-label="Ir a la diapositiva 1"></button>
      <!-- un dot por slide -->
    </div>

  </div>
</div>
```

- El JS **mueve** cada fila-slide de entrada a un `.hero-slide` (reusa los nodos `<picture>`/`<p>`
  existentes, solo añade clases y wrappers `.hero-media` / `.hero-content`). **No** se destruye ni
  reconstruye el DOM autorado.
- `.hero-controls` y `.hero-dots` son **UI nueva** generada por JS (no existen en el DOM de entrada).
- `<h1>` solo en el slide cuyo título sea el encabezado principal de la página. Para evitar varios
  `<h1>`, los slides 2..N deben usar `<p class="hero-title">` o un único `<h1>` global visible.
  ⚠️ Decidir en Fase 2: recomendado **un solo `<h1>`** (el del primer slide) y `<p>` en el resto.

## 4. Campos editables para Universal Editor (xwalk)

Patrón `container` + `items`. **Dos modelos separados**: el bloque/contenedor (config) y el item
(slide). En Fase 3 el contenedor necesitará `data-aue-filter` para que aparezca el botón **"+"** de
añadir slide en Universal Editor.

### 4a. Campos del CONTENEDOR / bloque (`id: hero` en `component-models.json`)

Config global del carrusel. Todos opcionales (el JS aplica defaults si faltan):

| Campo | `name` | `component` | `valueType` | ¿Requerido? |
|---|---|---|---|---|
| Autoplay | `autoplay` | `boolean` | `boolean` | no |
| Intervalo (ms) | `interval` | `text` | `number` | no |
| Loop infinito | `loop` | `boolean` | `boolean` | no |

> El contenedor `hero` además declara un **filtro** (`id: hero`) que permite el componente
> `hero-slide`. El Developer/UE Specialist usará `template.filter: "hero"` + `template.model: "hero"`
> en la definición del bloque (mismo patrón que `cards` pero añadiendo modelo de config).

### 4b. Campos de cada ITEM / slide (`id: hero-slide` en `component-models.json`)

| Campo | `name` | `component` | `valueType` | ¿Requerido? |
|---|---|---|---|---|
| Imagen | `image` | `reference` | `string` | sí |
| Texto alternativo | `imageAlt` | `text` | `string` | sí (a11y) |
| Eyebrow | `eyebrow` | `text` | `string` | no |
| Título | `title` | `text` | `string` | sí |
| Texto (body) | `text` | `richtext` | `string` | no |
| Texto del CTA | `ctaText` | `text` | `string` | no |
| Enlace del CTA | `ctaLink` | `aem-content` | `string` | no |

> **Convención de enlaces del proyecto:** alineado con `models/_button.json`, que modela enlaces
> como `link` (`aem-content`) + `linkText` (`text`). Aquí se usan los nombres semánticos
> `ctaLink`/`ctaText` por claridad dentro del slide; el UE Specialist puede renombrarlos a
> `link`/`linkText` si se desea homogeneidad total con el core button. El **componente** y el
> **valueType** sí deben respetarse: `aem-content`/`string` para la URL, `text`/`string` para el
> texto visible.

> **Filtro UE (Fase 3):** `id: hero` → `components: ["hero-slide"]`. El `data-aue-filter="hero"`
> sobre el contenedor habilita el botón "+ Añadir slide". (Ver memoria: tras reemplazar/mover el
> DOM, restaurar `data-aue-filter` en el bloque para que reaparezca el botón de añadir item.)

## 5. Variables de diseño aplicables

- Texto: `--color-text` (#191b1c) · `--font-display` (título) · `--font-body` (eyebrow, body, CTA)
- Tamaños: `--fs-eyebrow` (16/19.2) · `--fs-display` (40/48) · `--fs-body-lg` (20/32) · `--fs-button` (12/48, ls 1.5px)
- CTA: fondo `--color-cta` (#ff821c), borde `--color-cta-border` (#f76900), `--radius-pill` (32px), alto 48px, min-width 185px
- Controles carrusel: fondo `--color-accent-yellow` (#fed430), 62×62px, sin radio
- Gaps: `--space-sm` (16px) entre eyebrow/título/body; `--space-md` (24px) antes de body y CTA

## 6. Comportamiento responsivo

- **Desktop (≥900–1200px):** `display:flex` horizontal por slide. Contenido col. izq. (~560px) +
  media col. der. (~784px). Imagen ratio ~1:1. Controles anclados abajo-izquierda sobre la imagen;
  dots debajo o sobre la imagen.
- **Tablet (768–1023px):** mantener dos columnas si cabe; reducir tamaños tipográficos.
- **Mobile (<900px):** `flex-direction: column` por slide — imagen primero, contenido después.
  ⚠️ Posición de los controles/dots en mobile **no confirmada** en frame `1:58`.

| Auto-layout Figma | CSS equivalente |
|---|---|
| Section horizontal (texto + media) | `display:flex; align-items:stretch;` |
| Container vertical gap 16px | `display:flex; flex-direction:column; gap:1rem;` |
| Imagen `aspect-[648/648]` | `aspect-ratio: 1 / 1;` |
| Botón pill 48px | `height:3rem; border-radius:32px; min-width:185px;` |
| Pista de slides (overflow) | `.hero-track { display:flex; } .hero-slide { flex:0 0 100%; }` |

## 7. Accesibilidad

- ♿ Controles prev/next como `<button>` reales con `aria-label` ("Imagen anterior"/"Imagen siguiente").
- ♿ Contenedor del carrusel con `role="region"` + `aria-roledescription="carrusel"` + `aria-label`.
- ♿ Cada slide con `role="group"` + `aria-roledescription="diapositiva"` + `aria-label="X de N"`.
- ♿ Región de slides con `aria-live="polite"` (no `assertive`) para anunciar cambios sin interrumpir.
- ♿ Dots como `<button role="tab">` con `aria-selected` y `aria-label` descriptivo.
- ♿ La imagen de cada slide recibe `alt` desde `imageAlt` (requerido).
- ♿ Un único `<h1>` por página (resto de slides → `<p>`).
- ♿ Foco visible (`:focus-visible`) en CTA, controles y dots; orden de tabulación lógico.
- ♿ Si hay autoplay: pausar en `hover`/`focus`, ofrecer control de pausa y respetar
  `prefers-reduced-motion` (sin autoavance ni transiciones animadas).

## 8. Gestión de imágenes y media

Todas las imágenes provienen de **celdas del bloque** (campo `image` reference) → EDS ya entrega
`<picture>`. **No** se requiere `createOptimizedPicture`.

| Imagen | Origen | LCP | Tratamiento |
|---|---|---|---|
| Slide 1 (primera imagen) | Celda del slide → `<picture>` | **Sí — candidata LCP** (above-the-fold en desktop, visible sin scroll) | `loading="eager"` + `fetchpriority="high"`; ratio ~1:1 |
| Slides 2..N | Celda del slide → `<picture>` | No | `loading="lazy"` + `decoding="async"` |

- **Breakpoints de `srcset`/`<source>`** (alineados con `global-tokens.md`): generar variantes para
  base (≤599px), `600px`, `900px`, `1200px`. EDS produce el `srcset` desde el `<picture>`; el bloque
  solo gestiona los atributos `loading`/`fetchpriority`/`decoding` según el índice del slide.
- Icono de flecha del CTA: vector SVG pequeño → icono inline (`/icons/`) o `<span aria-hidden="true">`.

## 9. Interacciones y animaciones — **requiere JS** (decorate síncrona)

> La función `decorate(block)` **debe ser síncrona**: construir la estructura del carrusel y
> registrar listeners sin `await`. Cargar dependencias diferidas (si las hubiera) fuera del camino
> crítico, nunca bloqueando el render del primer slide (LCP).

Comportamiento JS a implementar en Fase 2 (descripción, **no** código):

- **Navegación prev/next:** los botones cambian el índice activo (anterior/siguiente) y actualizan
  la pista (`transform` o visibilidad de slides) y el estado de los dots.
- **Salto por indicadores (dots):** click en un dot va directamente a ese slide y marca
  `aria-selected="true"` en el dot activo (resto a `false`).
- **Teclado:** flechas ←/→ para prev/next; `Home` → primer slide; `End` → último slide. Los
  controles y dots deben ser enfocables y operables con `Enter`/`Espacio`.
- **ARIA en runtime:** mantener `aria-label="X de N"` por slide y `aria-live="polite"` en la pista;
  actualizar `aria-selected` de los dots al cambiar de slide.
- **Autoplay (si `autoplay=true`):** avanza cada `interval` ms; **pausa** en `hover`/`focus` dentro
  del carrusel y al perder visibilidad de pestaña; reanuda al salir. Respeta `prefers-reduced-motion`.
- **Loop (si `loop=true`):** tras el último slide vuelve al primero (y viceversa con prev).
- **Hover de CTA/controles/dots:** resoluble **solo CSS** (`:hover`, `:focus-visible`, `transition`).

## 10. Notas y ambigüedades

- ✅ **Resuelto (Decisión 1):** el hero es un carrusel real multi-imagen; modelo `container`+`items`
  con slide completo (imagen + textos por slide).
- ⚠️ Decidir en Fase 2 el manejo de `<h1>` múltiple: recomendado **un solo `<h1>`** (slide 1) y
  `<p>` en el resto para no romper la jerarquía de encabezados.
- ⚠️ Posición/comportamiento de controles y dots en **mobile** no confirmado (frame `1:58`).
- ⚠️ Radio del fondo de imagen y tamaños tipográficos mobile no extraídos (ver `global-tokens.md`).
- ⚠️ Valores por defecto de `interval`/`autoplay`/`loop` no provienen de Figma; el Developer debe
  fijar defaults razonables (p. ej. autoplay off, interval 5000ms, loop on) y documentarlos.
- 🔧 **Fase 3 (UE):** restaurar `data-aue-filter="hero"` sobre el contenedor tras mover/decorar el
  DOM para que reaparezca el botón "+ Añadir slide". Usar `moveInstrumentation` solo si se crean
  elementos NUEVOS que sustituyan filas originales; si los slides se **mueven** (mismo nodo DOM),
  conservan sus `data-aue-*` inyectados por AEM — **nunca** inventar `data-aue-resource`.
