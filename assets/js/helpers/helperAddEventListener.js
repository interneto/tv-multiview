/**
 * Conecta un botón de ordenación con la función que reordena un contenedor.
 *
 * @param {string} buttonId Id del botón (sin `#`).
 * @param {string} containerId Id del contenedor que se pasa a `sortFunction`.
 * @param {(containerId: string) => void} sortFunction Reordenador a ejecutar en cada clic.
 * @returns {void}
 */
export function addSortEventListener(buttonId, containerId, sortFunction) {
    const BOTON_AÑADIR_EVENTO = document.querySelector(`#${buttonId}`);
    BOTON_AÑADIR_EVENTO.addEventListener('click', () => sortFunction(containerId));
}
