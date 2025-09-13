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
        return JSON.parse(localStorage.getItem(LS_KEY_CANALES));
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

export async function fetchCargarCanalesIPTV() {
    console.info('Probando carga archivo m3u');
    const m3uResponse = await fetch(URL_M3U_CANALES_IPTV);
    const m3uData = await m3uResponse.text();
    const parseM3u = await M3U_A_JSON(m3uData);

    // Crear un mapa para indexar los canales por nombre
    const mapCanales = {};
    if (listaCanales) {
        for (const canal of Object.keys(listaCanales)) {
            const nombreLista = listaCanales[canal].nombre ?? 'Canal sin nombre';
            mapCanales[nombreLista] = listaCanales[canal];
        }

        // Combinar los canales de parseM3u con los de listaCanales
        for (const nombreCanal in parseM3u) {
            const nombreParseM3u = parseM3u[nombreCanal].nombre ?? 'Canal sin nombre';
            const existingChannel = mapCanales[nombreParseM3u];

            if (existingChannel && sonNombresSimilares(existingChannel.nombre, nombreParseM3u)) {
                const newUrls = parseM3u[nombreCanal].señales.m3u8_url.filter(url => !existingChannel.señales.m3u8_url.includes(url));
                existingChannel.señales.m3u8_url.push(...newUrls);
            } else {
                listaCanales[nombreCanal] = parseM3u[nombreCanal];
            }
        }
    }
}