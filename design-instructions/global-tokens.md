# Design Tokens Globales
> Generado por: Figma Analyst (Fase 1)
> Archivo Figma: Bankinter Luxembourg landing — fileKey `Wa7TozkduEgnYQDF4ClQo4`
> Frames de referencia: mobile `1:2` (390px) · desktop `1:280` (1905px, contenido máx ~1320–1344px)
> Implementar en: `/styles/styles.css`, `/styles/fonts.css`
> Modelo de proyecto: xwalk (EDS + Universal Editor)

> ⚠️ El archivo Figma **no publica Variables/tokens** (`get_variable_defs` devolvió `{}`).
> Todos los valores siguientes se extrajeron de los **valores crudos** (hex, font, px) presentes
> en el `get_design_context` de cada nodo. Son fieles al diseño, pero no provienen de una librería
> de tokens. El EDS Developer debe consolidarlos como custom properties en `styles.css`.

---

## Colores

| Token CSS propuesto | Valor | Rol semántico | Visto en |
|---|---|---|---|
| `--color-text` | `#191b1c` | Texto principal (casi negro) — todos los headings y body | Toda la página |
| `--color-cta` | `#ff821c` | Fondo botón CTA principal (naranja) | Hero CTA "PRODUCTOS Y SERVICIOS" |
| `--color-cta-border` | `#f76900` | Borde botón CTA + iconos de check de listas (naranja oscuro) | Hero CTA, listas con check |
| `--color-accent-yellow` | `#fed430` | Amarillo: botones de carrusel, fondo banner CTA, caja de icono (variante) | Hero carrusel, banner "Solicítanos", icono "Con el servicio" |
| `--color-accent-teal` | `#b5f0ef` | Verde-agua claro: fondo de banners de aviso, caja de icono (variante) | Banners "Aviso/Avis important", icono "Seguridad" |
| `--color-bg` | `#ffffff` | Fondo de página y fondo de botón sobre banner amarillo | Global, botón "CONTÁCTANOS" |
| `--color-header-bg` | `#ffffff` | Fondo del header principal (= `--color-bg`, alias semántico) | Header desktop `1:494` / mobile `1:3` |
| `--color-topbar-bg` | `#ebeef5` | Fondo de la barra superior decorativa del header (gris azulado claro) | Top bar desktop `1:495` (40px, vacía, desktop-only) |
| `--color-footer-bg` | `#ffffff` | Fondo del área principal del footer (= `--color-bg`, alias semántico) | Footer desktop `1:449` / mobile `1:232` |
| `--color-footer-bar-bg` | `#ebeef5` | Fondo de la franja de copyright del footer (= `--color-topbar-bg`) | Copyright bar `1:490` / `1:273` |
| `--color-footer-copyright` | `#5f6a83` | Texto del copyright (azul-gris atenuado) | Copyright `1:493` / `1:276` |

```css
:root {
  --color-text: #191b1c;          /* texto principal */
  --color-cta: #ff821c;           /* fondo CTA naranja */
  --color-cta-border: #f76900;    /* borde CTA / icono check listas */
  --color-accent-yellow: #fed430; /* carrusel / banner CTA / caja icono */
  --color-accent-teal: #b5f0ef;   /* banners aviso / caja icono */
  --color-bg: #ffffff;            /* fondo / botón sobre amarillo */
  --color-header-bg: #ffffff;     /* fondo header (alias de --color-bg) */
  --color-topbar-bg: #ebeef5;     /* barra superior decorativa del header */
  --color-footer-bg: #ffffff;        /* fondo área principal footer (alias de --color-bg) */
  --color-footer-bar-bg: #ebeef5;    /* franja de copyright (= --color-topbar-bg) */
  --color-footer-copyright: #5f6a83; /* texto copyright (azul-gris atenuado) */
}
```

> ✅ Colores de **header** confirmados: fondo header `#ffffff` (`--color-header-bg`) y barra
> superior `#ebeef5` (`--color-topbar-bg`).
> ✅ Colores de **footer** confirmados (nodos `1:449` desktop / `1:232` mobile): área principal
> `#ffffff` (`--color-footer-bg`), franja de copyright `#ebeef5` (`--color-footer-bar-bg`),
> enlaces/idiomas `#191b1c` (`--color-text`), texto de copyright `#5f6a83`
> (`--color-footer-copyright`), borde superior del footer `#ebeef5`.
> ⚠️ Hover de enlaces (nav y footer) **no está en el diseño estático** → `DATO NO EXISTENTE en
> Figma`; el EDS Developer decide el estado hover (recomendado: subrayado o color de marca).

♿ El amarillo `#fed430` y el teal `#b5f0ef` son fondos claros; el texto `#191b1c` sobre ellos
tiene contraste suficiente. Verificar el contraste del label `#191b1c` sobre el botón naranja
`#ff821c` (puede quedar por debajo de AA para texto pequeño de 12px).

---

## Tipografías

Dos familias propietarias de Bankinter, ambas en peso **Regular** en el diseño analizado:

| Token CSS propuesto | Familia | Uso |
|---|---|---|
| `--font-display` | `'BK-Text', Georgia, 'Times New Roman', serif` | Headings (H1 hero, H2 de sección, títulos de banner) |
| `--font-body` | `'BK-Sans', Arial, Helvetica, sans-serif` | Eyebrow, body, labels de botón, items de lista |

```css
:root {
  --font-display: 'BK-Text', Georgia, 'Times New Roman', serif;
  --font-body: 'BK-Sans', Arial, Helvetica, sans-serif;
}
```

> ⚠️ Comprobar que `/fonts/` contiene los archivos de **BK-Text** y **BK-Sans** y que `fonts.css`
> declara sus `@font-face`. Si faltan, el EDS Developer debe añadirlos (Fase 2). No se pudo
> confirmar formato de archivo (woff2/woff) ni pesos adicionales desde el MCP.

### Escala tipográfica (valores desktop confirmados)

| Token propuesto | Tamaño / line-height | Familia | Transform | Uso |
|---|---|---|---|---|
| `--fs-eyebrow` | `16px / 19.2px` | BK-Sans | uppercase | Eyebrow "BANKINTER LUXEMBOURG" |
| `--fs-display` | `40px / 48px` | BK-Text | — | H título hero "Bienvenido a Bankinter Luxembourg" |
| `--fs-heading` | `24px / 36px` | BK-Text | — | H2 de sección y de banner |
| `--fs-body-lg` | `20px / 32px` | BK-Sans | — | Body del hero |
| `--fs-body` | `16px / 24px` | BK-Sans | — | Body base, items de lista, texto de banner |
| `--fs-nav` | `14px / 24px` | BK-Sans | — | Items de navegación del header (`1:522`/`1:33`) |
| `--fs-button` | `12px / 48px` (tracking `1.5px`) | BK-Sans | uppercase | Labels de botón / CTA |

```css
:root {
  --fs-eyebrow: 16px;   --lh-eyebrow: 19.2px;
  --fs-display: 40px;   --lh-display: 48px;
  --fs-heading: 24px;   --lh-heading: 36px;
  --fs-body-lg: 20px;   --lh-body-lg: 32px;
  --fs-body: 16px;      --lh-body: 24px;
  --fs-nav: 14px;       --lh-nav: 24px;
  --fs-button: 12px;    --lh-button: 48px;  --ls-button: 1.5px;
}
```

> ⚠️ No se extrajeron tamaños tipográficos específicos para **mobile** (frame `1:2`). El EDS
> Developer debe escalar mobile-first; como referencia razonable, reducir `--fs-display` a ~28–32px
> en base. Marcar como `⚠️ tamaños mobile a confirmar en contexto`.

---

## Espaciados

Valores de `gap` y `padding` observados de forma recurrente en los auto-layouts:

| Token propuesto | Valor | Uso observado |
|---|---|---|
| `--space-3xs` | `2px` | Padding vertical interno de botones de carrusel |
| `--space-xs` | `12px` | Gutter horizontal de columnas/contenedores |
| `--space-sm` | `16px` | Gap entre eyebrow/heading/body |
| `--space-md` | `24px` | Padding-top antes de body y CTA |
| `--space-lg` | `32px` | Gap entre banners, padding interno de banners e iconos |
| `--space-xl` | `80px` | Padding inferior de la sección de banners |

```css
:root {
  --space-3xs: 2px;  --space-xs: 12px; --space-sm: 16px;
  --space-md: 24px;  --space-lg: 32px; --space-xl: 80px;
}
```

---

## Radios y formas

| Token propuesto | Valor | Uso |
|---|---|---|
| `--radius-pill` | `32px` | Botones CTA del hero (forma pill, alto 48px, min-width 185px) |
| `--radius-image` | `⚠️ a confirmar` | Fondo redondeado tras imágenes de mapa / secciones (rounded-rectangle en Figma; radio exacto no extraído) |
| Botón "ACCESO CLIENTES" (header) | `0px` (esquinas rectas) | Bot. del header `1:537`: fondo `--color-cta` pero **rectangular**, NO pill |
| Botones de carrusel | sin radio (cuadrados `62×62px`) | Controles prev/next del hero |

```css
:root {
  --radius-pill: 32px;
  /* --radius-image: a confirmar desde Figma */
}
```

---

## Breakpoints

> Frames Figma: **mobile 390px** y **desktop 1905px**. No hay frame intermedio (tablet) en el diseño.
> Se mantienen los breakpoints estándar del boilerplate (ver `AGENTS.md`), mobile-first:

| Nombre | min-width | Notas |
|---|---|---|
| base (mobile) | — | Frame `1:2` (390px). Stacking vertical de todas las secciones |
| sm | `600px` | — |
| md | `900px` | Punto razonable para pasar columnas a layout horizontal |
| lg | `1200px` | Layout desktop completo. Contenido máx ~1320–1344px centrado |

```css
/* mobile-first; aplicar media queries en min-width */
@media (min-width: 600px) { /* ... */ }
@media (min-width: 900px) { /* ... */ }
@media (min-width: 1200px) { /* ... */ }
```

> ⚠️ Los puntos exactos de cambio mobile→desktop no están definidos por el diseño (solo existen
> dos frames). El EDS Developer decide en qué breakpoint apilar/desapilar cada bloque; recomendado
> `900px` para los layouts de dos columnas.

---

## Notas de implementación para el EDS Developer

- Consolidar todas las custom properties anteriores en `:root` dentro de `styles/styles.css`.
- Declarar los `@font-face` de **BK-Text** y **BK-Sans** en `styles/fonts.css` (verificar que los
  archivos existan en `/fonts/`).
- El diseño usa **BK-Text (serif) para títulos** y **BK-Sans (sans) para el resto** — no intercambiar.
- Contenedor de contenido: `max-width` ~`1344px`, centrado con `margin-inline: auto`, gutter `12px`.
- Todos los bloques deben escribir su CSS **mobile-first** y subir a desktop con `min-width`.
- Ningún color/medida marcado con `⚠️` debe asumirse: confirmar con el equipo antes de Fase 2.
