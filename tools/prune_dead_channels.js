#!/usr/bin/env node
/**
 * Prunes channels whose m3u8 failed the health check (check_results.json)
 * AND have no other usable signal (yt_id, yt_embed, yt_playlist, twitch_id,
 * iframe_url) to fall back to. Channels with a dead m3u8 but a working
 * fallback are kept — the player now switches to the fallback automatically,
 * so removing them would throw away a channel that still works.
 *
 * Usage: node tools/prune_dead_channels.js
 */

const fs = require('fs');
const path = require('path');

const CHANNELS_FILE = path.join(__dirname, '../json-tv/tv-channels.json');
const RESULTS_FILE = path.join(__dirname, '../json-tv/check_results.json');
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
    const inactive = fs.existsSync(INACTIVE_FILE)
        ? JSON.parse(fs.readFileSync(INACTIVE_FILE, 'utf8'))
        : {};

    let pruned = 0;
    let keptWithFallback = 0;
    for (const [id, data] of Object.entries(channels)) {
        const m3u8Ok = results[id] ?? true; // sin dato -> no tocar
        if (m3u8Ok) continue;
        if (hasOtherFallback(data.signals)) {
            keptWithFallback++;
            continue;
        }
        inactive[id] = data;
        delete channels[id];
        pruned++;
    }

    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2) + '\n', 'utf8');
    fs.writeFileSync(INACTIVE_FILE, JSON.stringify(inactive, null, 2) + '\n', 'utf8');

    console.log(`Pruned ${pruned} channels with no working signal at all -> inactive.json`);
    console.log(`Kept ${keptWithFallback} channels with a dead m3u8 but a working fallback signal`);
    console.log(`Remaining active channels: ${Object.keys(channels).length}`);
}

main();
