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
 * DOM de ENTRADA (matriz EDS que recibe decorate) — 2 celdas por slide (límite
 * xwalk max-cells = 4). El contenido textual viaja AGRUPADO en una sola celda
 * (element grouping "content") con field-collapse para título y CTA:
 *   block.hero
 *     ├── div (FILA DE CONFIG — OPCIONAL; SIN <picture>, 3 celdas)
 *     │     ├── div → <p> autoplay ("true"|"false")
 *     │     ├── div → <p> interval ("5000" ms)
 *     │     └── div → <p> loop ("true"|"false")
 *     ├── div (FILA SLIDE 1)
 *     │     ├── div (celda 0) → <picture>  imagen (+imageAlt; LCP en slide 1)
 *     │     └── div (celda 1) → grupo "content": <p>eyebrow, <hN>título,
 *     │                          <p> body, <p><a> CTA (cualquiera opcional)
 *     └── div (FILA SLIDE N) … misma estructura de 2 celdas
 *
 * Distinción config vs slide: la fila de CONFIG es la única SIN <picture> con 3
 * celdas (autoplay/interval/loop). El resto son slides (incluido un slide nuevo
 * aún sin imagen). La fila de config es opcional.
 *
 * La celda "content" ya llega como HTML semántico apilado (gracias a element grouping
 * + field collapse del modelo), así que NO se lee por posición de campo: se localizan
 * los nodos por tipo (heading = título; <p> previo = eyebrow; <a> = CTA) y se decoran
 * in situ reutilizando la propia celda (preserva instrumentación de UE).
 *
 * Defaults del carrusel (no provienen de Figma): autoplay=false, interval=5000ms, loop=true.
 *
 * @param {Element} block - Root element of the block
 */
export default function decorate(block) {
  const rows = [...block.children];

  // 1. CLASIFICACIÓN — la fila de CONFIG es la única SIN <picture> con 3 celdas
  //    (autoplay/interval/loop). El resto son slides (incluido un slide nuevo aún
  //    sin imagen, que tendrá 2 celdas vacías).
  const configRow = rows.find(
    (row) => row.children.length >= 3 && !row.querySelector('picture'),
  ) || null;
  // Excluir filas sin contenido real (sin <picture> NI texto): evita slides en blanco
  // que aparecen cuando quedan ítems hero-slide vacíos en el CMS (p. ej. intentos
  // anteriores de añadir slides con el modelo antiguo roto).
  const slideRows = rows
    .filter((row) => row !== configRow)
    .filter((row) => row.querySelector('picture') || row.textContent.trim());

  // Sin slides con contenido: no hay nada que decorar, dejar el DOM intacto.
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

  // 4. CONSTRUCCIÓN DE SLIDES — 2 celdas por slide: [0] imagen (+imageAlt) y
  //    [1] grupo "content" (eyebrow/título/body/CTA ya apilados). Se DECORA in situ
  //    reutilizando la celda del grupo (preserva la instrumentación de cada campo).
  slideRows.forEach((row, index) => {
    const cells = [...row.children];
    const imageCell = cells[0] || null;
    const contentCell = cells[1] || null;
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

    // --- celda 0: imagen (<picture> ya entregado por EDS) ---
    const media = document.createElement('div');
    media.className = 'hero-media';
    const picture = imageCell ? imageCell.querySelector('picture') : null;
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
      }
      media.append(picture);
      // UE: transferir el campo image (data-aue-* de la celda) al <picture> superviviente.
      if (imageCell) moveInstrumentation(imageCell, picture);
    }

    // --- celda 1: grupo "content" → se reutiliza la celda y se decora in situ. ---
    const content = contentCell || document.createElement('div');
    content.classList.add('hero-content');

    // Título = heading del grupo (<hN>). Eyebrow = el/los <p> previos al heading.
    const titleEl = content.querySelector('h1, h2, h3, h4, h5, h6');
    if (titleEl) {
      titleEl.classList.add('hero-title');
      let prev = titleEl.previousElementSibling;
      while (prev) {
        if (prev.matches('p')) prev.classList.add('hero-eyebrow');
        prev = prev.previousElementSibling;
      }
    }

    // CTA → botón naranja con flecha. El grupo lo entrega como <p><a>; se localiza el
    // último <p> que envuelve únicamente un <a> y se desenvuelve para alinearlo en el flex.
    const ctaWrap = [...content.querySelectorAll(':scope > p')].reverse().find(
      (p) => p.children.length === 1
        && p.firstElementChild.tagName === 'A'
        && p.textContent.trim() === p.firstElementChild.textContent.trim(),
    );
    if (ctaWrap) {
      const ctaLink = ctaWrap.firstElementChild;
      ctaLink.classList.add('hero-cta', 'button');
      const icon = document.createElement('span');
      icon.className = 'hero-cta-icon';
      icon.setAttribute('aria-hidden', 'true');
      ctaLink.append(icon);
      content.insertBefore(ctaLink, ctaWrap);
      ctaWrap.remove();
    }

    slide.append(media);
    // Solo se añade el contenido si tiene algo que mostrar (evita wrappers vacíos).
    if (content.children.length > 0) slide.append(content);
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

  // UE (xwalk): restaurar el filtro tras mover el DOM para que reaparezca el botón
  // "+ Añadir slide". Los slides ya llevan su propio resource (moveInstrumentation
  // item-level), así que NO se duplica el resource del bloque en la pista: hacerlo
  // creaba un segundo nodo "Hero" y sacaba el slide fuera del árbol en el editor.
  if (block.dataset.aueResource) {
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
