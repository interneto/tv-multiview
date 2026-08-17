/**
 * Lee un objeto guardado en localStorage sin poder lanzar.
 *
 * localStorage es una frontera de confianza: el usuario u otros scripts pueden dejar ahí
 * un valor no-JSON o truncado. Un `JSON.parse` sin protección tumbaría el flujo que lo
 * llama; esto devuelve {} ante clave ausente O contenido corrupto.
 *
 * @param {string} key
 * @returns {Record<string, any>} El objeto guardado, o {} si falta o está corrupto.
 */
export function readStoredObject(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}
