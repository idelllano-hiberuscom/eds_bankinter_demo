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
 * DOM de ENTRADA (matriz EDS que recibe decorate):
 *   block.feature-columns
 *     ├── div (FILA DE CONFIG — OPCIONAL)
 *     │     └── div → <p> layout ("media-content" | "content-media" | "equal")
 *     ├── div (FILA PANEL A)
 *     │     ├── div (col 0) → <picture>   icon   (vacío si no aplica)
 *     │     ├── div (col 1) → <p>         iconAlt
 *     │     ├── div (col 2) → <picture>   image  (vacío si no aplica)
 *     │     ├── div (col 3) → <p>         imageAlt
 *     │     ├── div (col 4) → <p>         eyebrow
 *     │     ├── div (col 5) → <h2>        title
 *     │     ├── div (col 6) → richtext    body (<p> y/o <ul><li>)
 *     │     ├── div (col 7) → <p>         ctaText
 *     │     ├── div (col 8) → <p><a href> ctaLink
 *     │     └── div (col 9) → <p>         iconColor ("teal" | "yellow"; vacío = teal)
 *     └── div (FILA PANEL B) … misma estructura de 10 celdas
 *
 * Distinción CONFIG vs PANEL (CRÍTICO — los paneles pueden ser SOLO texto, así que
 * NO se puede detectar por <picture>): la fila de CONFIG es la que tiene UNA sola
 * celda cuyo texto coincide con /^(media-content|content-media|equal)$/i. TODAS las
 * demás filas son paneles y se leen POR POSICIÓN (0..9). Celdas vacías = campo ausente
 * → se tratan con gracia (no se generan wrappers vacíos visibles).
 *
 * iconColor (col 9) es un campo SIN elemento visible propio (como iconAlt/imageAlt/ctaText):
 * se consume para decidir el color de la caja de icono (teal por defecto, yellow opcional)
 * y se elimina con la fila. Se edita desde el property sheet del panel (lo cubre la
 * instrumentación de item moveInstrumentation row → panel); no necesita data-aue-prop visible.
 *
 * ⚠️ TODO: La heurística de config (regex sobre el texto de una celda única) es robusta
 * para los valores actuales, pero si en el futuro un panel tuviese una única celda con
 * exactamente ese texto podría confundirse. Revisar si el modelo cambia.
 *
 * El alternado imagen↔texto se resuelve POR CSS (order/grid) según la clase de layout;
 * el JS NO reordena el DOM.
 *
 * @param {Element} block - Root element of the block
 */
export default function decorate(block) {
  const LAYOUTS = ['media-content', 'content-media', 'equal'];
  const LAYOUT_RE = /^(media-content|content-media|equal)$/i;

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

  // 3. CONSTRUCCIÓN DE PANELES — se MUEVEN los nodos autorados, no se reconstruyen.
  panelRows.forEach((row) => {
    const cells = [...row.children];

    const cellAt = (i) => cells[i] || null;
    const pictureAt = (i) => (cellAt(i) ? cellAt(i).querySelector('picture') : null);
    const textAt = (i) => (cellAt(i) ? cellAt(i).textContent.trim() : '');

    const iconPicture = pictureAt(0);
    const iconAlt = textAt(1);
    const imagePicture = pictureAt(2);
    const imageAlt = textAt(3);
    const eyebrowText = textAt(4);
    const titleSrc = cellAt(5) ? cellAt(5).querySelector('h1, h2, h3, h4, h5, h6, p') : null;
    const bodyCell = cellAt(6);
    const hasBody = bodyCell && bodyCell.textContent.trim() !== '';
    const ctaTextEl = cellAt(7) ? cellAt(7).querySelector('p') : null;
    const ctaLinkEl = cellAt(8) ? cellAt(8).querySelector('a') : null;
    // Color del icono por panel: "yellow" activa el modificador; "teal"/vacío = default CSS.
    const iconColor = textAt(9).toLowerCase();

    const panel = document.createElement('div');
    panel.className = 'feature-columns-panel';
    if (iconColor === 'yellow') panel.classList.add('feature-columns-panel-icon-yellow');
    // UE: transferir el resource del item (fila original) al panel nuevo ANTES de eliminar la fila.
    moveInstrumentation(row, panel);

    // --- MEDIA (panel con imagen) ---
    if (imagePicture) {
      panel.classList.add('feature-columns-panel-media');
      const media = document.createElement('div');
      media.className = 'feature-columns-media';
      const img = imagePicture.querySelector('img');
      if (img) {
        // El LCP es el hero → todas las imágenes de panel son lazy.
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        if (imageAlt && !img.getAttribute('alt')) img.setAttribute('alt', imageAlt);
      }
      media.append(imagePicture); // mueve el <picture> existente
      // UE: transferir el campo image (data-aue-* de la celda) al <picture> superviviente.
      if (cellAt(2)) moveInstrumentation(cellAt(2), imagePicture);
      panel.append(media);
    } else {
      panel.classList.add('feature-columns-panel-content');
    }

    // --- CONTENIDO (icono, eyebrow, título, body, CTA) ---
    const hasContent = iconPicture || eyebrowText || (titleSrc && titleSrc.textContent.trim())
      || hasBody || (ctaLinkEl && ctaLinkEl.getAttribute('href'));

    if (hasContent) {
      const content = document.createElement('div');
      content.className = 'feature-columns-content';

      // Caja de icono (fondo de acento). El color lo decide el campo iconColor del panel
      // (col 9): teal por defecto, yellow vía la clase feature-columns-panel-icon-yellow
      // aplicada al panel más arriba.
      if (iconPicture) {
        const iconBox = document.createElement('div');
        iconBox.className = 'feature-columns-icon';
        const iconImg = iconPicture.querySelector('img');
        if (iconImg) {
          iconImg.setAttribute('loading', 'lazy');
          iconImg.setAttribute('decoding', 'async');
          // Icono decorativo: alt desde iconAlt o vacío.
          iconImg.setAttribute('alt', iconAlt || '');
        }
        iconBox.append(iconPicture); // mueve el <picture> existente
        // UE: transferir el campo icon (data-aue-* de la celda) al <picture> superviviente.
        if (cellAt(0)) moveInstrumentation(cellAt(0), iconPicture);
        content.append(iconBox);
      }

      // Eyebrow
      if (eyebrowText) {
        const eyebrowEl = cellAt(4).querySelector('p') || document.createElement('p');
        eyebrowEl.classList.add('feature-columns-eyebrow');
        if (!eyebrowEl.textContent.trim()) eyebrowEl.textContent = eyebrowText;
        // UE: transferir el campo eyebrow al <p> (incluido el caso de <p> creado nuevo).
        if (cellAt(4)) moveInstrumentation(cellAt(4), eyebrowEl);
        content.append(eyebrowEl); // mueve el <p> existente (o uno nuevo si no existía)
      }

      // Título → siempre <h2> (subsección bajo el <h1> del hero).
      if (titleSrc && titleSrc.textContent.trim()) {
        let titleEl;
        if (titleSrc.tagName.toLowerCase() === 'h2') {
          titleEl = titleSrc;
        } else {
          // Reetiquetar moviendo los hijos (sin replaceWith sobre el nodo original).
          titleEl = document.createElement('h2');
          while (titleSrc.firstChild) titleEl.append(titleSrc.firstChild);
        }
        titleEl.classList.add('feature-columns-title');
        // UE: transferir el campo title al <h2> superviviente.
        if (cellAt(5)) moveInstrumentation(cellAt(5), titleEl);
        content.append(titleEl);
      }

      // Body richtext (<p> y/o <ul>) — se mueven los nodos existentes.
      if (hasBody) {
        const body = document.createElement('div');
        body.className = 'feature-columns-body';
        while (bodyCell.firstChild) body.append(bodyCell.firstChild);
        body.querySelectorAll('ul').forEach((ul) => ul.classList.add('feature-columns-list'));
        // UE: transferir el campo text (richtext) al contenedor body.
        moveInstrumentation(bodyCell, body);
        content.append(body);
      }

      // CTA → <a class="feature-columns-cta button"> (texto = ctaText o el del enlace).
      if (ctaLinkEl && ctaLinkEl.getAttribute('href')) {
        const ctaText = (ctaTextEl && ctaTextEl.textContent.trim())
          || ctaLinkEl.textContent.trim();
        if (ctaText) ctaLinkEl.textContent = ctaText;
        ctaLinkEl.classList.add('feature-columns-cta', 'button');
        // UE: transferir el campo ctaLink al <a> superviviente.
        if (cellAt(8)) moveInstrumentation(cellAt(8), ctaLinkEl);
        content.append(ctaLinkEl); // mueve el <a> existente
      }

      panel.append(content);
    }

    block.append(panel); // inserta el panel decorado
    row.remove(); // elimina la fila original ya vaciada
  });

  // UE (xwalk): restaurar el filtro tras mover el DOM para que reaparezca el botón
  // "+ Añadir panel". El data-aue-resource del bloque lo inyecta AEM (no se inventa).
  if (block.dataset.aueResource) {
    block.dataset.aueFilter = 'feature-columns';
  }
}
