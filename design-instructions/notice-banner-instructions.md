# Instrucciones de Bloque: notice-banner
> Generado por: Figma Analyst (Fase 1)
> Archivo Figma: Bankinter Luxembourg — fileKey `Wa7TozkduEgnYQDF4ClQo4`
> Nodo(s) de referencia: desktop `1:424` · mobile `1:208`
> Nombre EDS: `notice-banner`
> Tipo: **NUEVO** (sin equivalente en el boilerplate)
> Complejidad: **Media**
> Requiere JS: **no**
> Modelo UE: xwalk

---

## 1. Descripción y propósito

Sección con **tres banners apilados** (gap 32px, padding inferior de sección 80px):

1. **"Aviso importante"** — fondo teal `#b5f0ef`. Heading a la izquierda (~421px), cuerpo legal
   a la derecha (~842px). Texto legal anti-phishing en **español**.
2. **"Avis important"** — fondo teal `#b5f0ef`. Misma estructura, versión en **francés**.
3. **"Solicítanos información"** — fondo amarillo `#fed430`. Heading a la izquierda + **botón
   blanco redondeado "CONTÁCTANOS"** a la derecha.

Hay dos usos: banner **informativo** (heading + cuerpo de texto, teal) y banner de **acción**
(heading + botón, amarillo). Se modela como un único bloque con **items repetibles** y una
**variante por item**.

## 2. Referencia visual / layout

- **Desktop (`1:424`):** cada banner es una caja de dos columnas internas (heading-izq / contenido-der).
- **Mobile (`1:208`):** cada banner apila heading sobre contenido; los tres banners siguen en columna.

## 3. Estructura DOM

### ENTRADA — Matriz EDS (lo que `decorate(block)` recibe)

Patrón `container` + `items`: la **primera fila** puede contener config del bloque y cada **fila
siguiente** es un banner (item). Estructura de un item:

```
block.notice-banner
  └── div (item 1 — Aviso importante)
        ├── div (col A) → <p> ← variante: "info"  (texto plano que el JS lee y elimina)
        ├── div (col B) → <h2> | <p><strong> ← "Aviso importante" (heading del banner)
        └── div (col C) → <p> ← cuerpo legal ES (richtext; uno o varios <p>)
  └── div (item 2 — Avis important)
        ├── div (col A) → <p> ← "info"
        ├── div (col B) → <h2> ← "Avis important"
        └── div (col C) → <p> ← cuerpo legal FR
  └── div (item 3 — Solicítanos información)
        ├── div (col A) → <p> ← variante: "action"
        ├── div (col B) → <h2> ← "Solicítanos información"
        └── div (col C) → <p><a href="..."> ← botón "CONTÁCTANOS" (enlace envuelto en <p>)
```

> ⚠️ El número y orden exacto de columnas por item lo fija el modelo del UE Specialist (Fase 3).
> El Developer debe leer celdas por posición dentro de cada item, **no** por índice global, y
> tratar la variante (info/action) como dato de la primera celda.

### SALIDA — DOM decorado (lo que `decorate()` produce)

```html
<div class="notice-banner block">
  <div class="notice-banner-item notice-banner-item--info">
    <h2 class="notice-banner-heading">Aviso importante</h2>
    <div class="notice-banner-body"><!-- richtext ES --></div>
  </div>
  <div class="notice-banner-item notice-banner-item--info">
    <h2 class="notice-banner-heading">Avis important</h2>
    <div class="notice-banner-body"><!-- richtext FR --></div>
  </div>
  <div class="notice-banner-item notice-banner-item--action">
    <h2 class="notice-banner-heading">Solicítanos información</h2>
    <div class="notice-banner-action">
      <a class="button notice-banner-cta" href="…">Contáctanos</a>
    </div>
  </div>
</div>
```

- La variante se traduce a clase modificadora: `.notice-banner-item--info` (teal) /
  `.notice-banner-item--action` (amarillo).
- El bloque **reorganiza nodos existentes** y añade clases; el botón se mantiene como el `<a>` ya
  autoreado (no se crea desde cero).

## 4. Campos editables para Universal Editor (xwalk)

Al ser items repetibles, se documentan **dos tablas separadas**.

**Campos del contenedor raíz** (`id: notice-banner` en `component-models.json`):

| Campo | `name` | `component` | `valueType` | ¿Requerido? |
|---|---|---|---|---|
| (sin campos propios del contenedor) | — | — | — | — |

> El contenedor solo agrupa items; no requiere campos propios. El `filter` del UE debe permitir
> `notice-banner-item` como hijo repetible (botón "+ añadir item").

**Campos de cada item** (`id: notice-banner-item` en `component-models.json`):

| Campo | `name` | `component` | `valueType` | ¿Requerido? |
|---|---|---|---|---|
| Variante | `variant` | `select` (opciones: `info`, `action`) | `string` | sí |
| Título | `heading` | `text` | `string` | sí |
| Cuerpo | `body` | `richtext` | `string` | no (solo variante `info`) |
| Texto del botón | `ctaText` | `text` | `string` | no (solo variante `action`) |
| Enlace del botón | `ctaLink` | `aem-content` | `string` | no (solo variante `action`) |

> ⚠️ Recordatorio Fase 2/3 (xwalk): tras reemplazos de DOM, restaurar `data-aue-filter` en el
> contenedor para que el botón "+ añadir item" aparezca en UE. **Nunca** inventar `data-aue-resource`.

## 5. Variables de diseño aplicables

- Variante info: fondo `--color-accent-teal` (#b5f0ef)
- Variante action: fondo `--color-accent-yellow` (#fed430)
- Heading: `--font-display`, `--fs-heading` (24/36), `--color-text`
- Cuerpo: `--font-body`, `--fs-body` (16/24), `--color-text`
- Botón "CONTÁCTANOS": fondo `--color-bg` (#ffffff), texto `--color-text`, `--radius-pill`,
  label `--fs-button` (12/48, ls 1.5px), uppercase
- Gap entre banners: `--space-lg` (32px) · padding interno banner: `--space-lg` (32px) ·
  padding-inferior sección: `--space-xl` (80px)

## 6. Comportamiento responsivo

- **Desktop (≥900px):** cada item = dos columnas internas (`heading` izq ~421px / contenido der
  ~842px) vía `display:grid; grid-template-columns: auto 1fr;` o flex.
- **Mobile (<900px):** cada item apila heading sobre contenido (`flex-direction: column`). Los tres
  items permanecen en columna.

| Auto-layout Figma | CSS equivalente |
|---|---|
| Stack de 3 banners gap 32px | `display:flex; flex-direction:column; gap:2rem;` |
| Banner 2 columnas (heading/contenido) | `display:grid; grid-template-columns:minmax(0,421px) 1fr; gap:2rem;` |
| Banner action (heading/botón) | `display:flex; justify-content:space-between; align-items:center;` |

## 7. Accesibilidad

- ♿ Headings de banner como `<h2>` (jerarquía bajo el `<h1>` del hero).
- ♿ El botón "CONTÁCTANOS" es `<a>` (navega a contacto) → texto descriptivo.
- ♿ Verificar contraste de texto `#191b1c` sobre teal `#b5f0ef` y amarillo `#fed430` (ambos
  fondos claros → suele cumplir AA, confirmar con herramienta).
- ♿ El texto legal largo debe mantener `line-height` legible (`--lh-body` 24px).

## 8. Gestión de imágenes y media

- **No hay imágenes** en este bloque. Solo texto y un botón-enlace.
- No requiere `createOptimizedPicture` ni gestión de `<picture>`.

## 9. Interacciones y animaciones

- Sin interacciones que requieran JS. Hover/focus del botón → **solo CSS**
  (`:hover`, `:focus-visible`, `transition`).

## 10. Notas y ambigüedades

- ⚠️ La variante (`info`/`action`) se infiere del color de fondo en Figma; confirmar nombres de
  variante con el equipo de contenido.
- ⚠️ Anchos internos (421px / 842px) son del diseño desktop; se traducen a proporciones flexibles,
  no a píxeles fijos.
- ⚠️ Los banners ES/FR son contenido duplicado por idioma autoreado, no lógica de i18n del bloque.
