import { createChannelFragment } from "../channelUI.js";
import {
    CONTAINER_VISION_CUADRICULA,
    CONTAINER_VISION_UNICA,
    tele,
    INPUT_RANGE_PERSONALIZACION_TAMAÑO_VISION_CUADRICULA,
    SPAN_VALOR_INPUT_RANGE,
    BOTON_ACTIVAR_VISION_UNICA,
    BOTON_ACTIVAR_VISION_GRID,
    BOTONES_PERSONALIZAR_TRANSMISIONES_POR_FILA,
    SPAN_VALOR_TRANSMISIONES_POR_FILA,
    CHECKBOX_PERSONALIZAR_USO_100VH_CANALES,
    SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES
} from "../main.js";
import {
    actualizarValorSlider,
    mostrarToast,
    activarTooltipsBootstrap,
    ajustarClaseBotonCanal,
    obtenerNumeroCanalesFila,
    actualizarBotonesPersonalizarOverlay,
    hideTextoBotonesOverlay,
    adjustChannelColumnCount
} from "./index.js";
import { CSS_CLASS_PRIMARY_BUTTON, CSS_CLASS_SECONDARY_BUTTON } from "../constants/index.js";
import { listChannels } from "../channelsData.js";
import { buildErrorToastMessage, getDisabledLabel, getHeightLabel, t } from '../i18n.js';

export function activarVisionUnica() {
    try {
        localStorage.setItem('diseño-seleccionado', 'vision-unica');
        BOTON_ACTIVAR_VISION_UNICA.classList.replace('btn-light-subtle', 'btn-indigo');
        BOTON_ACTIVAR_VISION_GRID.classList.replace('btn-indigo', 'btn-light-subtle');

        document.querySelectorAll('#vision-unica-body-botones-canales button, #modal-cambiar-canal-body-botones-canales button').forEach(botonCanalEnDOM => {
            botonCanalEnDOM.classList.replace(CSS_CLASS_PRIMARY_BUTTON, CSS_CLASS_SECONDARY_BUTTON);
        });

        const CANALES_ACTIVOS_EN_DOM = CONTAINER_VISION_CUADRICULA.querySelectorAll('div[data-canal]');
    if (CANALES_ACTIVOS_EN_DOM.length > 0) {
            CANALES_ACTIVOS_EN_DOM.forEach(divCanal => {
                divCanal.innerHTML = ''; // limpia html en vez de remover para evitar activar observer
                divCanal.dataset.respaldo = divCanal.dataset.canal;
                divCanal.dataset.canal = `no-${divCanal.dataset.canal}`;
            });
        }

        CONTAINER_VISION_CUADRICULA.classList.add('d-none');
        CONTAINER_VISION_UNICA.classList.remove('d-none');
        document.querySelector('nav .btn-group').classList.add('d-none');
        document.querySelector('nav a.gradient-text').classList.remove('d-none');

        let divBotonesFlotantes = document.querySelector('#grupo-botones-flotantes');
        divBotonesFlotantes.querySelector('.btn-indigo').classList.add('d-none');
        divBotonesFlotantes.querySelector('div.bg-light-subtle').classList.add('d-none');
        divBotonesFlotantes.querySelector('.btn-dark').classList.replace('rounded-end-5', 'rounded-pill');

        actualizarBotonesPersonalizarOverlay();

        INPUT_RANGE_PERSONALIZACION_TAMAÑO_VISION_CUADRICULA.disabled = true;
        SPAN_VALOR_INPUT_RANGE.textContent = getDisabledLabel();

        CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.disabled = true;
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.textContent = getDisabledLabel();

        BOTONES_PERSONALIZAR_TRANSMISIONES_POR_FILA.forEach(boton => { boton.disabled = true });
        SPAN_VALOR_TRANSMISIONES_POR_FILA.innerHTML = getDisabledLabel();

        let lsCanales = JSON.parse(localStorage.getItem('canales-vision-cuadricula')) || {};

        if (CONTAINER_VIDEO_VISION_UNICA.querySelector('div[data-canal]')) tele.remove(CONTAINER_VIDEO_VISION_UNICA.querySelector('div[data-canal]').dataset.canal);

    if (Object.keys(lsCanales).length > 0) {
            try {
                if (listChannels[Object.keys(lsCanales)[0]]) {
                    tele.add(Object.keys(lsCanales)[0]);
                }
            } catch (error) {
                return console.error(`Error durante carga canales para modo vision unica. Error: ${error}`);
            }
        }

        document.querySelector('#boton-personalizar-boton-mover-overlay').classList.add('clase-vacia'); // esto es solo para mediaquery en css
    } catch (error) {
        console.error(`Error durante la activación del modo "Visión Única". Error: ${error}`);
        mostrarToast(buildErrorToastMessage(t('errorActivateSingleView'), error), 'danger', false)
        return
    }
}

export function desactivarVisionUnica() {
    try {
        localStorage.setItem('diseño-seleccionado', 'vision-cuadricula');
        BOTON_ACTIVAR_VISION_UNICA.classList.replace('btn-indigo', 'btn-light-subtle');
        BOTON_ACTIVAR_VISION_GRID.classList.replace('btn-light-subtle', 'btn-indigo');

        if (CONTAINER_VIDEO_VISION_UNICA.querySelector('div[data-canal]')) tele.remove(CONTAINER_VIDEO_VISION_UNICA.querySelector('div[data-canal]').dataset.canal);

        ICONO_SIN_SEÑAL_ACTIVA_VISION_UNICA.classList.remove('d-none');

        const CANALES_ACTIVOS_EN_DOM = CONTAINER_VISION_CUADRICULA.querySelectorAll('div[data-canal]');

        if (CANALES_ACTIVOS_EN_DOM.length > 0) {
            CANALES_ACTIVOS_EN_DOM.forEach(divCanal => {
                divCanal.dataset.canal = divCanal.dataset.respaldo;
                divCanal.append(createChannelFragment(divCanal.dataset.canal));
                ajustarClaseBotonCanal(divCanal.dataset.canal, true);
                activarTooltipsBootstrap();
                hideTextoBotonesOverlay();
                divCanal.removeAttribute('data-respaldo');
            });
        } else {
            tele.cargaCanalesPredeterminados();
        }

        CONTAINER_VISION_CUADRICULA.classList.remove('d-none');
        CONTAINER_VISION_UNICA.classList.add('d-none');
        document.querySelector('nav .btn-group').classList.remove('d-none');
        document.querySelector('nav a.gradient-text').classList.add('d-none');

        let divBotonesFlotantes = document.querySelector('#grupo-botones-flotantes');
        divBotonesFlotantes.querySelector('.btn-indigo').classList.remove('d-none');
        divBotonesFlotantes.querySelector('div.bg-light-subtle').classList.remove('d-none');
        divBotonesFlotantes.querySelector('.btn-dark').classList.replace('rounded-pill', 'rounded-end-5',);

        actualizarBotonesPersonalizarOverlay();

        INPUT_RANGE_PERSONALIZACION_TAMAÑO_VISION_CUADRICULA.disabled = false;
        actualizarValorSlider();

        CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.disabled = false;
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.textContent = getHeightLabel(localStorage.getItem('uso-100vh') === 'activo');

        BOTONES_PERSONALIZAR_TRANSMISIONES_POR_FILA.forEach(boton => { boton.disabled = false });
        SPAN_VALOR_TRANSMISIONES_POR_FILA.innerHTML = `${obtenerNumeroCanalesFila()}`;

        adjustChannelColumnCount();

        document.querySelector('#boton-personalizar-boton-mover-overlay').classList.remove('clase-vacia');
    } catch (error) {
        console.error(`Error durante la desactivación del modo "Visión Única". Error: ${error}`);
        mostrarToast(buildErrorToastMessage(t('errorDeactivateSingleView'), error), 'danger', false)
        return
    }
}