import { CSS_CLASS_PRIMARY_BUTTON, CSS_CLASS_SECONDARY_BUTTON } from '../constants/index.js';

/**
 * Marca (o desmarca) como activos todos los botones de un canal, estén en el
 * modal, en el offcanvas o en visión única.
 *
 * @param {string} canal Id del canal.
 * @param {boolean} esActivo
 * @returns {void}
 */
export function ajustarClaseBotonCanal(canal, esActivo) {
    let buttons = document.querySelectorAll(`button[data-canal="${canal}"]`);
    buttons.forEach((boton) => {
        esActivo
            ? boton.classList.replace(CSS_CLASS_SECONDARY_BUTTON, CSS_CLASS_PRIMARY_BUTTON)
            : boton.classList.replace(CSS_CLASS_PRIMARY_BUTTON, CSS_CLASS_SECONDARY_BUTTON);
    });
}
