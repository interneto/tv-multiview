import { URL_TV_CHANNELS_JSON, URL_IPTV_CHANNELS_M3U } from './constants/index.js';
import { M3U_A_JSON } from './helpers/index.js';
import { idbGet, idbSet, idbDelete } from './helpers/helperIdbStore.js';

// 9 canales para la grilla 3x3 por defecto, uno por tema para que la primera
// impresión no sea "solo noticias": deportes, entretenimiento, infantil,
// negocios, documentales y actualidad internacional.
//
// Todos deben servir su m3u8 con CORS abierto o tener respaldo de YouTube: un
// servidor que responde pero no manda Access-Control-Allow-Origin deja el canal
// muerto en el navegador aunque el chequeo desde Node lo dé por vivo
// (ver tools/check_cors_channels.js).
export const DEFAULT_CHANNELS_ARRAY = [
    'teledeporte', // Sports (España)
    'redbulltv', // Sports / entertainment (deportes extremos)
    'dw', // News / international (Alemania; sustituye a skynews, bloqueado por CORS)
    'aljazeera', // News / international (Qatar; su m3u8 cayó, entra por YouTube)
    'nickelodeon', // Kids
    'cnbc', // Business (solo YouTube: su m3u8 era http:// y ya no responde)
    'cgtndocumentary', // Documentary (sustituye a bbearth, bloqueado por CORS)
    'nbc', // General / entertainment (EE.UU.)
    'tvmonaco', // Entertainment / general (Mónaco, francófono; reemplaza a m6, retirado)
];

/** @type {string[]} */
export const DEFAULT_CHANNEL_LIST_EXTRAS = [];

/** @type {Record<string, any> | undefined} */
export let listChannels;
// Claves legacy en localStorage: se siguen leyendo para migrar el backup de
// usuarios que ya lo tenían ahí, y se borran en cuanto IndexedDB toma el relevo.
const LS_KEY_CANALES = 'backup-json-canales';
const LS_KEY_CANALES_FECHA = 'backup-json-canales-fecha';
const IDB_KEY_BACKUP = 'channels-backup';
const BACKUP_EXPIRACION_HORAS = 24;
const FETCH_TIMEOUT_MS = 8000;

// fetch con timeout + chequeo de response.ok. Lanza si falla la red o el status no es 2xx.
/**
 * @param {string} url
 * @param {number} ms
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, ms = FETCH_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status} al cargar ${url}`);
        return response;
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Lee el backup del catálogo desde IndexedDB y, si no está ahí, desde las
 * claves legacy de localStorage.
 * @returns {Promise<{savedAt: string, channels: Object}|null>}
 */
async function readBackupRecord() {
    const record = await idbGet(IDB_KEY_BACKUP);
    if (record && typeof record === 'object' && record.channels) return record;

    // Migración: backup viejo en localStorage.
    try {
        const savedAt = localStorage.getItem(LS_KEY_CANALES_FECHA);
        const raw = localStorage.getItem(LS_KEY_CANALES);
        if (!savedAt || !raw) return null;
        return { savedAt, channels: JSON.parse(raw) };
    } catch {
        return null;
    }
}

/**
 * @param {{savedAt: string}|null} record
 * @returns {boolean} true si el backup existe y no ha caducado.
 */
function isRecordFresh(record) {
    if (!record?.savedAt) return false;
    const diffHoras = (Date.now() - new Date(record.savedAt).getTime()) / (1000 * 60 * 60);
    return Number.isFinite(diffHoras) && diffHoras < BACKUP_EXPIRACION_HORAS;
}

/**
 * @returns {Promise<boolean>} true si hay un backup vigente en cualquier backend.
 */
export async function isBackupValid() {
    return isRecordFresh(await readBackupRecord());
}

/**
 * Persiste el catálogo en IndexedDB y limpia el backup legacy de localStorage.
 * @param {Object} json Catálogo ya normalizado.
 * @returns {Promise<void>}
 */
export async function saveChannelBackup(json) {
    const guardado = await idbSet(IDB_KEY_BACKUP, {
        savedAt: new Date().toISOString(),
        channels: json,
    });
    if (!guardado) {
        console.warn('No se pudo guardar el backup de canales (IndexedDB y localStorage llenos)');
        return;
    }
    // El blob ya vive en IndexedDB: liberamos la cuota de localStorage, que
    // comparten las preferencias del usuario.
    try {
        localStorage.removeItem(LS_KEY_CANALES);
        localStorage.removeItem(LS_KEY_CANALES_FECHA);
    } catch {
        /* almacenamiento bloqueado por el navegador: nada que limpiar */
    }
}

/**
 * @returns {Promise<Object|null>} Catálogo del backup, normalizado, o null.
 */
export async function fetchBackupChannels() {
    const record = await readBackupRecord();
    if (!record?.channels) return null;
    return normalizeChannelList(record.channels);
}

/**
 * Elimina el backup del catálogo de todos los backends (usado al reiniciar
 * el almacenamiento local desde ajustes: `localStorage.clear()` no toca IndexedDB).
 * @returns {Promise<void>}
 */
export async function clearChannelBackup() {
    await idbDelete(IDB_KEY_BACKUP);
    try {
        localStorage.removeItem(LS_KEY_CANALES);
        localStorage.removeItem(LS_KEY_CANALES_FECHA);
    } catch {
        /* almacenamiento bloqueado por el navegador: nada que limpiar */
    }
}

export async function loadChannelData() {
    const backup = await readBackupRecord();
    if (isRecordFresh(backup)) {
        console.info('Cargando canales desde backup local');
        listChannels = normalizeChannelList(backup.channels);
        if (listChannels) return;
    }
    console.info('Probando carga archivo principal con canales');
    try {
        const response = await fetchWithTimeout(URL_TV_CHANNELS_JSON);
        listChannels = await response.json();
        listChannels = normalizeChannelList(listChannels);
        await saveChannelBackup(listChannels);
    } catch (error) {
        console.error('Error al cargar/parsear JSON principal:', error);
        // Un backup caducado sigue siendo mejor que una pantalla de error.
        if (backup?.channels) {
            console.warn('Usando backup local por error de red/parseo');
            listChannels = normalizeChannelList(backup.channels);
            if (listChannels) return;
        }
        throw error;
    }
}

/**
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
function normalizeChannelList(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    /** @type {Record<string, any>} */
    const out = {};
    for (const key of Object.keys(obj)) {
        const item = obj[key] || {};
        const name = item.name ?? item.title ?? '';
        const signals = item.signals ?? item.streams ?? {};
        const website = item.website ?? item.url ?? '';
        const category = item.category ?? '';
        const country = item.country ?? item.countries ?? '';
        const logo = item.logo ?? '';

        out[key] = {
            ...item,
            name,
            logo,
            signals: { ...signals },
            website,
            category,
            country,
        };
    }
    return out;
}

/**
 * Carga la lista m3u (modo experimental IPTV) y la combina en `listChannels`.
 * Deduplica por nombre normalizado o por tvg-id, marca los canales procedentes
 * del m3u con `iptv: true` y devuelve cuántos se añadieron/actualizaron para
 * que la UI pueda resumirlo en un toast.
 *
 * @returns {Promise<{added: number, updated: number}>}
 */
export async function fetchIptvChannelsData() {
    console.info('Probando carga archivo m3u');
    const m3uResponse = await fetchWithTimeout(URL_IPTV_CHANNELS_M3U);
    const m3uData = await m3uResponse.text();
    const parseM3u = await M3U_A_JSON(m3uData);

    if (!listChannels) return { added: 0, updated: 0 };

    let added = 0;
    let updated = 0;

    // Índice doble (nombre normalizado + tvg-id) para no duplicar un canal que el
    // m3u lista con distinta capitalización o por su id en vez de por nombre.
    /** @type {Map<string, {id: string, canal: any}>} */
    const mapaPorNombre = new Map();
    /** @type {Map<string, {id: string, canal: any}>} */
    const mapaPorId = new Map();
    for (const id of Object.keys(listChannels)) {
        const canal = listChannels[id];
        mapaPorNombre.set((canal.name ?? '').trim().toLowerCase(), { id, canal });
        if (id) mapaPorId.set(id.toLowerCase(), { id, canal });
    }

    for (const idM3u of Object.keys(parseM3u)) {
        const canalM3u = parseM3u[idM3u];
        const claveNombre = (canalM3u.name ?? '').trim().toLowerCase();
        const existente = mapaPorNombre.get(claveNombre) ?? mapaPorId.get(idM3u.toLowerCase());

        if (existente) {
            const { canal } = existente;
            const urlsExistentes = /** @type {string[]} */ (canal.signals?.m3u8_url ?? []);
            const urlsNuevas = /** @type {string[]} */ (canalM3u.signals?.m3u8_url ?? []).filter(
                (url) => !urlsExistentes.includes(url),
            );
            if (urlsNuevas.length > 0) {
                canal.signals = { ...canal.signals, m3u8_url: [...urlsExistentes, ...urlsNuevas] };
                canal.iptv = true;
                updated++;
            }
        } else {
            listChannels[idM3u] = { ...canalM3u, iptv: true };
            added++;
        }
    }

    console.info(`IPTV m3u: ${added} canales añadidos, ${updated} actualizados`);
    return { added, updated };
}
