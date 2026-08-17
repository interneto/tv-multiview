#!/usr/bin/env node
/**
 * Prunes channels whose m3u8 is unusable AND that have no other signal
 * (yt_id, yt_embed, yt_playlist, twitch_id, iframe_url) to fall back to.
 * Channels with a dead m3u8 but a working fallback are kept — the player
 * switches to the fallback automatically, so removing them would throw away
 * a channel that still works. Their dead m3u8 url is dropped, though, so the
 * tile goes straight to the fallback instead of stalling until the load timeout.
 *
 * "Unusable" is the union of two checks:
 *   - check_results.json — the server did not answer at all.
 *   - cors_results.json  — it answered, but without an Access-Control-Allow-Origin
 *     the site can use. A browser cannot read that playlist, so for the published
 *     site the stream is just as dead (see tools/check_cors_channels.js).
 *
 * Usage: node tools/prune_dead_channels.js
 */

const fs = require('fs');
const path = require('path');

const CHANNELS_FILE = path.join(__dirname, '../json-tv/tv-channels.json');
const RESULTS_FILE = path.join(__dirname, '../json-tv/check_results.json');
const CORS_RESULTS_FILE = path.join(__dirname, '../json-tv/cors_results.json');
const INACTIVE_FILE = path.join(__dirname, '../json-tv/inactive.json');

function hasOtherFallback(signals) {
    if (!signals) return false;
    return Boolean(
        signals.yt_id ||
        signals.yt_embed ||
        signals.yt_playlist ||
        signals.twitch_id ||
        (Array.isArray(signals.iframe_url) && signals.iframe_url.length > 0),
    );
}

function main() {
    const channels = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));
    const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    const corsResults = fs.existsSync(CORS_RESULTS_FILE)
        ? JSON.parse(fs.readFileSync(CORS_RESULTS_FILE, 'utf8'))
        : {};
    const inactive = fs.existsSync(INACTIVE_FILE)
        ? JSON.parse(fs.readFileSync(INACTIVE_FILE, 'utf8'))
        : {};

    let pruned = 0;
    let keptWithFallback = 0;
    const retirados = [];
    for (const [id, data] of Object.entries(channels)) {
        const responde = results[id] ?? true; // sin dato -> no tocar
        const corsOk = corsResults[id] ?? true; // idem
        if (responde && corsOk) continue;

        if (hasOtherFallback(data.signals)) {
            // El m3u8 no sirve, pero el canal sí: quitamos solo la url muerta.
            if (Array.isArray(data.signals.m3u8_url)) data.signals.m3u8_url = [];
            keptWithFallback++;
            continue;
        }
        inactive[id] = data;
        delete channels[id];
        retirados.push(id);
        pruned++;
    }

    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2) + '\n', 'utf8');
    fs.writeFileSync(INACTIVE_FILE, JSON.stringify(inactive, null, 2) + '\n', 'utf8');

    console.log(`Pruned ${pruned} channels with no working signal at all -> inactive.json`);
    if (retirados.length) console.log(`  ${retirados.join(', ')}`);
    console.log(`Kept ${keptWithFallback} channels with a dead m3u8 but a working fallback signal`);
    console.log(`Remaining active channels: ${Object.keys(channels).length}`);
}

main();
