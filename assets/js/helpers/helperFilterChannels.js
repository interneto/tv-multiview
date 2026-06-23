import {
    CSS_CLASS_PRIMARY_BUTTON,
    CHANNEL_CONTAINER_ID_PREFIXES,
    COUNTRY_CODES,
} from '../constants/index.js';
import { mostrarToast } from './index.js';
import { buildErrorToastMessage, t } from '../i18n.js';

function normalizarInput(normalizarEsto) {
    return (
        normalizarEsto
            ?.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase() ?? ''
    );
}

function alertaNoCoincidencias(elemento, esOcultar, textoQueNoFueEncontrado) {
    if (!elemento) return;
    elemento.classList.toggle('d-none', esOcultar);
    const span = elemento.querySelector('span');
    if (span) span.textContent = textoQueNoFueEncontrado;
}

// filtro canales
export function filtrarCanalesPorInput(valorInput, containerBotonesDeCanales) {
    try {
        if (!containerBotonesDeCanales) return;
        const ID_CONTENEDOR_BOTONES_CANALES = containerBotonesDeCanales.id;
        const INPUT_NORMALIZADO = normalizarInput(valorInput);
        const BOTONES_CANALES = containerBotonesDeCanales.querySelectorAll('button');
        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            if (ID_CONTENEDOR_BOTONES_CANALES.startsWith(PREFIJO)) {
                let booleanCoincidencia = false;
                let filtroPorPaisActivo = 'all';
                const botonesFiltroPorPais = document.querySelectorAll(
                    `#${PREFIJO}-collapse-botones-listado-filtro-countries button`,
                );
                botonesFiltroPorPais.forEach((boton) => {
                    if (boton.classList.contains(CSS_CLASS_PRIMARY_BUTTON)) {
                        filtroPorPaisActivo =
                            COUNTRY_CODES[boton.dataset.country] ?? boton.dataset.country;
                    }
                });
                BOTONES_CANALES.forEach((boton) => {
                    if (!boton) return;
                    const contenidoBotonNormalizado = normalizarInput(
                        `${boton.dataset.country} - ${boton.textContent}`,
                    );
                    const esCoincidencia = contenidoBotonNormalizado.includes(INPUT_NORMALIZADO);
                    if (filtroPorPaisActivo !== 'all') {
                        if (boton.dataset.country === filtroPorPaisActivo) {
                            boton.classList.toggle('d-none', !esCoincidencia);
                            if (esCoincidencia) booleanCoincidencia = true;
                        } else {
                            boton.classList.add('d-none');
                        }
                    } else {
                        boton.classList.toggle('d-none', !esCoincidencia);
                        if (esCoincidencia) booleanCoincidencia = true;
                    }
                });
                const alerta = document.querySelector(`#${PREFIJO}-mensaje-alerta`);
                alertaNoCoincidencias(alerta, booleanCoincidencia, INPUT_NORMALIZADO);
                break;
            }
        }
    } catch (error) {
        console.error(`Error durante filtrado canales. Error: ${error}`);
        mostrarToast(buildErrorToastMessage(t('errorFilterChannels'), error), 'danger');
        return;
    }
}
