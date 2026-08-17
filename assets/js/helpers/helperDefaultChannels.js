import { DEFAULT_CHANNELS_ARRAY, DEFAULT_CHANNEL_LIST_EXTRAS } from '../channelsData.js';

/**
 * Lista de canales que se cargan por defecto.
 *
 * En móvil se queda en la lista base: cada canal extra es otro reproductor
 * compitiendo por decoders y datos en una conexión que suele ser peor.
 *
 * @param {boolean} isMobile
 * @returns {string[]} Ids de canal.
 */
export function obtenerCanalesPredeterminados(isMobile) {
    return isMobile
        ? DEFAULT_CHANNELS_ARRAY
        : DEFAULT_CHANNELS_ARRAY.concat(DEFAULT_CHANNEL_LIST_EXTRAS);
}
