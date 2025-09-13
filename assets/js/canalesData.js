import { URL_JSON_CANALES_PRINCIPAL, URL_M3U_CANALES_IPTV } from "./constants/index.js";
import { sonNombresSimilares, M3U_A_JSON } from "./helpers/index.js";

// Gestión de backup y fetch de canales
// Lista de 9 canales predeterminados (ids existentes en json-teles/tv-channels.json)
export const ARRAY_CANALES_PREDETERMINADOS = [
    'nbc',
    'abc',
    'zdf',
    'rai1',
    'amc',
    'abcnews',
    'redbulltv',
    'ctv',
    'rtv'
];
// No añadimos extras para asegurar que se carguen exactamente 9 canales
export const ARRAY_CANALES_PREDETERMINADOS_EXTRAS = [];

export let listaCanales;
const LS_KEY_CANALES = 'backup-json-canales';
const LS_KEY_CANALES_FECHA = 'backup-json-canales-fecha';
const BACKUP_EXPIRACION_HORAS = 24;

export function esBackupValido() {
    const fechaStr = localStorage.getItem(LS_KEY_CANALES_FECHA);
    if (!fechaStr) return false;
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffHoras = (ahora - fecha) / (1000 * 60 * 60);
    return diffHoras < BACKUP_EXPIRACION_HORAS;
}

export function guardarBackupCanales(json) {
    localStorage.setItem(LS_KEY_CANALES, JSON.stringify(json));
    localStorage.setItem(LS_KEY_CANALES_FECHA, new Date().toISOString());
}

export function leerBackupCanales() {
    try {
        const raw = JSON.parse(localStorage.getItem(LS_KEY_CANALES));
        return normalizarListaCanales(raw);
    } catch {
        return null;
    }
}

export async function fetchCargarCanales() {
    try {
        if (esBackupValido()) {
            console.info('Cargando canales desde backup localStorage');
            listaCanales = leerBackupCanales();
            if (listaCanales) return;
        }
        console.info('Probando carga archivo principal con canales');
        const response = await fetch(URL_JSON_CANALES_PRINCIPAL);
        try {
            listaCanales = await response.json();
            // Normalizar posibles claves en inglés a las claves en español usadas por la UI
            listaCanales = normalizarListaCanales(listaCanales);
            guardarBackupCanales(listaCanales);
        } catch (parseError) {
            console.error('Error al parsear JSON principal:', parseError);
            // Intentar cargar backup si existe
            if (esBackupValido()) {
                console.warn('Usando backup localStorage por error de parseo');
                listaCanales = leerBackupCanales();
                if (listaCanales) return;
            }
            throw parseError;
        }
    } catch (error) {
        throw error;
    }
}

function normalizarListaCanales(obj) {
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

export async function fetchCargarCanalesIPTV() {
    console.info('Probando carga archivo m3u');
    const m3uResponse = await fetch(URL_M3U_CANALES_IPTV);
    const m3uData = await m3uResponse.text();
    const parseM3u = await M3U_A_JSON(m3uData);

    // Crear un mapa para indexar los canales por name
    const mapCanales = {};
    if (listaCanales) {
        for (const canal of Object.keys(listaCanales)) {
            const nameLista = listaCanales[canal].name ?? 'Canal sin name';
            mapCanales[nameLista] = listaCanales[canal];
        }

        // Combinar los canales de parseM3u con los de listaCanales
        for (const nameCanal in parseM3u) {
            const nameParseM3u = parseM3u[nameCanal].name ?? 'Canal sin name';
            const existingChannel = mapCanales[nameParseM3u];

            if (existingChannel && sonNombresSimilares(existingChannel.name, nameParseM3u)) {
                const newUrls = parseM3u[nameCanal].signals.m3u8_url.filter(url => !existingChannel.signals.m3u8_url.includes(url));
                existingChannel.signals.m3u8_url.push(...newUrls);
            } else {
                listaCanales[nameCanal] = parseM3u[nameCanal];
            }
        }
    }
}