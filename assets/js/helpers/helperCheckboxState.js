import { getVisibilityLabel } from '../i18n.js';

/**
 * Sincroniza un checkbox de ajustes con su etiqueta y su valor persistido.
 *
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} status Elemento donde se escribe "Visible"/"Oculto".
 * @param {string} item Clave de localStorage donde se guarda 'show'/'hide'.
 * @param {boolean} [visible=true] Estado a aplicar.
 * @returns {void}
 */
export function setCheckboxState(checkbox, status, item, visible = true) {
    checkbox.checked = visible;
    status.textContent = getVisibilityLabel(visible);
    localStorage.setItem(item, visible ? 'show' : 'hide');
}
