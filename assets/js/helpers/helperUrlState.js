/**
 * Helper para sincronizar el estado de los canales activos con la URL (hash).
 * Permite compartir/restaurar la vista actual mediante enlaces.
 *
 * Formato: #channels=channel1.channel2.channel3&layout=grid
 *
 * @module helperUrlState
 */

// '.' no requiere percent-encoding en un query string (a diferencia de ',' -> %2C),
// y ningún id de canal actual lo usa, así que sirve de separador sin ambigüedad.
const CHANNEL_SEPARATOR = '.';

// Los valores de layout en localStorage ('diseño-seleccionado') se mantienen en
// español por compatibilidad interna; el enlace para compartir sí se traduce.
const LAYOUT_TO_URL = { 'vision-cuadricula': 'grid', 'vision-unica': 'single' };
const LAYOUT_FROM_URL = { grid: 'vision-cuadricula', single: 'vision-unica' };

/**
 * Codifica los canales activos del contenedor en un string para la URL.
 * @param {string} containerSelector - Selector CSS del contenedor de canales.
 * @returns {string} Lista de IDs de canales separados por coma.
 */
export function getActiveChannelsFromDom(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return '';
    const canales = container.querySelectorAll('div[data-canal]');
    return Array.from(canales)
        .map((div) => div.dataset.canal)
        .filter(Boolean)
        .join(CHANNEL_SEPARATOR);
}

/**
 * Serializa el estado actual (canales + layout) en el hash de la URL.
 */
export function pushStateToUrl(containerSelector) {
    const canales = getActiveChannelsFromDom(containerSelector);
    const layoutLS = localStorage.getItem('diseño-seleccionado') || 'vision-cuadricula';
    const params = new URLSearchParams();
    if (canales) params.set('channels', canales);
    params.set('layout', LAYOUT_TO_URL[layoutLS] ?? layoutLS);

    const newHash = params.toString();
    if (window.location.hash !== `#${newHash}`) {
        history.replaceState(null, '', `#${newHash}`);
    }
}

/**
 * Lee el hash de la URL y extrae los parámetros de estado.
 * @returns {{ canales: string[], layout: string|null }}
 */
export function parseStateFromUrl() {
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);
    const canalesStr = params.get('channels') || '';
    const canales = canalesStr ? canalesStr.split(CHANNEL_SEPARATOR).filter(Boolean) : [];
    const layoutUrl = params.get('layout');
    const layout = layoutUrl ? (LAYOUT_FROM_URL[layoutUrl] ?? layoutUrl) : null;
    return { canales, layout };
}

/**
 * Construye un enlace para compartir el estado actual.
 * @returns {string} URL absoluta para compartir.
 */
export function buildShareUrl() {
    const url = new URL(window.location.href);
    url.hash = window.location.hash;
    return url.toString();
}

/**
 * Copia la URL de compartir al portapapeles.
 * @returns {Promise<boolean>} true si se copió correctamente.
 */
export async function copyShareUrlToClipboard() {
    const url = buildShareUrl();
    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch {
        // Fallback para navegadores sin API clipboard
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
    }
}
