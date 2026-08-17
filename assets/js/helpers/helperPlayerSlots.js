/**
 * Cola de cupos para instanciar reproductores video.js.
 *
 * Con N players ABR cargando a la vez, `play()` empieza a rechazar por contención
 * de recursos (decoders/MediaSource) antes de que el propio stream tenga chance de
 * fallar o funcionar — confirmado en pruebas: canales que fallan en un batch de 18
 * funcionan bien solos. Este módulo limita a MAX_CONCURRENT_PLAYERS los que cargan
 * simultáneamente; el resto espera turno en cola.
 *
 * Vive aparte de channelUI.js para poder testearse sin DOM ni video.js: es la pieza
 * donde un cupo mal liberado deja la cola bloqueada para siempre.
 *
 * @module helperPlayerSlots
 */

// ponytail: cupo fijo, ajustar/derivar de navigator.hardwareConcurrency si algún día hace falta.
export const MAX_CONCURRENT_PLAYERS = 6;

let activePlayerSlots = 0;
/** @type {Array<() => void>} */
const playerSlotQueue = [];

/**
 * Espera a que haya cupo libre.
 * @returns {Promise<void>} Resuelve de inmediato si hay cupo; si no, al liberarse uno.
 */
export function acquirePlayerSlot() {
    if (activePlayerSlots < MAX_CONCURRENT_PLAYERS) {
        activePlayerSlots += 1;
        return Promise.resolve();
    }
    return new Promise((resolve) => playerSlotQueue.push(resolve));
}

/**
 * Devuelve un cupo. Si hay alguien esperando, se lo cede sin bajar el contador
 * (el cupo cambia de dueño, no se libera).
 * @returns {void}
 */
export function releasePlayerSlot() {
    const next = playerSlotQueue.shift();
    if (next) {
        next();
    } else {
        activePlayerSlots = Math.max(0, activePlayerSlots - 1);
    }
}

/**
 * Toma un cupo y devuelve un handle cuyo `release()` es idempotente.
 *
 * Un mismo player puede terminar por varias vías a la vez (timeout de carga,
 * evento `error`, `dispose`, rechazo de `play()`): sin esta guarda, dos de esas
 * vías liberarían dos cupos por un solo player y el límite dejaría de existir.
 *
 * @returns {Promise<{release: () => void, isHeld: () => boolean}>}
 */
export async function acquirePlayerSlotHandle() {
    await acquirePlayerSlot();
    let held = true;
    return {
        release() {
            if (!held) return;
            held = false;
            releasePlayerSlot();
        },
        isHeld: () => held,
    };
}

/**
 * Estado interno de la cola. Solo para tests y depuración.
 * @returns {{active: number, queued: number, max: number}}
 */
export function getPlayerSlotStats() {
    return {
        active: activePlayerSlots,
        queued: playerSlotQueue.length,
        max: MAX_CONCURRENT_PLAYERS,
    };
}

/**
 * Vacía la cola y pone el contador a cero. Solo para tests: en producción los
 * cupos se liberan siempre por el handle del player.
 * @returns {void}
 */
export function resetPlayerSlots() {
    activePlayerSlots = 0;
    playerSlotQueue.length = 0;
}
