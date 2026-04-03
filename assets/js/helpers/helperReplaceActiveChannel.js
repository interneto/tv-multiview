import { createChannelFragment } from "../channelUI.js";
import { tele } from "../main.js";
import { mostrarToast, ajustarClaseBotonCanal, saveActiveChannelsToStorage } from "./index.js";
import { buildErrorToastMessage, t } from '../i18n.js';

export function reemplazarCanalActivo(canalIdBotonPulsadoEnModal, canalIdExistente) {
    try {
        let divPadreACambiar = document.querySelector(`div[data-canal="${canalIdExistente}"]`)
        if (divPadreACambiar) {
            let divExistenteACambiar = document.querySelector(`div[data-canal-cambio="${canalIdExistente}"]`)
            let barraOverlayDeCanalACambiar = document.querySelector(`#overlay-de-canal-${canalIdExistente}`)
            // evitar duplicados si canal que va a quedar de reemplazo ya existe en grid
            if (document.querySelector(`div[data-canal="${canalIdBotonPulsadoEnModal}"]`) && divPadreACambiar !== document.querySelector(`div[data-canal="${canalIdBotonPulsadoEnModal}"]`)) {
                tele.remove(canalIdBotonPulsadoEnModal);
            }

            divExistenteACambiar.remove();
            barraOverlayDeCanalACambiar.remove();

            divPadreACambiar.append(createChannelFragment(canalIdBotonPulsadoEnModal));
            divPadreACambiar.setAttribute('data-canal', canalIdBotonPulsadoEnModal); // deja atributo con el canal que se deja activo tras cambio
            ajustarClaseBotonCanal(canalIdExistente, false);
            ajustarClaseBotonCanal(canalIdBotonPulsadoEnModal, true);
            if (localStorage.getItem('diseño-seleccionado') !== 'vision-unica') saveActiveChannelsToStorage();
        }
    } catch (error) {
        console.error(`Error intentar cambiar canal con id: ${canalIdExistente} por canal: ${canalIdBotonPulsadoEnModal}. Error: ${error}`);
        mostrarToast(buildErrorToastMessage(t('errorReplaceChannel', { oldChannel: canalIdExistente, newChannel: canalIdBotonPulsadoEnModal }), error), 'danger')
        return
    }
}