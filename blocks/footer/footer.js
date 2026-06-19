import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Footer Block — AEM Edge Delivery Services
 *
 * Figma reference: desktop 1:449 · mobile 1:232
 * Model: xwalk (EDS + Universal Editor)
 * UE instrumentation: Pendiente (Fase 3 - UE & QA Specialist)
 *
 * Excepción documentada del boilerplate (igual que header.js):
 *  - decorate() es ASÍNCRONA porque carga el fragmento /footer con await loadFragment().
 *  - block.textContent = '' es el MONTAJE del fragmento, NO destrucción de contenido autoreado.
 *
 * DOM de entrada (secciones del fragmento /footer, por índice):
 *   footer (div del fragmento)
 *     └── div [0] → brand: logo-luxemburgo.svg
 *     └── div [1] → idiomas: <ul><li><a> (English / Español / Português)
 *     └── div [2] → enlaces corporativos: <ul><li><a>
 *     └── div [3] → copyright: <p>
 *
 * ⚠️ TODO: el orden e incluso la existencia de cada sección dependen del contenido autoreado
 * del fragmento /footer (no verificable sin dev server activo). La asignación de clases es
 * defensiva: solo se aplica cuando el hijo existe.
 *
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM (montaje del fragmento — NO destrucción de contenido autoreado)
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Decoración ligera (sin listeners): clases semánticas a las secciones por índice,
  // siguiendo el patrón de header.js (nav-brand / nav-sections / nav-tools).
  const [brand, langs, links, copyright] = [...footer.children];

  if (brand) brand.classList.add('footer-brand');

  if (langs) {
    langs.classList.add('footer-langs');
    langs.setAttribute('role', 'navigation');
    langs.setAttribute('aria-label', 'Idioma');
  }

  if (links) {
    links.classList.add('footer-links');
    links.setAttribute('role', 'navigation');
    links.setAttribute('aria-label', 'Enlaces legales');
  }

  if (copyright) copyright.classList.add('footer-copyright');

  block.append(footer);

  // Full-bleed de la franja de copyright: se mueve a hijo directo del bloque (fuera del
  // contenedor centrado .footer > div) para que su fondo ocupe el ancho completo mientras
  // el resto del footer queda limitado a max-width. Es un movimiento de nodo existente, no
  // una reconstrucción.
  if (copyright) block.append(copyright);
}
