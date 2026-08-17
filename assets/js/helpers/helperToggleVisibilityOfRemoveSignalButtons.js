import {
    ACTIVE_CHANNEL_REMOVE_ALL_BUTTON,
    BUTTON_REMOVE_ACTIVE_CHANNEL,
    DEFAULT_CHANNEL_LOAD_BUTTON,
    BUTTON_LOAD_DEFAULT_CHANNELS,
} from '../buttons.js';

const hideRemoveAllSignalButtons = () => {
    ACTIVE_CHANNEL_REMOVE_ALL_BUTTON?.classList.add('d-none');
    BUTTON_REMOVE_ACTIVE_CHANNEL?.classList.add('d-none');

    DEFAULT_CHANNEL_LOAD_BUTTON?.classList.remove('d-none');
    BUTTON_LOAD_DEFAULT_CHANNELS?.classList.remove('d-none');
};

const displayRemoveAllSignalButtons = () => {
    ACTIVE_CHANNEL_REMOVE_ALL_BUTTON?.classList.remove('d-none');
    BUTTON_REMOVE_ACTIVE_CHANNEL?.classList.remove('d-none');

    DEFAULT_CHANNEL_LOAD_BUTTON?.classList.add('d-none');
    BUTTON_LOAD_DEFAULT_CHANNELS?.classList.add('d-none');
};

/**
 * Alterna entre "Quitar todos" y "Cargar predeterminados": solo tiene sentido
 * ofrecer uno de los dos según haya o no canales en pantalla.
 *
 * @returns {void}
 */
export const toggleVisibilityOfRemoveSignalButtons = () => {
    const canales = document.querySelectorAll('div[data-canal]');
    if (canales.length === 0) {
        hideRemoveAllSignalButtons();
    } else {
        displayRemoveAllSignalButtons();
    }
};
