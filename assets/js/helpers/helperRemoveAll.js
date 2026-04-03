import { AUDIO_TV_SHUTDOWN } from "../constants/index.js";
import { tele } from "../main.js";
import { playAudioSinDelay, mostrarToast } from "../helpers/index.js";
import { buildErrorToastMessage, t } from '../i18n.js';

export function removeAllActiveChannels() {
    try {
        playAudioSinDelay(AUDIO_TV_SHUTDOWN)

        document.querySelectorAll('div[data-canal]').forEach(canalActivo => {
            const CANAL_A_REMOVER = canalActivo.dataset.canal;
            if (CANAL_A_REMOVER) {
                tele.remove(CANAL_A_REMOVER);
            }
        });
    } catch (error) {
        console.error(`Error al intentar quitar todos los canales. Error: ${error}`);
        mostrarToast(buildErrorToastMessage(t('errorRemoveAllChannels'), error), 'danger', false);
        return
    }
}