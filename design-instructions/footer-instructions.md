# Instrucciones de Bloque: footer
> Generado por: Figma Analyst (Fase 1)
> Archivo Figma: Bankinter Luxembourg — fileKey `Wa7TozkduEgnYQDF4ClQo4`
> Nodo(s) de referencia: desktop `1:449` · mobile `1:232`
> Nombre EDS: `footer`
> Tipo: **MODIFICACIÓN** del bloque existente `footer`
> Complejidad: **Baja/Media**
> Requiere JS: **no**
> Modelo UE: xwalk

---

## 1. Descripción y propósito

Pie de página del sitio. Contiene: logo `logo-luxemburgo.svg`, selector de **idioma** (English /
Español / Português), bloque de **enlaces corporativos** (Información legal, Seguridad y privacidad,
Derechos del inversor, Accesibilidad, Mapa web, Cookies) y línea de **copyright**.

> En EDS el `footer` se alimenta de un **fragmento de footer** (típicamente `/footer`) cargado por
> `footer.js`. Esta MODIFICACIÓN ajusta el layout y los estilos a la marca Bankinter.

## 2. Referencia visual / layout

> Valores confirmados desde Figma MCP (`get_design_context`) sobre `1:449` (desktop) y `1:232`
> (mobile). El archivo no publica Variables (`get_variable_defs` → `{}`); valores crudos del diseño.

**Estructura visual (ambas resoluciones):** área principal **blanca** (`#ffffff`) con borde superior
`1px solid #ebeef5`, seguida de una **franja de copyright** de ancho completo con fondo `#ebeef5`.

- **Desktop (`1:449`):** contenedor de `1344px` centrado, `padding-top: 41px`.
  - **Columna izquierda** (`w-336px`, `px-12`, gap vertical `29px`): logo `logo-luxemburgo.svg`
    (`173×52`) arriba, y debajo el **selector de idioma** en una sola fila horizontal
    (English / Español / Português).
  - **Columna derecha** (región “enlaces corporativos”, `w-1008px`): los 6 enlaces corporativos en
    **una sola fila horizontal** (`gap 42.6px`), alineados con la fila del logo.
  - **Franja de copyright** (`1:490`): ancho completo, fondo `#ebeef5`, texto a la izquierda del
    contenido centrado.
- **Mobile (`1:232`):** contenedor `366px`, `padding-top: 41px`, todo apilado en columna.
  - Logo arriba, selector de idioma en fila horizontal debajo (gap `26.6px`).
  - Enlaces corporativos en **rejilla de 2 columnas × 3 filas** (row gap `46px`).
  - Franja de copyright de ancho completo, fondo `#ebeef5`, **texto centrado**, `10px`.

## 3. Estructura DOM

### ENTRADA — Matriz EDS (lo que `decorate(block)` recibe)

El footer se construye desde el **fragmento `/footer`**; su contenido llega como secciones EDS:

```
div (fragmento /footer)
  └── div (sección: brand)
        └── <p>|<a> → <picture>|<img> ← logo-luxemburgo.svg
  └── div (sección: idiomas)
        └── <ul>
              ├── <li><a> ← "English"
              ├── <li><a> ← "Español"
              └── <li><a> ← "Português"
  └── div (sección: enlaces corporativos)
        └── <ul>
              ├── <li><a> ← "Información legal"
              ├── <li><a> ← "Seguridad y privacidad"
              ├── <li><a> ← "Derechos del inversor"
              ├── <li><a> ← "Accesibilidad"
              ├── <li><a> ← "Mapa web"
              └── <li><a> ← "Cookies"
  └── div (sección: copyright)
        └── <p> ← texto de copyright
```

> ⚠️ La estructura exacta depende del contenido autoreado del fragmento `/footer` (no extraíble del
> Figma MCP). Inspeccionar `curl .../footer.plain.html` en Fase 2. Tipos de nodo: logo →
> `<picture>`/`<img>`; listas de enlaces → `<ul><li><a>`; copyright → `<p>`.

### SALIDA — DOM decorado (lo que `decorate()` produce)

```html
<footer>
  <div class="footer block">
    <div class="footer-brand"><img src="…" alt="Bankinter Luxembourg"></div>
    <nav class="footer-langs" aria-label="Idioma">
      <ul><li><a href="…">English</a></li><!-- … --></ul>
    </nav>
    <nav class="footer-links" aria-label="Enlaces legales">
      <ul><li><a href="…">Información legal</a></li><!-- … --></ul>
    </nav>
    <p class="footer-copyright">© COPYRIGHT BANKINTER LUXEMBOURG.</p>
  </div>
</footer>
```

- Patrón estándar del boilerplate: añadir clases y wrappers semánticos, sin reconstruir el DOM.

## 4. Campos editables para Universal Editor (xwalk)

- El `footer` **no expone campos UE en la página**: su contenido se autorea en el **fragmento
  `/footer`**. No requiere `component-models.json` propio.

| Elemento | Origen | Editable en |
|---|---|---|
| Logo | fragmento `/footer` | Documento de footer |
| Enlaces de idioma | fragmento `/footer` | Documento de footer |
| Enlaces corporativos | fragmento `/footer` | Documento de footer |
| Copyright | fragmento `/footer` | Documento de footer |

> ⚠️ Confirmar la ruta del fragmento de footer (por defecto `/footer`) en Fase 2.

## 5. Variables de diseño aplicables

> Confirmadas desde Figma MCP (nodos `1:449` / `1:232`). El diseño usa **BK-Sans Regular** para
> todo el texto del footer (no hay BK-Text/serif en el footer).

| Elemento | Valor extraído | Token |
|---|---|---|
| Fondo área principal | `#ffffff` | `--color-footer-bg` (= `--color-bg`) |
| Borde superior del footer | `1px solid #ebeef5` | `--color-footer-bar-bg` / `--color-topbar-bg` |
| Franja de copyright (fondo) | `#ebeef5` | `--color-footer-bar-bg` |
| Texto de copyright | `#5f6a83`, uppercase | `--color-footer-copyright` |
| Enlaces de idioma | `#191b1c`, BK-Sans 12px/24px | `--color-text`, `--font-body` |
| Enlaces corporativos | `#191b1c`, BK-Sans 12px/24px | `--color-text`, `--font-body` |
| Logo `logo-luxemburgo.svg` | `173×52px` | — (mantener relación de aspecto) |

- Tamaño de fuente de enlaces (idioma + corporativos): **12px / line-height 24px** (no es el
  `--fs-nav` de 14px del header; el footer usa 12px). Sugerencia: token nuevo `--fs-footer: 12px`
  o reutilizar `--fs-button: 12px` sin el tracking/uppercase.
- Gap fila de enlaces corporativos desktop: `42.6px` (≈ `--space-lg` 32px + extra). Gap idioma:
  `26.7px` desktop / `26.6px` mobile (≈ `--space-md` 24px).
- Copyright: desktop **12px** (`line-height 64px`, alto de franja) · mobile **10px**
  (`line-height 15px`, `padding 24px`, texto centrado).
- ✅ **Hover de enlaces: NO definido en el diseño** (Figma muestra solo estado normal). No es un
  dato faltante — simplemente no existe en el diseño; el EDS Developer decide el hover
  (recomendado: subrayado o color de marca naranja).

## 6. Comportamiento responsivo

- **Desktop (≥1200px, contenedor 1344px):** logo + idioma en columna izquierda; enlaces
  corporativos en una fila horizontal a la derecha; franja de copyright de ancho completo abajo.
- **Mobile (<900px, contenedor 366px):** todo apilado en columna — logo, idioma (fila), enlaces
  corporativos (rejilla 2×3), franja de copyright centrada.

| Auto-layout Figma | CSS equivalente |
|---|---|
| Idioma en fila (gap 26.7px) | `ul { display:flex; gap:1.5rem; }` |
| Enlaces corporativos fila desktop (gap 42.6px) | `ul { display:flex; flex-wrap:wrap; gap:2.66rem; }` |
| Enlaces corporativos rejilla mobile 2×3 (row gap 46px) | `ul { display:grid; grid-template-columns:repeat(2,1fr); row-gap:2.875rem; }` |
| Franja copyright ancho completo | `.footer-copyright { background:var(--color-footer-bar-bg); width:100%; }` |
| Copyright centrado en mobile | `text-align:center;` solo en base; izquierda en desktop |

## 7. Accesibilidad

- ♿ Agrupar enlaces en `<nav>` con `aria-label` distintivo (idioma / legales).
- ♿ Enlaces como `<ul>/<li>/<a>` con texto descriptivo.
- ♿ Logo con `alt` significativo.
- ♿ Foco visible en todos los enlaces.

## 8. Gestión de imágenes y media

| Imagen | Origen | LCP | Tratamiento |
|---|---|---|---|
| `logo-luxemburgo.svg` (`173×52px`) | Fragmento `/footer` (asset del proyecto) | No (footer, below-the-fold) | `<img>` directo con `width="173" height="52"`; SVG ligero, sin `createOptimizedPicture` |

> Logo confirmado en Figma: `173×52px` idéntico en desktop (`1:454`) y mobile (`1:237`). Es la
> versión naranja de marca “bankinter / Banking in Luxembourg”. Posición: esquina superior
> izquierda en ambas resoluciones.

## 9. Interacciones y animaciones

- Sin interacciones que requieran JS. Hover de enlaces → **solo CSS**.

## 10. Notas y ambigüedades

- ✅ **Colores del footer confirmados** (Figma `1:449`/`1:232`): área principal `#ffffff`, franja de
  copyright `#ebeef5`, borde superior `1px solid #ebeef5`, enlaces/idiomas `#191b1c`, copyright
  `#5f6a83`. Tokens nuevos en `global-tokens.md`: `--color-footer-bg`, `--color-footer-bar-bg`,
  `--color-footer-copyright`.
- ✅ **Selector de idioma:** en el diseño es una **fila de 3 etiquetas de texto** (English / Español
  / Português), BK-Sans 12px/24px `#191b1c`, gap ~26.7px. **No** es un `<select>`, **no** tiene
  flechas, **no** tiene banderas/iconos, **no** tiene separadores visibles, y **no** muestra un
  estado activo diferenciado (los tres se ven idénticos). Funcionalmente deben ser enlaces de
  cambio de idioma; el estado activo (idioma actual) deberá añadirlo el Developer.
- ✅ **Copyright:** texto exacto “© COPYRIGHT BANKINTER LUXEMBOURG.” (uppercase, `#5f6a83`). Desktop
  12px sobre franja `#ebeef5` de ancho completo; mobile 10px centrado.
- ⚠️ **Hover de enlaces: no existe en el diseño** (solo estado normal en Figma) → no es dato
  faltante; el Developer define el hover (recomendado subrayado o color de marca).
- ⚠️ Contenido y ruta del fragmento `/footer` no extraíbles de Figma → inspeccionar en Fase 2 con
  `curl .../footer.plain.html`.
- ⚠️ En el texto del diseño aparece “Informacion legal” (sin tilde); confirmar si el contenido
  autoreado debe llevar tilde (“Información legal”).
- ⚠️ No hay sombra (`box-shadow`) en el footer; el único separador es el borde superior `#ebeef5`.
