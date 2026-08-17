import { BOTONES_REPOSICIONAR_BOTONES_FLOTANTES } from '../main.js';

/**
 * Reposiciona el grupo de botones flotantes cambiando sus clases de utilidad.
 *
 * Limpia primero todas las posiciones posibles: acumularlas dejaría dos anclajes
 * en conflicto sobre el mismo elemento.
 *
 * @param {string} topClass Clase vertical ('top-0', 'bottom-0'...).
 * @param {string} startClass Clase horizontal ('start-0', 'end-0'...).
 * @param {string} marginClass Margen opcional ('mt-3', 'mb-3').
 * @param {string} translateClass Traslación opcional para centrar.
 * @returns {void}
 */
export function alternarPosicionBotonesFlotantes(
    topClass,
    startClass,
    marginClass,
    translateClass,
) {
    const divBotonesFlotantes = document.querySelector('#grupo-botones-flotantes');
    if (!divBotonesFlotantes) return;
    divBotonesFlotantes.classList.remove(
        'top-0',
        'top-50',
        'bottom-0',
        'start-0',
        'start-50',
        'end-0',
        'translate-middle-x',
        'translate-middle-y',
        'translate-middle',
        'mb-3',
        'mt-3',
    );
    // Validar que los argumentos sean strings válidos y no duplicar clases
    const clasesPorAgregar = new Set();
    [topClass, startClass, marginClass, translateClass].forEach((clase) => {
        if (typeof clase === 'string' && clase.trim() !== '') {
            clasesPorAgregar.add(clase);
        }
    });
    clasesPorAgregar.forEach((clase) => divBotonesFlotantes.classList.add(clase));
}

/**
 * Aplica y persiste la posición elegida por el usuario para los botones flotantes.
 *
 * @param {string} topClass
 * @param {string} startClass
 * @param {string} [margin='']
 * @param {string} [translateClass='']
 * @returns {void}
 */
export function clicBotonPosicionBotonesFlotantes(
    topClass,
    startClass,
    margin = '',
    translateClass = '',
) {
    alternarPosicionBotonesFlotantes(topClass, startClass, margin, translateClass);
    const posicionElegida = {
        top: typeof topClass === 'string' ? topClass : '',
        start: typeof startClass === 'string' ? startClass : '',
        margin: typeof margin === 'string' ? margin : '',
        translate: typeof translateClass === 'string' ? translateClass : '',
    };
    // Solo guardar si la posición cambió y manejar localStorage seguro
    try {
        const actual = localStorage.getItem('posicion-botones-flotante');
        if (!actual || actual !== JSON.stringify(posicionElegida)) {
            localStorage.setItem('posicion-botones-flotante', JSON.stringify(posicionElegida));
        }
    } catch (e) {
        console.warn('No se pudo guardar la posición de los botones flotantes en localStorage:', e);
    }
}

/**
 * @returns {boolean} true si el botón corresponde a esa combinación de posición.
 */
function esBotonReposicionar(boton, top, start, margin, translate) {
    const BOTON_DATASET_POSITION = boton.dataset.position.split(' ');
    return (
        BOTON_DATASET_POSITION[0] === top &&
        BOTON_DATASET_POSITION[1] === start &&
        (BOTON_DATASET_POSITION[2] || '') === (margin || '') &&
        (BOTON_DATASET_POSITION[3] || '') === (translate || '')
    );
}

/**
 * Marca como activo, entre los botones de posición de ajustes, el que coincide
 * con la posición actual.
 *
 * @param {string} top
 * @param {string} start
 * @param {string} margin
 * @param {string} translate
 * @returns {void}
 */
export function actualizarBotonesFlotantes(top, start, margin, translate) {
    alternarPosicionBotonesFlotantes(top, start, margin, translate);
    BOTONES_REPOSICIONAR_BOTONES_FLOTANTES.forEach((boton) => {
        boton.checked = esBotonReposicionar(boton, top, start, margin, translate);
    });
}
