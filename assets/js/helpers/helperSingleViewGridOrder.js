import { mostrarToast } from './index.js';
import { buildErrorToastMessage, t } from '../i18n.js';

export const CONTAINER_INTERNO_VISION_UNICA = document.querySelector('.vision-unica-grid');
const ID_EN_ORDEN_ORIGINAL = ['panel-canales-vision-unica', 'container-video-vision-unica'];

export function cargarOrdenVisionUnica() {
    try {
        const ordenGuardado = localStorage.getItem('orden-grid-vision-unica');
        let ordenAUsar = ID_EN_ORDEN_ORIGINAL;
        if (ordenGuardado) {
            try {
                const elementosOrdenados = JSON.parse(ordenGuardado);
                if (
                    Array.isArray(elementosOrdenados) &&
                    elementosOrdenados.length === ID_EN_ORDEN_ORIGINAL.length
                ) {
                    ordenAUsar = elementosOrdenados;
                }
            } catch (e) {
                console.error('Error al parsear orden-grid-vision-unica:', e);
                localStorage.removeItem('orden-grid-vision-unica');
            }
        }
        ordenAUsar.forEach((id) => {
            const elemento = document.getElementById(id);
            if (elemento) CONTAINER_INTERNO_VISION_UNICA.appendChild(elemento);
        });
        const esOrdenOriginal =
            JSON.stringify(ID_EN_ORDEN_ORIGINAL) === JSON.stringify(getOrdenActual());
        CONTAINER_INTERNO_VISION_UNICA.classList.toggle(
            'vision-unica-grid-reordenado',
            !esOrdenOriginal,
        );
    } catch (error) {
        console.error(
            `Error durante la carga orden paneles para modo "Visión Única". Error: ${error}`,
        );
        mostrarToast(buildErrorToastMessage(t('errorLoadSingleViewOrder'), error), 'danger', false);
        return;
    }
}

export function guardarOrdenPanelesVisionUnica() {
    let ordenActual = Array.from(CONTAINER_INTERNO_VISION_UNICA.children).map((item) => item.id);
    localStorage.setItem('orden-grid-vision-unica', JSON.stringify(ordenActual));
}

function getOrdenActual() {
    return Array.from(CONTAINER_INTERNO_VISION_UNICA.children).map((item) => item.id);
}
export function toggleClaseOrdenado() {
    const ordenActual = getOrdenActual();
    const esOrdenOriginal = JSON.stringify(ID_EN_ORDEN_ORIGINAL) === JSON.stringify(ordenActual);
    CONTAINER_INTERNO_VISION_UNICA.classList.toggle(
        'vision-unica-grid-reordenado',
        !esOrdenOriginal,
    );
}
