# Instrucciones de Bloque: header
> Generado por: Figma Analyst (Fase 1)
> Archivo Figma: Bankinter Luxembourg — fileKey `Wa7TozkduEgnYQDF4ClQo4`
> Nodo(s) de referencia: desktop `1:494` (top bar `1:495`, botón acceso `1:537`) · mobile `1:3`
> Nombre EDS: `header`
> Tipo: **MODIFICACIÓN** del bloque existente `header`
> Complejidad: **Media**
> Requiere JS: **sí** (toggle del menú hamburguesa en mobile)
> Modelo UE: xwalk

---

## 1. Descripción y propósito

Cabecera de navegación del sitio. En **desktop**: logo Bankinter (SVG 173×52) + navegación
horizontal de 5 items + botón "ACCESO CLIENTES" con icono. En **mobile**: logo + botón
**hamburguesa** que despliega la navegación.

> En EDS el `header` se alimenta de un **fragmento de navegación** (típicamente `/nav`), no de
> campos UE en la propia página. El `header.js` existente carga ese fragmento y decora secciones
> (brand / sections / tools). Esta MODIFICACIÓN ajusta estilos a la marca Bankinter y el
> comportamiento del menú mobile.

## 2. Referencia visual / layout (valores extraídos del Figma MCP)

### Desktop (`1:494`, 1905×106px; contenido máx **1320px** centrado, padding lateral 292.5px)

- **Top bar superior (`1:495`):** SÍ existe. Es un rectángulo de fondo **decorativo y SIN
  contenido** (sin texto, sin selector de idioma, sin enlaces — no tiene nodos hijos).
  - Color de fondo: **`#ebeef5`** (gris azulado muy claro).
  - Altura: **40px**, ancho completo (full-bleed, `left:0 right:0 top:0`).
  - ⚠️ No aparece en el frame mobile (`1:3` no contiene esta barra) → **desktop-only**.
- **Fondo del header principal:** **`#ffffff`** (blanco, `bg-white`). No transparente.
- **Fila principal:** logo izq. (`1:498`), navegación a la derecha del logo (`1:522`) y botón
  "ACCESO CLIENTES" (`1:537`) alineado a la **derecha** (la nav y el botón conviven en la zona
  derecha; el botón queda en la fila superior `1:536`, la nav debajo `1:522`).

### Mobile (`1:3`, 390px; padding lateral 24px, fondo `#ffffff`)

- **NO hay top bar** (`#ebeef5`) en mobile.
- Fila principal (`1:5`): **70px** de alto, `justify-content:space-between` → logo izq. +
  hamburguesa der.
- Menú de navegación (`1:33`) colapsado/fuera de viewport por defecto; al abrir muestra los 5
  items en columna (cada item `min-height:48px`, `padding-left:24px`).

## 3. Estructura DOM

### ENTRADA — Matriz EDS (lo que `decorate(block)` recibe)

El header se construye desde el **fragmento de navegación** cargado por `header.js`. El contenido
del fragmento llega como secciones EDS estándar (no como matriz de tabla del bloque):

```
nav (fragmento /nav)
  └── div (sección: brand)
        └── <p> | <a> → <picture>|<img> ← logo Bankinter (SVG)
  └── div (sección: sections)
        └── <ul>
              ├── <li> ← item nav 1
              ├── <li> ← item nav 2 … (5 items)
  └── div (sección: tools)
        └── <p><a href="..."> ← "ACCESO CLIENTES" (enlace con icono)
```

> ⚠️ La estructura exacta del fragmento `/nav` depende del contenido autoreado (no extraíble del
> Figma MCP). El Developer debe inspeccionar el fragmento real (`curl .../nav.plain.html`) en
> Fase 2. Tipos de nodo: logo → `<picture>`/`<img>`; navegación → `<ul><li>`; herramientas →
> `<p><a>`.

### SALIDA — DOM decorado (lo que `decorate()` produce)

```html
<header>
  <nav class="nav" aria-label="Principal">
    <div class="nav-brand"><a href="/"><img src="…" alt="Bankinter Luxembourg"></a></div>
    <div class="nav-sections">
      <ul>
        <li><a href="…">…</a></li><!-- 5 items -->
      </ul>
    </div>
    <div class="nav-tools">
      <a class="button" href="…">Acceso clientes <span class="icon" aria-hidden="true"></span></a>
    </div>
    <button class="nav-hamburger" type="button" aria-controls="nav-sections"
            aria-expanded="false" aria-label="Abrir menú"></button>
  </nav>
</header>
```

- El patrón `nav-brand` / `nav-sections` / `nav-tools` + hamburguesa es el del boilerplate. La
  MODIFICACIÓN reorganiza y estiliza, sin reconstruir el DOM.

## 4. Campos editables para Universal Editor (xwalk)

- El `header` **no expone campos UE en la página**: su contenido se autorea en el **fragmento
  `/nav`** (logo, items de menú, enlace de acceso). No requiere `component-models.json` propio.

| Elemento | Origen | Editable en |
|---|---|---|
| Logo | fragmento `/nav` | Documento de navegación |
| Items de navegación | fragmento `/nav` | Documento de navegación |
| "ACCESO CLIENTES" | fragmento `/nav` | Documento de navegación |

> ⚠️ Confirmar la ruta del fragmento de navegación (por defecto `/nav`) con el contenido del
> proyecto en Fase 2.

## 5. Variables de diseño aplicables (valores extraídos del Figma MCP)

### Logo Bankinter (`1:498`/`1:499` desktop · `1:6`/`1:7` mobile)

- Dimensiones: **173×52px** (idénticas en desktop y mobile — no cambia de tamaño).
- Versión/color: **naranja Bankinter** (asset `BK_BIL_naranja_pnatone-copy`). Incluye el
  lockup "bankinter." + tagline "Banking in Luxembourg" en naranja.
- Es un SVG → servir como `<img>` con `width="173" height="52"` (evita CLS). No usar
  `createOptimizedPicture`.

### Navegación (`1:522` desktop · `1:33` mobile)

- Color de items (estado normal): **`--color-text` `#191b1c`**.
- Tipografía: **`--font-body` (BK-Sans Regular)**, tamaño **14px**, line-height **24px**.
  (⚠️ nota: la nav usa **14px**, no los 16px del body base — ver token `--fs-nav` en
  `global-tokens.md`).
- Sin `text-transform` (los labels van en mayúscula/minúscula natural: "Sobre nosotros", etc.).
- Items: `Sobre nosotros` · `Productos y servicios` · `Financiación` · `SICAV` ·
  `Atención al cliente`.
- Gap/separación: en desktop los items están distribuidos horizontalmente a la derecha del
  logo (en Figma con posición absoluta; el Developer aplica `gap` ~24px en flex). En mobile
  cada item es una fila de `min-height:48px` con `padding-left:24px`.
- ⚠️ Color **hover/focus** de los items: NO extraíble (Figma estático no expone estados) →
  el Developer define hover con el naranja de marca o subrayado; confirmar con diseño.

### Botón "ACCESO CLIENTES" (`1:537`/`1:538`) — estilo PROPIO, NO es el pill del hero

| Propiedad | Valor extraído |
|---|---|
| Color de fondo | **`#ff821c`** (mismo naranja CTA que el hero, `--color-cta`) |
| Color de texto | **`#191b1c`** (`--color-text`, texto oscuro) — **no** blanco |
| Borde | **ninguno** (sin borde visible) |
| Radio | **0px** (esquinas rectas — **NO** es pill; difiere del CTA del hero `--radius-pill 32px`) |
| Altura | **40px** (`min-height:40px`) · ancho ~171px |
| Padding | **8px vertical / 16px horizontal** (`py-8 px-16`) |
| Gap icono↔texto | **4px** |
| Icono | icono de **persona/usuario** (👤), **24×24px**, a la **izquierda** del texto |
| Tipografía label | BK-Sans Regular, **12px**, line-height 18px, `letter-spacing 1px`, **uppercase**, centrado |

> Conclusión: el botón del header **reutiliza el fondo naranja `#ff821c`** del CTA del hero,
> pero con **esquinas rectas (radio 0)**, **texto oscuro `#191b1c`** e icono de usuario a la
> izquierda. Es un estilo propio, distinto del botón pill del hero (radio 32px). No aplicar
> `--radius-pill` aquí.

### Fondos del header (tokens nuevos → ver `global-tokens.md`)

- Fondo header principal: **`#ffffff`** → `--color-header-bg`.
- Fondo top bar: **`#ebeef5`** → `--color-topbar-bg`.

## 6. Comportamiento responsivo

- **Desktop (≥900px):** navegación horizontal visible; hamburguesa oculta.
- **Mobile (<900px):** navegación oculta tras hamburguesa; al pulsar, `aria-expanded` → `true` y se
  muestra el panel.

| Auto-layout Figma | CSS equivalente |
|---|---|
| Fila logo + nav + botón | `display:flex; align-items:center; justify-content:space-between;` |
| Nav horizontal | `ul { display:flex; gap:1.5rem; }` |
| Menú colapsado mobile | `display:none` por defecto + clase/`[aria-expanded]` para mostrar |

## 7. Accesibilidad

- ♿ Hamburguesa = `<button>` con `aria-controls`, `aria-expanded` y `aria-label` que cambia
  ("Abrir menú" / "Cerrar menú").
- ♿ `<nav aria-label="Principal">` y navegación como `<ul>/<li>`.
- ♿ Logo con `alt` significativo ("Bankinter Luxembourg").
- ♿ Foco visible y navegación por teclado (Esc cierra el menú mobile).

## 8. Gestión de imágenes y media

| Imagen | Origen | LCP | Tratamiento |
|---|---|---|---|
| Logo Bankinter (SVG 173×52) | Fragmento `/nav` (asset del proyecto) | No (es SVG ligero, no LCP) | `<img>` directo; `width`/`height` para evitar CLS |
| Icono "ACCESO CLIENTES" | `/icons/` o inline SVG | No | decorativo, `aria-hidden="true"` |

- El logo es un SVG → no requiere `createOptimizedPicture`. Servir como `<img>` con dimensiones.

## 9. Interacciones y animaciones

- **Toggle del menú hamburguesa** → **requiere JS** (gestionar `aria-expanded`, mostrar/ocultar
  panel, cerrar con Esc / click fuera). Es la lógica de header del boilerplate.
- Hover de items de navegación → **solo CSS**.

## 10. Notas y ambigüedades (actualizado tras extracción MCP)

### Resuelto con el Figma MCP

- ✅ **Top bar `1:495`:** existe en desktop, fondo `#ebeef5`, altura 40px, **vacía/decorativa**
  (sin texto ni enlaces). **No** aparece en mobile.
- ✅ **Fondo del header:** `#ffffff` (blanco, no transparente).
- ✅ **Botón "ACCESO CLIENTES":** estilo propio → fondo `#ff821c`, texto `#191b1c`, **sin borde**,
  **radio 0** (no pill), icono de usuario 24px a la izquierda, label 12px uppercase tracking 1px.
- ✅ **Logo:** 173×52px, naranja Bankinter, igual en desktop y mobile.
- ✅ **Navegación:** items `#191b1c`, BK-Sans 14px/24px, sin transform.
- ✅ **Hamburguesa mobile (`1:30`/`1:31`):** icono tipo imagen ~48×18px, líneas oscuras/negras,
  alineado a la derecha; botón con padding 2px. Ver §5 y §6.
- ✅ **Alturas/paddings:** desktop header 106px (top bar 40px + zona principal), contenido máx
  1320px centrado (padding lateral 292.5px en frame 1905px); mobile fila 70px, padding lateral 24px.

### Pendiente / no extraíble

- ⚠️ Contenido y ruta real del fragmento `/nav` (logo/items/enlace autorados) → inspeccionar en
  Fase 2 con `curl .../nav.plain.html` (Figma no expone el contenido del fragmento EDS).
- ⚠️ **Estados hover/focus** de items de navegación y del botón → no expuestos por Figma estático;
  definir en CSS y confirmar con diseño.
- ⚠️ **Separador/sombra/borde inferior** del header: en el diseño **no** se aprecia sombra ni borde
  inferior; la única división visual es la top bar `#ebeef5` sobre el header blanco. (Si se desea
  un borde inferior por accesibilidad/scroll, es decisión del Developer — no está en Figma.)
- ⚠️ Color exacto del icono hamburguesa: entregado como asset de imagen (no vector con `fill`
  legible); del screenshot es oscuro/negro. El Developer puede recolorear si usa SVG inline.
