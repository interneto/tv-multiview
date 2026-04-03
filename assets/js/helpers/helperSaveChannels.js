import { listChannels } from "../channelsData.js";
import { CONTAINER_VISION_CUADRICULA } from "../main.js";
import { mostrarToast } from "../helpers/index.js";
import { buildErrorToastMessage, t } from '../i18n.js';

export function saveActiveChannelsToStorage() {
    try {
        const CANALES_ACTIVOS_EN_DOM = CONTAINER_VISION_CUADRICULA.querySelectorAll('div[data-canal]');
        localStorage.removeItem('canales-vision-cuadricula');
        let lsCanales = JSON.parse(localStorage.getItem('canales-vision-cuadricula')) || {};
        CANALES_ACTIVOS_EN_DOM.forEach(divCanal => {
            lsCanales[divCanal.dataset.canal] = listChannels[divCanal.dataset.canal].name;
        });
        localStorage.setItem('canales-vision-cuadricula', JSON.stringify(lsCanales));

        document.querySelector('#alerta-guardado-canales').classList.remove('d-none');
        setTimeout(() => {
            document.querySelector('#alerta-guardado-canales').classList.add('d-none');
        }, 420);
    } catch (error) {
        console.error('Error al intentar guardar canales en el almacenamiento local: ', error);
        mostrarToast(buildErrorToastMessage(t('errorSaveChannels'), error), 'danger', false)
        return
    }
}