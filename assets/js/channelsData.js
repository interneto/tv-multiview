import { URL_TV_CHANNELS_JSON, URL_IPTV_CHANNELS_M3U } from './constants/index.js';
import { areSimilarNames, M3U_A_JSON } from './helpers/index.js';

// 9 canales para la grilla 3x3 por defecto, uno por tema para que la primera
// impresión no sea "solo noticias": deportes, entretenimiento, infantil,
// negocios, documentales y actualidad internacional.
export const DEFAULT_CHANNELS_ARRAY = [
    'teledeporte', // Sports (España)
    'redbulltv', // Sports / entertainment (deportes extremos)
    'skynews', // News (Reino Unido)
    'aljazeera', // News / international (Qatar, cobertura global)
    'nickelodeon', // Kids
    'cnbc', // Business
    'bbearth', // Documentary / nature
    'nbc', // General / entertainment (EE.UU.)
    'm6', // Entertainment (Francia)
];

export const DEFAULT_CHANNEL_LIST_EXTRAS = [];

export let listChannels;
const LS_KEY_CANALES = 'backup-json-canales';
const LS_KEY_CANALES_FECHA = 'backup-json-canales-fecha';
const BACKUP_EXPIRACION_HORAS = 24;
const FETCH_TIMEOUT_MS = 8000;

// fetch con timeout + chequeo de response.ok. Lanza si falla la red o el status no es 2xx.
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

export function isBackupValid() {
    const fechaStr = localStorage.getItem(LS_KEY_CANALES_FECHA);
    if (!fechaStr) return false;
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffHoras = (ahora - fecha) / (1000 * 60 * 60);
    return diffHoras < BACKUP_EXPIRACION_HORAS;
}

export function saveChannelBackup(json) {
    localStorage.setItem(LS_KEY_CANALES, JSON.stringify(json));
    localStorage.setItem(LS_KEY_CANALES_FECHA, new Date().toISOString());
}

export function fetchBackupChannels() {
    try {
        const raw = JSON.parse(localStorage.getItem(LS_KEY_CANALES));
        return normalizeChannelList(raw);
    } catch {
        return null;
    }
}

export async function loadChannelData() {
    if (isBackupValid()) {
        console.info('Cargando canales desde backup localStorage');
        listChannels = fetchBackupChannels();
        if (listChannels) return;
    }
    console.info('Probando carga archivo principal con canales');
    try {
        const response = await fetchWithTimeout(URL_TV_CHANNELS_JSON);
        listChannels = await response.json();
        listChannels = normalizeChannelList(listChannels);
        saveChannelBackup(listChannels);
    } catch (error) {
        console.error('Error al cargar/parsear JSON principal:', error);
        if (isBackupValid()) {
            console.warn('Usando backup localStorage por error de red/parseo');
            listChannels = fetchBackupChannels();
            if (listChannels) return;
        }
        throw error;
    }
}

function normalizeChannelList(obj) {
    if (!obj || typeof obj !== 'object') return obj;
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

export async function fetchIptvChannelsData() {
    console.info('Probando carga archivo m3u');
    const m3uResponse = await fetchWithTimeout(URL_IPTV_CHANNELS_M3U);
    const m3uData = await m3uResponse.text();
    const parseM3u = await M3U_A_JSON(m3uData);

    // Crear un mapa para indexar los canales por name
    const mapCanales = {};
    if (listChannels) {
        for (const canal of Object.keys(listChannels)) {
            const nameLista = listChannels[canal].name ?? 'Canal sin name';
            mapCanales[nameLista] = listChannels[canal];
        }

        // Combinar los canales de parseM3u con los de listChannels
        for (const nameCanal in parseM3u) {
            const nameParseM3u = parseM3u[nameCanal].name ?? 'Canal sin name';
            const existingChannel = mapCanales[nameParseM3u];

            if (existingChannel && areSimilarNames(existingChannel.name, nameParseM3u)) {
                const newUrls = parseM3u[nameCanal].signals.m3u8_url.filter(
                    (url) => !existingChannel.signals.m3u8_url.includes(url),
                );
                existingChannel.signals.m3u8_url.push(...newUrls);
            } else {
                listChannels[nameCanal] = parseM3u[nameCanal];
            }
        }
    }
}
