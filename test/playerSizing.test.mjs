// Guardia contra la regresión de tamaño del reproductor.
//
// Un conflicto de modos de dimensionado de video.js (`fluid` peleando con el
// wrapper .ratio de Bootstrap) dejó a todos los players decodificando y
// reproduciendo con altura 0: readyState y currentTime eran correctos, solo la
// caja renderizada estaba vacía. Comprobar eso de verdad exige medir
// getBoundingClientRect() en un navegador real, y aquí no hay layout: jsdom
// devuelve 0 en todas las medidas, así que un test de altura sería falso verde.
//
// Lo que sí se puede fijar en CI es la causa: la combinación de opciones que
// provocó el fallo. Si alguien vuelve a activar `fluid`, esto lo para.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../assets/js/channelUI.js', import.meta.url), 'utf8');

test('el player se dimensiona con fill, nunca con fluid', () => {
    assert.match(source, /fill:\s*true/, 'createVideoPlayer debe pasar fill: true');
    assert.doesNotMatch(
        source,
        /^\s*fluid:\s*true/m,
        'fluid pelea con el wrapper .ratio y deja el player a altura 0',
    );
});

test('el contenedor del player conserva el wrapper de proporción', () => {
    // Es quien da la altura: sin él, `fill: true` llena una caja de 0px.
    assert.match(source, /classList\.add\(\s*'ratio',\s*'ratio-16x9',\s*'h-100'\s*\)/);
});

test('el <video> lleva la clase vjs-fill que acompaña a fill: true', () => {
    assert.match(source, /'vjs-fill'/);
});
