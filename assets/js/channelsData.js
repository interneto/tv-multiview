import { URL_TV_CHANNELS_JSON, URL_IPTV_CHANNELS_M3U } from "./constants/index.js";
import { areSimilarNames, M3U_A_JSON } from "./helpers/index.js";

// Gestión de backup y fetch de canales
// Lista de 9 canales predeterminados (ids existentes en json-tv/tv-channels.json)
export const DEFAULT_CHANNELS_ARRAY = [
    'nbc',
    'abc',
    'zdf',
    'rai1',
    'amc',
    'abcnews',
    'redbulltv',
    'ctv',
    'rtv'
    // TODO: add more channels if needed
];
// No añadimos extras para asegurar que se carguen exactamente 9 canales
export const DEFAULT_CHANNEL_LIST_EXTRAS = [];

export let listChannels;
const LS_KEY_CANALES = 'backup-json-canales';
const LS_KEY_CANALES_FECHA = 'backup-json-canales-fecha';
const BACKUP_EXPIRACION_HORAS = 24;

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
    const response = await fetch(URL_TV_CHANNELS_JSON);
    try {
        listChannels = await response.json();
        listChannels = normalizeChannelList(listChannels);
        saveChannelBackup(listChannels);
    } catch (parseError) {
        console.error('Error al parsear JSON principal:', parseError);
        if (isBackupValid()) {
            console.warn('Usando backup localStorage por error de parseo');
            listChannels = fetchBackupChannels();
            if (listChannels) return;
        }
        throw parseError;
    }
}

function normalizeChannelList(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const out = {};
    for (const key of Object.keys(obj)) {
        const item = obj[key] || {};
        const name = item.name ?? item.name ?? item.title ?? '';
        const signals = item.signals ?? item.signals ?? item.streams ?? {};
        const website = item.website ?? item.website ?? item.url ?? '';
        const category = item.category ?? item.category ?? '';
        const country = item.country ?? item.country ?? item.countries ?? '';
        const logo = item.logo ?? item.logo ?? '';

        // Ensure signals has expected substructure (arrays or strings as stored)
        const signalsNormalizadas = { ...signals };

        out[key] = {
            ...item,
            name,
            logo,
            signals: signalsNormalizadas,
            website,
            category,
            country
        };
    }
    return out;
}

export async function fetchIptvChannelsData() {
    console.info('Probando carga archivo m3u');
    const m3uResponse = await fetch(URL_IPTV_CHANNELS_M3U);
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
                const newUrls = parseM3u[nameCanal].signals.m3u8_url.filter(url => !existingChannel.signals.m3u8_url.includes(url));
                existingChannel.signals.m3u8_url.push(...newUrls);
            } else {
                listChannels[nameCanal] = parseM3u[nameCanal];
            }
        }
    }
}