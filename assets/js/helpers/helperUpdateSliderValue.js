import {
    CONTAINER_VISION_CUADRICULA,
    INPUT_RANGE_PERSONALIZACION_TAMAÑO_VISION_CUADRICULA,
    SPAN_VALOR_INPUT_RANGE,
} from '../main.js';

/**
 * Aplica a la cuadrícula el ancho guardado en el slider de personalización y
 * refresca el porcentaje que se muestra junto a él.
 *
 * @returns {void}
 */
export function actualizarValorSlider() {
    const valorInputRange = parseInt(localStorage.getItem('valor-input-range') ?? '100');
    INPUT_RANGE_PERSONALIZACION_TAMAÑO_VISION_CUADRICULA.setAttribute(
        'value',
        String(valorInputRange),
    );
    SPAN_VALOR_INPUT_RANGE.textContent = `${valorInputRange}%`;
    /** @type {HTMLElement} */ (CONTAINER_VISION_CUADRICULA).style.maxWidth = `${valorInputRange}%`;
}
