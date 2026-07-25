// localStorage es una frontera de confianza: el usuario u otros scripts pueden dejar ahí
// un valor no-JSON o truncado. Un `JSON.parse` sin protección tumbaría el flujo que lo
// llama; esto devuelve {} ante clave ausente O contenido corrupto.
export function readStoredObject(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}
