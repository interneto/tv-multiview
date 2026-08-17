import { mostrarToast } from './index.js';
import { buildErrorToastMessage, t } from '../i18n.js';

export const CONTAINER_INTERNO_VISION_UNICA = document.querySelector('.vision-unica-grid');
const ID_EN_ORDEN_ORIGINAL = ['panel-canales-vision-unica', 'container-video-vision-unica'];

/**
 * Restaura el orden guardado de los dos paneles de visión única (lista de
 * canales y vídeo). Si lo guardado no cuadra con los paneles que existen hoy,
 * se descarta y se vuelve al orden original.
 *
 * @returns {void}
 */
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

/**
 * Persiste el orden actual de los paneles de visión única.
 * @returns {void}
 */
export function guardarOrdenPanelesVisionUnica() {
    let ordenActual = Array.from(CONTAINER_INTERNO_VISION_UNICA.children).map((item) => item.id);
    localStorage.setItem('orden-grid-vision-unica', JSON.stringify(ordenActual));
}

/**
 * @returns {string[]} Ids de los paneles en el orden en que están ahora.
 */
function getOrdenActual() {
    return Array.from(CONTAINER_INTERNO_VISION_UNICA.children).map((item) => item.id);
}

/**
 * Marca la cuadrícula de visión única como "reordenada" cuando el orden difiere
 * del original: el CSS invierte las columnas a partir de esa clase.
 *
 * @returns {void}
 */
export function toggleClaseOrdenado() {
    const ordenActual = getOrdenActual();
    const esOrdenOriginal = JSON.stringify(ID_EN_ORDEN_ORIGINAL) === JSON.stringify(ordenActual);
    CONTAINER_INTERNO_VISION_UNICA.classList.toggle(
        'vision-unica-grid-reordenado',
        !esOrdenOriginal,
    );
}
