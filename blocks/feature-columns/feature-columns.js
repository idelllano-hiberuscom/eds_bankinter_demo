import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Feature Columns Block — AEM Edge Delivery Services
 *
 * Bloque de DOS paneles (media ↔ contenido) reutilizado en 4 secciones de la landing
 * (features, ¿Por qué Luxemburgo?, ¿Por qué Bankinter?, Somos una referencia).
 * Patrón container + items donde CADA item = UN panel (un lado).
 *
 * Figma reference: Bankinter Luxembourg — desktop 1:306 / 1:352 / 1:370 / 1:407
 * Model: xwalk (EDS + Universal Editor)
 * UE instrumentation: ✅ Completado (Fase 3 - UE & QA Specialist)
 *   - Item-level: moveInstrumentation(row → .feature-columns-panel) preserva el resource del panel.
 *   - Field-level: moveInstrumentation(celda → elemento) transfiere los data-aue-* inyectados
 *     por AEM (no se inventan props ni resources). iconAlt/imageAlt/ctaText se editan en el panel.
 *   - Contenedor: data-aue-filter="feature-columns" restaurado para el botón "+ Añadir panel".
 *
 * DOM de ENTRADA (matriz EDS que recibe decorate) — 4 celdas por panel (límite
 * xwalk max-cells = 4). El contenido textual viaja AGRUPADO en una sola celda
 * (element grouping "content") con field-collapse para título y CTA:
 *   block.feature-columns
 *     ├── div (FILA DE CONFIG — OPCIONAL)
 *     │     └── div → <p> layout ("media-content" | "content-media" | "equal")
 *     ├── div (FILA PANEL A)
 *     │     ├── div (celda 0) → <picture>  icon  (+iconAlt; vacío si no aplica)
 *     │     ├── div (celda 1) → <picture>  image (+imageAlt; vacío si no aplica)
 *     │     ├── div (celda 2) → grupo "content": <p>eyebrow, <hN>título,
 *     │     │                    <p>/<ul> cuerpo, <p><a> CTA (cualquiera opcional)
 *     │     └── div (celda 3) → <p> iconColor ("teal" | "yellow"; vacío = teal)
 *     └── div (FILA PANEL B) … misma estructura de 4 celdas
 *
 * Distinción CONFIG vs PANEL: la fila de CONFIG tiene UNA sola celda cuyo texto
 * coincide con /^(media-content|content-media|equal)$/i. Las demás son paneles.
 *
 * La celda "content" ya llega como HTML semántico apilado (gracias a element grouping
 * + field collapse del modelo), así que NO se lee por posición de campo: se localizan
 * los nodos por tipo (heading = título; <p> previo al heading = eyebrow; <a> = CTA;
 * <ul> = lista) y se decoran in situ reutilizando la propia celda (preserva instrumentación).
 *
 * iconColor (celda 3) es un campo SIN elemento visible: se consume para el color de la
 * caja de icono y se elimina con la fila; sigue editable en el property sheet del panel
 * gracias a la instrumentación de item (moveInstrumentation row → panel).
 *
 * El alternado imagen↔texto se resuelve POR CSS (order/grid) según la clase de layout.
 *
 * @param {Element} block - Root element of the block
 */
export default function decorate(block) {
  const LAYOUTS = ['media-content', 'content-media', 'equal'];
  const LAYOUT_RE = /^(media-content|content-media|equal)$/i;
  const COLORS = ['teal', 'yellow'];

  const rows = [...block.children];

  // 1. CLASIFICACIÓN — la fila de CONFIG tiene UNA celda cuyo texto es un layout válido.
  const configRow = rows.find((row) => {
    const cols = [...row.children];
    if (cols.length !== 1) return false;
    return LAYOUT_RE.test(cols[0].textContent.trim());
  }) || null;

  const panelRows = rows.filter((row) => row !== configRow);

  // Sin paneles: nada que decorar, dejar el DOM intacto.
  if (panelRows.length === 0) return;

  // 2. LAYOUT (default media-content).
  let layout = 'media-content';
  if (configRow) {
    const value = configRow.children[0].textContent.trim().toLowerCase();
    if (LAYOUTS.includes(value)) layout = value;
  }
  block.classList.add(`feature-columns-${layout}`);
  if (configRow) configRow.remove();

  // 3. CONSTRUCCIÓN DE PANELES — 4 celdas por panel (límite xwalk max-cells):
  //    [0] icon (+iconAlt)  [1] image (+imageAlt)  [2] grupo "content"  [3] iconColor.
  //    El grupo "content" llega como UNA celda con HTML semántico ya apilado
  //    (eyebrow <p>, título <hN>, cuerpo <p>/<ul>, CTA <p><a>); se decora in situ.
  panelRows.forEach((row) => {
    const cells = [...row.children];
    const iconCell = cells[0] || null;
    const imageCell = cells[1] || null;
    const contentCell = cells[2] || null;
    const colorCell = cells[3] || null;

    // Color del icono (celda 3, sin elemento visible): "yellow" activa el modificador.
    const rawColor = colorCell ? colorCell.textContent.trim().toLowerCase() : '';
    const iconColor = COLORS.includes(rawColor) ? rawColor : 'teal';

    const panel = document.createElement('div');
    panel.className = 'feature-columns-panel';
    if (iconColor === 'yellow') panel.classList.add('feature-columns-panel-icon-yellow');
    // UE: transferir el resource del item (fila original) al panel nuevo ANTES de eliminar la fila.
    // iconColor (celda 3) queda editable en el property sheet del panel vía esta instrumentación.
    moveInstrumentation(row, panel);

    const iconPicture = iconCell ? iconCell.querySelector('picture') : null;
    const imagePicture = imageCell ? imageCell.querySelector('picture') : null;

    // --- MEDIA (imagen grande a un lado) ---
    if (imagePicture) {
      panel.classList.add('feature-columns-panel-media');
      const media = document.createElement('div');
      media.className = 'feature-columns-media';
      const img = imagePicture.querySelector('img');
      if (img) {
        // El LCP es el hero → todas las imágenes de panel son lazy.
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      }
      media.append(imagePicture); // mueve el <picture> existente
      // UE: transferir el campo image (data-aue-* de la celda) al <picture> superviviente.
      if (imageCell) moveInstrumentation(imageCell, imagePicture);
      panel.append(media);
    } else {
      panel.classList.add('feature-columns-panel-content');
    }

    // --- CONTENIDO: se reutiliza la celda del grupo (preserva la instrumentación de
    //     cada campo) y se decoran los nodos ya existentes. ---
    const content = contentCell || document.createElement('div');
    content.classList.add('feature-columns-content');

    // Caja de icono (fondo de acento) antepuesta al texto. Color teal/yellow por panel.
    if (iconPicture) {
      const iconBox = document.createElement('div');
      iconBox.className = 'feature-columns-icon';
      const iconImg = iconPicture.querySelector('img');
      if (iconImg) {
        iconImg.setAttribute('loading', 'lazy');
        iconImg.setAttribute('decoding', 'async');
      }
      iconBox.append(iconPicture); // mueve el <picture> existente
      // UE: transferir el campo icon (data-aue-* de la celda) al <picture> superviviente.
      if (iconCell) moveInstrumentation(iconCell, iconPicture);
      content.prepend(iconBox);
    }

    // Título = heading del grupo (<hN>). Eyebrow = el/los <p> previos al heading.
    const titleEl = content.querySelector('h1, h2, h3, h4, h5, h6');
    if (titleEl) {
      titleEl.classList.add('feature-columns-title');
      let prev = titleEl.previousElementSibling;
      while (prev) {
        if (prev.matches('p')) prev.classList.add('feature-columns-eyebrow');
        prev = prev.previousElementSibling;
      }
    }

    // Listas del cuerpo → viñetas con check de acento.
    content.querySelectorAll('ul').forEach((ul) => ul.classList.add('feature-columns-list'));

    // CTA → botón naranja. El grupo lo entrega como <p><a>; se localiza el último <p>
    // que envuelve únicamente un <a> y se desenvuelve para alinearlo como hijo del flex.
    const ctaWrap = [...content.querySelectorAll(':scope > p')].reverse().find(
      (p) => p.children.length === 1
        && p.firstElementChild.tagName === 'A'
        && p.textContent.trim() === p.firstElementChild.textContent.trim(),
    );
    if (ctaWrap) {
      const ctaLink = ctaWrap.firstElementChild;
      ctaLink.classList.add('feature-columns-cta', 'button');
      content.insertBefore(ctaLink, ctaWrap);
      ctaWrap.remove();
    }

    // Solo se añade el contenido si tiene algo que mostrar (evita wrappers vacíos
    // en paneles solo-imagen).
    if (content.children.length > 0) {
      panel.append(content);
    }

    block.append(panel); // inserta el panel decorado
    row.remove(); // elimina la fila original ya vaciada (celdas icon/image/color)
  });

  // UE (xwalk): restaurar el filtro tras mover el DOM para que reaparezca el botón
  // "+ Añadir panel". El data-aue-resource del bloque lo inyecta AEM (no se inventa).
  if (block.dataset.aueResource) {
    block.dataset.aueFilter = 'feature-columns';
  }
}
