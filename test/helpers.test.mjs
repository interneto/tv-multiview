// Pure-logic helper tests. Node's built-in runner, no framework, no deps:
//   node --test test/
// Import the specific helper files, NOT helpers/index.js — the barrel pulls in
// DOM-dependent siblings that would blow up under Node.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { areSimilarNames } from '../assets/js/helpers/helperSimilarNames.js';
import { M3U_A_JSON } from '../assets/js/helpers/helperM3U.js';
import { readStoredObject } from '../assets/js/helpers/helperStorage.js';

// Minimal localStorage stub (Node has no DOM). Only getItem is exercised.
const store = {};
globalThis.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
};

test('areSimilarNames: case-insensitive exact match', () => {
    assert.equal(areSimilarNames('BBC One', 'bbc one'), true);
});

test('areSimilarNames: substring either direction', () => {
    assert.equal(areSimilarNames('CNN', 'CNN International'), true);
    assert.equal(areSimilarNames('Al Jazeera English', 'al jazeera'), true);
});

test('areSimilarNames: unrelated names do not match', () => {
    assert.equal(areSimilarNames('ABC', 'NBC'), false);
});

test('areSimilarNames: non-string / nullish inputs do not throw', () => {
    assert.equal(areSimilarNames(null, undefined), true); // both coerce to '' → '' includes ''
    assert.equal(areSimilarNames(123, '12'), true);
    assert.equal(areSimilarNames('news', null), true); // '' is a substring of anything
});

test('M3U_A_JSON: parses id, country, name, logo, category and stream url', async () => {
    const m3u = [
        '#EXTM3U',
        '#EXTINF:-1 tvg-id="france24.fr" tvg-logo="http://logo/f24.png" group-title="News",France 24',
        'https://example.com/france24.m3u8',
    ].join('\n');

    const out = await M3U_A_JSON(m3u);

    assert.deepEqual(out.france24, {
        name: 'France 24',
        logo: 'http://logo/f24.png',
        signals: {
            iframe_url: [],
            m3u8_url: ['https://example.com/france24.m3u8'],
            yt_id: '',
            yt_embed: '',
            yt_playlist: '',
            twitch_id: '',
        },
        website: '',
        category: 'news',
        country: 'fr',
    });
});

test('readStoredObject: missing key returns empty object', () => {
    delete store.absent;
    assert.deepEqual(readStoredObject('absent'), {});
});

test('readStoredObject: valid JSON object is returned as-is', () => {
    store.ok = JSON.stringify({ cnn: 0 });
    assert.deepEqual(readStoredObject('ok'), { cnn: 0 });
});

test('readStoredObject: corrupt/non-object JSON falls back to empty object', () => {
    store.corrupt = '{not valid json';
    assert.deepEqual(readStoredObject('corrupt'), {});
    store.scalar = '5';
    assert.deepEqual(readStoredObject('scalar'), {});
});

test('M3U_A_JSON: skips #EXTVLCOPT lines when finding the stream url', async () => {
    const m3u = [
        '#EXTM3U',
        '#EXTINF:-1 tvg-id="dw.de",DW',
        '#EXTVLCOPT:http-user-agent=Mozilla',
        'https://example.com/dw.m3u8',
    ].join('\n');

    const out = await M3U_A_JSON(m3u);
    assert.equal(out.dw.signals.m3u8_url[0], 'https://example.com/dw.m3u8');
    assert.equal(out.dw.country, 'de');
});
