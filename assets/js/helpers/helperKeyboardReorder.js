/**
 * Reordenación de canales por teclado.
 *
 * El arrastre con Sortable.js solo entiende puntero: con teclado no había forma
 * de mover un canal de sitio, aunque el botón "Mover" sí recibiera foco. Este
 * helper le añade flechas al mismo botón, así que el gesto accesible y el gesto
 * con ratón comparten control y el usuario no tiene que descubrir dos mecanismos.
 *
 * @module helperKeyboardReorder
 */

import { saveActiveChannelsToStorage } from './index.js';

/** Flecha -> desplazamiento respecto al canal actual. */
/** @type {Record<string, -1|1>} */
const KEY_TO_OFFSET = {
    ArrowLeft: -1,
    ArrowUp: -1,
    ArrowRight: 1,
    ArrowDown: 1,
};

/**
 * Mueve el canal una posición en la dirección indicada.
 * @param {HTMLElement} tile Div del canal (`div[data-canal]`).
 * @param {-1|1} offset
 * @returns {boolean} false si ya estaba en el extremo (nada que mover).
 */
function moveTile(tile, offset) {
    const container = tile.parentElement;
    if (!container) return false;
    const sibling = offset < 0 ? tile.previousElementSibling : tile.nextElementSibling;
    if (!sibling || !sibling.matches('div[data-canal]')) return false;

    if (offset < 0) {
        container.insertBefore(tile, sibling);
    } else {
        container.insertBefore(sibling, tile);
    }
    return true;
}

/**
 * Activa las flechas sobre el botón de mover de un canal.
 *
 * Solo persiste cuando el canal vive en la cuadrícula: en visión única hay un
 * único canal visible, así que no hay orden que guardar.
 *
 * @param {HTMLElement} moveButton Botón "Mover" del overlay del canal.
 * @returns {void}
 */
export function enableKeyboardReorder(moveButton) {
    moveButton.addEventListener('keydown', (event) => {
        const offset = KEY_TO_OFFSET[event.key];
        if (!offset || event.altKey || event.ctrlKey || event.metaKey) return;

        const tile = /** @type {HTMLElement|null} */ (moveButton.closest('div[data-canal]'));
        if (!tile) return;

        // Las flechas dentro de la cuadrícula significan "mover", no "desplazar la
        // página": si hay algo que mover, nos quedamos el evento.
        if (!moveTile(tile, offset)) return;
        event.preventDefault();

        // insertBefore reinserta el nodo: el foco se pierde salvo que lo repongamos,
        // y sin foco no se pueden encadenar varios movimientos con la misma tecla.
        moveButton.focus();

        if (tile.parentElement?.id === 'container-vision-cuadricula') {
            saveActiveChannelsToStorage();
        }
    });
}
