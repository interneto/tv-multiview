/**
 * Almacén clave/valor mínimo sobre IndexedDB, con localStorage como respaldo.
 *
 * Motivo: el backup del catálogo de canales pesa cientos de KB y localStorage
 * es síncrono, con una cuota de ~5 MB compartida por todo el origen; guardar ahí
 * un blob grande bloquea el hilo principal y arriesga un QuotaExceededError que
 * tumba también las preferencias del usuario. IndexedDB es asíncrono, guarda
 * objetos estructurados sin serializar a string y tiene una cuota mucho mayor.
 *
 * Ningún método lanza: si IndexedDB no existe (modo privado de algunos
 * navegadores, WebView antiguos) o falla la transacción, se cae a localStorage.
 *
 * @module helperIdbStore
 */

const DB_NAME = 'tv-multiview';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const LS_PREFIX = 'idb-fallback-';

/** @type {Promise<IDBDatabase|null>|null} */
let dbPromise = null;

/**
 * Indica si el navegador expone IndexedDB.
 * @returns {boolean}
 */
export function isIdbAvailable() {
    try {
        return typeof indexedDB !== 'undefined' && indexedDB !== null;
    } catch {
        return false;
    }
}

/**
 * Abre (una sola vez) la base y cachea la promesa.
 * @returns {Promise<IDBDatabase|null>} null si IndexedDB no está disponible o falla.
 */
function openDb() {
    if (dbPromise) return dbPromise;
    if (!isIdbAvailable()) {
        dbPromise = Promise.resolve(null);
        return dbPromise;
    }
    dbPromise = new Promise((resolve) => {
        let request;
        try {
            request = indexedDB.open(DB_NAME, DB_VERSION);
        } catch {
            resolve(null);
            return;
        }
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
        request.onblocked = () => resolve(null);
    });
    return dbPromise;
}

/**
 * Ejecuta una operación dentro de una transacción y resuelve con su resultado.
 * @template T
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => IDBRequest} operation
 * @returns {Promise<T|null>} null ante cualquier fallo (nunca lanza).
 */
async function withStore(mode, operation) {
    const db = await openDb();
    if (!db) return null;
    return new Promise((resolve) => {
        let request;
        try {
            const transaction = db.transaction(STORE_NAME, mode);
            request = operation(transaction.objectStore(STORE_NAME));
        } catch {
            resolve(null);
            return;
        }
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => resolve(null);
    });
}

/**
 * Lee un valor. Si IndexedDB no responde, intenta el respaldo en localStorage.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function idbGet(key) {
    const value = await withStore('readonly', (store) => store.get(key));
    if (value !== null && value !== undefined) return value;
    try {
        const raw = localStorage.getItem(LS_PREFIX + key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Guarda un valor. Devuelve false si no se pudo persistir en ningún backend.
 * @param {string} key
 * @param {any} value Cualquier valor clonable estructuradamente.
 * @returns {Promise<boolean>}
 */
export async function idbSet(key, value) {
    const db = await openDb();
    if (db) {
        const ok = await new Promise((resolve) => {
            try {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                transaction.objectStore(STORE_NAME).put(value, key);
                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => resolve(false);
                transaction.onabort = () => resolve(false);
            } catch {
                resolve(false);
            }
        });
        if (ok) {
            // Ya no hace falta duplicar el blob en localStorage: liberamos su cuota.
            try {
                localStorage.removeItem(LS_PREFIX + key);
            } catch {
                /* almacenamiento bloqueado por el navegador: nada que limpiar */
            }
            return true;
        }
    }
    try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/**
 * Borra un valor de ambos backends.
 * @param {string} key
 * @returns {Promise<void>}
 */
export async function idbDelete(key) {
    await withStore('readwrite', (store) => store.delete(key));
    try {
        localStorage.removeItem(LS_PREFIX + key);
    } catch {
        /* almacenamiento bloqueado por el navegador: nada que limpiar */
    }
}
