/**
 * Diálogo de confirmación con varias salidas, montado sobre un modal de Bootstrap.
 *
 * Se construye en el momento y se destruye al cerrarse, así el index.html no
 * acumula markup de modales que casi nunca se ven. Devuelve el id de la acción
 * elegida (o null si el usuario cierra/cancela), de modo que quien llama decide
 * qué hacer en vez de tener solo un sí/no.
 *
 * @module helperConfirmDialog
 */

import { t } from '../i18n.js';

/**
 * @typedef {Object} ConfirmAction
 * @property {string} id Valor con el que resuelve la promesa si se elige.
 * @property {string} label Texto del botón.
 * @property {string} [variant] Clase de color de Bootstrap (por defecto `btn-indigo`).
 */

/**
 * Muestra el diálogo y espera a que el usuario elija.
 *
 * @param {Object} options
 * @param {string} options.title Título del diálogo.
 * @param {string} options.body Texto explicativo (HTML permitido: lo compone el propio sitio).
 * @param {ConfirmAction[]} options.actions Acciones ofrecidas, en orden de aparición.
 * @param {string} [options.cancelLabel] Texto del botón de descarte.
 * @returns {Promise<string|null>} id de la acción elegida, o null si se descartó.
 */
export function showConfirmDialog({ title, body, actions, cancelLabel = t('cancel') }) {
    return new Promise((resolve) => {
        const modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.tabIndex = -1;
        modalElement.setAttribute('aria-labelledby', 'confirm-dialog-title');
        modalElement.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title fs-5" id="confirm-dialog-title">${title}</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${cancelLabel}"></button>
                    </div>
                    <div class="modal-body">${body}</div>
                    <div class="modal-footer flex-wrap gap-2">
                        <button type="button" class="btn btn-light-subtle rounded-pill" data-bs-dismiss="modal">${cancelLabel}</button>
                    </div>
                </div>
            </div>`;

        const footer = modalElement.querySelector('.modal-footer');
        let chosen = null;

        for (const action of actions) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `btn ${action.variant ?? 'btn-indigo'} rounded-pill`;
            button.textContent = action.label;
            button.addEventListener('click', () => {
                chosen = action.id;
                modal.hide();
            });
            footer.append(button);
        }

        document.body.append(modalElement);
        const modal = new bootstrap.Modal(modalElement);

        // 'hidden' (no 'hide') para no resolver hasta que termine la animación:
        // así el foco vuelve al disparador antes de que actuemos sobre el DOM.
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
            resolve(chosen);
        });

        modal.show();
    });
}
