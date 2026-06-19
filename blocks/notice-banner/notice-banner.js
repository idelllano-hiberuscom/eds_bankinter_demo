import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Notice Banner Block — AEM Edge Delivery Services
 *
 * Stack de banners (patrón container + items). CADA fila es un banner (item);
 * el contenedor no tiene campos propios, por lo que NO hay fila de config.
 * Dos variantes por item: "info" (teal, heading + cuerpo) y "action"
 * (amarillo, heading + botón). Sin imágenes, sin comportamiento JS.
 *
 * Figma reference: Bankinter Luxembourg — desktop 1:424 / mobile 1:208
 * Model: xwalk (EDS + Universal Editor)
 * UE instrumentation: ✅ Completado (Fase 3 - UE & QA Specialist)
 *   - Item-level: moveInstrumentation(row → .notice-banner-item) preserva el resource del item
 *     ANTES de eliminar la fila original (de lo contrario row.remove() lo destruiría).
 *   - Field-level: moveInstrumentation(celda → elemento) transfiere los data-aue-* inyectados
 *     por AEM (no se inventan props ni resources). variant/ctaText se editan en el property sheet.
 *   - Contenedor: data-aue-filter="notice-banner" restaurado para el botón "+ Añadir banner".
 *
 * DOM de ENTRADA (matriz EDS que recibe decorate) — 5 celdas por item, en orden:
 *   block.notice-banner
 *     └── div (ITEM = banner)
 *           ├── div (col 0) → <p> variant   ("info" | "action"; leído y eliminado, no renderiza)
 *           ├── div (col 1) → <h2>|<p> heading
 *           ├── div (col 2) → richtext body  (<p>…; usado en variante info; vacío en action)
 *           ├── div (col 3) → <p> ctaText    (texto del botón; action; vacío en info)
 *           └── div (col 4) → <p><a href> ctaLink (enlace del botón; usado en variante action)
 *     └── div (ITEM 2) … misma estructura de 5 celdas
 *
 * Lectura POR POSICIÓN (col0..col4), no por índice global. La variante sale de col0
 * (minúsculas; default "info" si vacío o desconocido). Celdas vacías se tratan con
 * gracia (info: col3/col4 vacías; action: col2 vacía) → no se generan wrappers vacíos.
 * Se MUEVEN los nodos autorados (no se reconstruye el DOM); la fila original se elimina
 * tras mover su contenido.
 *
 * @param {Element} block - Root element of the block
 */
export default function decorate(block) {
  const VARIANTS = ['info', 'action'];

  // Snapshot: cada fila es un banner. Se itera sobre la copia porque vamos
  // añadiendo items nuevos al bloque y eliminando las filas originales.
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];

    const cellAt = (i) => cells[i] || null;
    const textAt = (i) => (cellAt(i) ? cellAt(i).textContent.trim() : '');

    // Variante (col 0): normalizar a minúsculas; default "info".
    const rawVariant = textAt(0).toLowerCase();
    const variant = VARIANTS.includes(rawVariant) ? rawVariant : 'info';

    // Heading (col 1): origen h2/h3/p; siempre se entrega como <h2>.
    const headingSrc = cellAt(1)
      ? cellAt(1).querySelector('h1, h2, h3, h4, h5, h6, p')
      : null;

    const bodyCell = cellAt(2);
    const ctaText = textAt(3);
    const ctaLink = cellAt(4) ? cellAt(4).querySelector('a') : null;

    // Item nuevo + clase modificadora de variante (un-solo-guion; ver lint del repo).
    const item = document.createElement('div');
    item.className = `notice-banner-item notice-banner-item-${variant}`;
    // UE: transferir el resource del item (fila original) al item nuevo ANTES de eliminar la fila.
    // variant (col0) y ctaText (col3), sin elemento visible propio, quedan editables en el
    // property sheet del item gracias a este moveInstrumentation row → item.
    moveInstrumentation(row, item);

    // --- Heading → <h2 class="notice-banner-heading"> ---
    if (headingSrc && headingSrc.textContent.trim()) {
      let headingEl;
      if (headingSrc.tagName.toLowerCase() === 'h2') {
        headingEl = headingSrc;
      } else {
        // Reetiquetar moviendo los hijos (sin replaceWith sobre el nodo original).
        headingEl = document.createElement('h2');
        while (headingSrc.firstChild) headingEl.append(headingSrc.firstChild);
      }
      headingEl.classList.add('notice-banner-heading');
      // UE: transferir el campo heading (data-aue-* de la celda col1) al <h2> superviviente.
      if (cellAt(1)) moveInstrumentation(cellAt(1), headingEl);
      item.append(headingEl); // mueve el nodo existente (o el h2 nuevo con hijos movidos)
    }

    if (variant === 'action') {
      // --- ACTION: botón (reusa el <a> autorado de col4) dentro de un wrapper ---
      if (ctaLink && ctaLink.getAttribute('href')) {
        const text = ctaText || ctaLink.textContent.trim();
        if (text) ctaLink.textContent = text;
        ctaLink.classList.add('button', 'notice-banner-cta');
        // UE: transferir el campo ctaLink (data-aue-* de la celda col4) al <a> superviviente.
        if (cellAt(4)) moveInstrumentation(cellAt(4), ctaLink);

        const action = document.createElement('div');
        action.className = 'notice-banner-action';
        action.append(ctaLink); // mueve el <a> existente
        item.append(action);
      }
    } else if (bodyCell && bodyCell.textContent.trim()) {
      // --- INFO: cuerpo richtext (mueve los <p> existentes de col2) ---
      const body = document.createElement('div');
      body.className = 'notice-banner-body';
      while (bodyCell.firstChild) body.append(bodyCell.firstChild);
      // UE: transferir el campo body (richtext, data-aue-* de la celda col2) al contenedor body.
      moveInstrumentation(bodyCell, body);
      item.append(body);
    }

    block.append(item); // añade el item decorado al final del bloque
    row.remove(); // elimina la fila original (incluida la celda de variante col0)
  });

  // UE (xwalk): restaurar el filtro tras mover el DOM para que reaparezca el botón
  // "+ Añadir banner". El data-aue-resource del bloque lo inyecta AEM (no se inventa).
  if (block.dataset.aueResource) {
    block.dataset.aueFilter = 'notice-banner';
  }
}
