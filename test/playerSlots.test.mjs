// Cola de cupos de reproductor (assets/js/helpers/helperPlayerSlots.js).
//
// Esta es la pieza que un stream colgado puede dejar bloqueada: si un player no
// devuelve su cupo, los canales en cola esperan un turno que no llega nunca. Los
// tests cubren justo eso — el traspaso del cupo y la idempotencia de release().
//   node --test test/
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    MAX_CONCURRENT_PLAYERS,
    acquirePlayerSlot,
    acquirePlayerSlotHandle,
    releasePlayerSlot,
    getPlayerSlotStats,
    resetPlayerSlots,
} from '../assets/js/helpers/helperPlayerSlots.js';

beforeEach(() => resetPlayerSlots());

// Deja correr los microtasks pendientes para ver qué promesas ya resolvieron.
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('los primeros MAX_CONCURRENT_PLAYERS cupos se conceden de inmediato', async () => {
    for (let i = 0; i < MAX_CONCURRENT_PLAYERS; i++) {
        await acquirePlayerSlot();
    }
    assert.deepEqual(getPlayerSlotStats(), {
        active: MAX_CONCURRENT_PLAYERS,
        queued: 0,
        max: MAX_CONCURRENT_PLAYERS,
    });
});

test('pasado el límite, la petición espera en cola', async () => {
    for (let i = 0; i < MAX_CONCURRENT_PLAYERS; i++) await acquirePlayerSlot();

    let concedido = false;
    acquirePlayerSlot().then(() => (concedido = true));
    await flush();

    assert.equal(concedido, false);
    assert.equal(getPlayerSlotStats().queued, 1);
});

test('liberar un cupo se lo cede al siguiente en la cola', async () => {
    for (let i = 0; i < MAX_CONCURRENT_PLAYERS; i++) await acquirePlayerSlot();

    let concedido = false;
    acquirePlayerSlot().then(() => (concedido = true));
    await flush();

    releasePlayerSlot();
    await flush();

    assert.equal(concedido, true);
    // El cupo cambia de dueño: sigue ocupado, no se suma uno libre.
    assert.deepEqual(getPlayerSlotStats(), {
        active: MAX_CONCURRENT_PLAYERS,
        queued: 0,
        max: MAX_CONCURRENT_PLAYERS,
    });
});

test('sin nadie esperando, liberar baja el contador de activos', async () => {
    await acquirePlayerSlot();
    await acquirePlayerSlot();
    releasePlayerSlot();
    assert.equal(getPlayerSlotStats().active, 1);
});

test('liberar de más nunca deja el contador en negativo', () => {
    releasePlayerSlot();
    releasePlayerSlot();
    assert.equal(getPlayerSlotStats().active, 0);
});

test('el handle libera una sola vez aunque se llame varias', async () => {
    const handles = [];
    for (let i = 0; i < MAX_CONCURRENT_PLAYERS; i++) {
        handles.push(await acquirePlayerSlotHandle());
    }

    let concedidos = 0;
    acquirePlayerSlot().then(() => concedidos++);
    acquirePlayerSlot().then(() => concedidos++);
    await flush();

    // Un mismo player puede terminar por timeout y por 'error' casi a la vez.
    handles[0].release();
    handles[0].release();
    handles[0].release();
    await flush();

    assert.equal(concedidos, 1, 'un solo player no puede liberar dos cupos');
    assert.equal(handles[0].isHeld(), false);
    assert.equal(getPlayerSlotStats().queued, 1);
});

test('un stream colgado deja de bloquear la cola al vencer su timeout', async () => {
    // Todos los cupos ocupados por players que no responden.
    const colgados = [];
    for (let i = 0; i < MAX_CONCURRENT_PLAYERS; i++) {
        colgados.push(await acquirePlayerSlotHandle());
    }

    let arrancoElSiguiente = false;
    acquirePlayerSlotHandle().then(() => (arrancoElSiguiente = true));
    await flush();
    assert.equal(arrancoElSiguiente, false, 'con todo ocupado, el canal en cola espera');

    // Esto es lo que hace el setTimeout de STREAM_LOAD_TIMEOUT_MS en channelUI.js.
    colgados[0].release();
    await flush();

    assert.equal(arrancoElSiguiente, true, 'el timeout debe devolver el cupo a la cola');
});
