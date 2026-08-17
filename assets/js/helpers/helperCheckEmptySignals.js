import { listChannels } from '../channelsData.js';

/** Señales que guardan un id de plataforma, no una URL. */
const ID_SIGNAL_KEYS = new Set(['yt_id', 'yt_embed', 'yt_playlist', 'twitch_id']);

/**
 * @param {unknown} valor
 * @returns {boolean} true si es una URL http(s) no vacía.
 */
function tieneUrlUtilizable(valor) {
    if (typeof valor !== 'string') return false;
    const texto = valor.trim();
    if (!texto) return false;
    if (texto.startsWith('http://') || texto.startsWith('https://')) return true;
    return false;
}

/**
 * Comprueba si un canal se quedó sin ninguna señal reproducible (todas vacías o
 * sin URL utilizable). Sirve para esconder su botón en vez de ofrecer un canal
 * que solo puede fallar.
 *
 * Un id desconocido cuenta como vacío.
 *
 * @param {string} canalId
 * @returns {boolean}
 */
export function revisarSeñalesVacias(canalId) {
    const signals = listChannels?.[canalId]?.signals;
    if (signals) {
        const valoresUtilizables = Object.entries(signals).filter(([key, señal]) => {
            if (Array.isArray(señal)) {
                return señal.some((item) => tieneUrlUtilizable(item));
            }
            if (typeof señal !== 'string') return false;
            // yt_id, yt_embed, yt_playlist y twitch_id no son URLs sino identificadores:
            // el reproductor construye el embed a partir de ellos. Exigirles "http" daba
            // por muerto a un canal que solo tiene YouTube y sí se ve perfectamente.
            if (ID_SIGNAL_KEYS.has(key)) return señal.trim() !== '';
            return tieneUrlUtilizable(señal);
        });

        const todasLasSeñalesVacias = valoresUtilizables.length === 0;
        if (todasLasSeñalesVacias) console.error(`${canalId} tiene todas sus signals vacías`);
        return todasLasSeñalesVacias;
    }
    return true;
}
