import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Hero Block — AEM Edge Delivery Services
 *
 * Carrusel real multi-imagen (patrón container + items). Cada item es un SLIDE
 * COMPLETO: imagen + eyebrow + título + body + CTA.
 *
 * Figma reference: Bankinter Luxembourg — desktop 1:283 / mobile 1:58
 * Model: xwalk (EDS + Universal Editor)
 * UE instrumentation: ✅ Completado (Fase 3 - UE & QA Specialist)
 *   - Item-level: moveInstrumentation(row → .hero-slide) preserva el resource del slide.
 *   - Field-level: moveInstrumentation(cell → elemento) transfiere los data-aue-* inyectados
 *     por AEM (no se inventan props ni resources). imageAlt/ctaText se editan en el panel.
 *   - Contenedor: data-aue-filter="hero" restaurado para el botón "+ Añadir slide".
 *
 * DOM de ENTRADA (matriz EDS que recibe decorate):
 *   block.hero
 *     ├── div (FILA DE CONFIG — OPCIONAL; SIN <picture>)
 *     │     ├── div → <p> autoplay ("true"|"false")
 *     │     ├── div → <p> interval ("5000" ms)
 *     │     └── div → <p> loop ("true"|"false")
 *     ├── div (FILA SLIDE 1 — contiene <picture>)
 *     │     ├── div (col 0) → <picture>     imagen del slide (LCP en slide 1)
 *     │     ├── div (col 1) → <p>           imageAlt
 *     │     ├── div (col 2) → <p>           eyebrow
 *     │     ├── div (col 3) → <h1>|<p>      título
 *     │     ├── div (col 4) → richtext      body (<p>/<strong>)
 *     │     ├── div (col 5) → <p>           ctaText
 *     │     └── div (col 6) → <p><a href>   ctaLink
 *     └── div (FILA SLIDE N) … misma estructura de 7 celdas
 *
 * Distinción config vs slide: una fila es SLIDE solo si contiene <picture>.
 * La fila de config (celdas de texto sueltas, sin <picture>) es opcional.
 *
 * Defaults del carrusel (no provienen de Figma): autoplay=false, interval=5000ms, loop=true.
 *
 * @param {Element} block - Root element of the block
 */
export default function decorate(block) {
  const rows = [...block.children];

  // 1. CLASIFICACIÓN — una fila es SLIDE solo si contiene <picture>.
  const slideRows = rows.filter((row) => row.querySelector('picture'));
  const configRow = rows.find((row) => !row.querySelector('picture')) || null;

  // Sin slides: no hay nada que decorar, dejar el DOM intacto.
  if (slideRows.length === 0) return;

  // 2. CONFIG DE BLOQUE (defaults aplicados si faltan celdas).
  const parseBool = (value, fallback) => {
    if (value == null || value.trim() === '') return fallback;
    return /^(true|yes|on|1)$/i.test(value.trim());
  };

  let autoplay = false;
  let interval = 5000;
  let loop = true;

  if (configRow) {
    const cfg = [...configRow.children];
    autoplay = parseBool(cfg[0] && cfg[0].textContent, autoplay);
    const parsedInterval = parseInt(cfg[1] && cfg[1].textContent, 10);
    if (!Number.isNaN(parsedInterval) && parsedInterval > 0) interval = parsedInterval;
    loop = parseBool(cfg[2] && cfg[2].textContent, loop);
  }

  const total = slideRows.length;
  const hasControls = total > 1;

  // 3. ESQUELETO DEL CARRUSEL (UI nueva).
  const carousel = document.createElement('div');
  carousel.className = 'hero-carousel';

  const track = document.createElement('div');
  track.className = 'hero-track';
  track.setAttribute('aria-live', 'polite');
  track.setAttribute('aria-atomic', 'false');
  carousel.append(track);

  // 4. CONSTRUCCIÓN DE SLIDES — se MUEVEN los nodos autorados, no se reconstruyen.
  slideRows.forEach((row, index) => {
    const cells = [...row.children];
    const isFirst = index === 0;

    const slide = document.createElement('div');
    slide.className = 'hero-slide';
    // UE: transferir el resource del item (fila original) al slide nuevo ANTES de eliminar la fila.
    moveInstrumentation(row, slide);
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'diapositiva');
    slide.setAttribute('aria-label', `${index + 1} de ${total}`);
    slide.setAttribute('aria-hidden', isFirst ? 'false' : 'true');
    if (isFirst) slide.classList.add('is-active');

    const media = document.createElement('div');
    media.className = 'hero-media';

    const content = document.createElement('div');
    content.className = 'hero-content';

    // --- col 0: imagen (<picture> ya entregado por EDS) ---
    const picture = cells[0] ? cells[0].querySelector('picture') : null;
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        img.classList.add('hero-image');
        if (isFirst) {
          // Imagen LCP del slide 1 (above-the-fold).
          img.setAttribute('loading', 'eager');
          img.setAttribute('fetchpriority', 'high');
        } else {
          img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
        }
        // --- col 1: imageAlt (solo si la imagen no trae alt) ---
        const altText = cells[1] ? cells[1].textContent.trim() : '';
        if (altText && !img.getAttribute('alt')) img.setAttribute('alt', altText);
        // ⚠️ TODO: width/height no extraídos de Figma; EDS suele incluirlos en <img>.
      }
      media.append(picture);
      // UE: transferir el campo image (data-aue-* de la celda) al <picture> superviviente.
      moveInstrumentation(cells[0], picture);
    }

    // --- col 2: eyebrow ---
    const eyebrow = cells[2] ? cells[2].querySelector('p') : null;
    if (eyebrow && eyebrow.textContent.trim()) {
      eyebrow.classList.add('hero-eyebrow');
      moveInstrumentation(cells[2], eyebrow);
      content.append(eyebrow);
    }

    // --- col 3: título (un único <h1> por página → slide 1; resto <p>) ---
    const titleSrc = cells[3]
      ? cells[3].querySelector('h1, h2, h3, h4, h5, h6, p')
      : null;
    if (titleSrc && titleSrc.textContent.trim()) {
      const desiredTag = isFirst ? 'h1' : 'p';
      let titleEl;
      if (titleSrc.tagName.toLowerCase() === desiredTag) {
        titleSrc.classList.add('hero-title');
        titleEl = titleSrc;
      } else {
        // Reetiquetar moviendo los hijos (no se usa replaceWith sobre nodo original).
        titleEl = document.createElement(desiredTag);
        titleEl.className = 'hero-title';
        while (titleSrc.firstChild) titleEl.append(titleSrc.firstChild);
      }
      moveInstrumentation(cells[3], titleEl);
      content.append(titleEl);
    }

    // --- col 4: body richtext (uno o varios <p>) ---
    const bodyCell = cells[4];
    if (bodyCell && bodyCell.textContent.trim()) {
      const body = document.createElement('div');
      body.className = 'hero-body';
      while (bodyCell.firstChild) body.append(bodyCell.firstChild);
      moveInstrumentation(bodyCell, body);
      content.append(body);
    }

    // --- col 5 + col 6: CTA (texto + enlace) ---
    const ctaTextEl = cells[5] ? cells[5].querySelector('p') : null;
    const ctaLinkEl = cells[6] ? cells[6].querySelector('a') : null;
    const ctaText = (ctaTextEl && ctaTextEl.textContent.trim())
      || (ctaLinkEl && ctaLinkEl.textContent.trim())
      || '';
    if (ctaLinkEl && (ctaText || ctaLinkEl.getAttribute('href'))) {
      if (ctaText) ctaLinkEl.textContent = ctaText;
      ctaLinkEl.classList.add('hero-cta', 'button');
      if (cells[6]) moveInstrumentation(cells[6], ctaLinkEl);
      const icon = document.createElement('span');
      icon.className = 'hero-cta-icon';
      icon.setAttribute('aria-hidden', 'true');
      ctaLinkEl.append(icon);
      content.append(ctaLinkEl);
    }

    slide.append(media, content);
    track.append(slide);
  });

  const slides = [...track.children];
  let dotEls = [];
  let current = 0;

  // Navegación central (definida antes de los listeners que la usan).
  function goTo(index) {
    const count = slides.length;
    if (count <= 1) return;
    let target = index;
    if (loop) target = ((index % count) + count) % count;
    else target = Math.max(0, Math.min(index, count - 1));
    if (target === current) return;

    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    if (dotEls[current]) {
      dotEls[current].classList.remove('is-active');
      dotEls[current].setAttribute('aria-selected', 'false');
    }

    current = target;

    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    if (dotEls[current]) {
      dotEls[current].classList.add('is-active');
      dotEls[current].setAttribute('aria-selected', 'true');
    }

    track.style.transform = `translateX(-${current * 100}%)`;
  }

  // Autoplay opcional — pausa en hover/focus/pestaña oculta; respeta reduced-motion.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAutoplay() {
    if (!autoplay || reduceMotion || slides.length <= 1) return;
    stopAutoplay();
    timer = setInterval(() => goTo(current + 1), interval);
  }

  // 5. CONTROLES Y DOTS (UI nueva; solo si hay más de un slide).
  if (hasControls) {
    const controls = document.createElement('div');
    controls.className = 'hero-controls';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'hero-prev';
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Imagen anterior');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'hero-next';
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Imagen siguiente');

    controls.append(prevBtn, nextBtn);

    const dots = document.createElement('div');
    dots.className = 'hero-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Seleccionar diapositiva');

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot';
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`);
      if (index === 0) dot.classList.add('is-active');
      dots.append(dot);
    });

    carousel.append(controls, dots);
    dotEls = [...dots.children];

    // Eventos de navegación.
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    dots.addEventListener('click', (event) => {
      const dot = event.target.closest('.hero-dot');
      if (!dot) return;
      const index = dotEls.indexOf(dot);
      if (index >= 0) goTo(index);
    });
  }

  // 6. INSERTAR ESTRUCTURA Y LIMPIAR FILAS ORIGINALES (sin innerHTML/replaceChildren).
  rows.forEach((row) => row.remove());
  block.append(carousel);

  // UE (xwalk): en autoría, asociar la pista de slides con el resource del bloque y
  // restaurar el filtro para que reaparezca el botón "+ Añadir slide" tras mover el DOM.
  if (block.dataset.aueResource) {
    track.dataset.aueResource = block.dataset.aueResource;
    block.dataset.aueFilter = 'hero';
  }

  // 7. ATRIBUTOS ARIA DEL BLOQUE.
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carrusel');
  if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'Destacados');
  if (autoplay) block.classList.add('hero--autoplay');

  // 8. TECLADO: ←/→ prev/next, Home/End extremos.
  carousel.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goTo(current - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        goTo(current + 1);
        break;
      case 'Home':
        event.preventDefault();
        goTo(0);
        break;
      case 'End':
        event.preventDefault();
        goTo(slides.length - 1);
        break;
      default:
        break;
    }
  });

  // 9. ACTIVAR AUTOPLAY (si procede).
  if (autoplay && !reduceMotion && slides.length > 1) {
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });
    startAutoplay();
  }
}
