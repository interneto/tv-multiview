#!/usr/bin/env node
/**
 * Adds a YouTube fallback (signals.yt_id) to our channels by matching them
 * against Alplox/json-teles's channels.json, which tracks live YouTube
 * channel IDs per station. YouTube embeds don't hit the CORS/anti-hotlink
 * failures that scraped .m3u8 links do, so this gives channels that only
 * have a direct m3u8_url a working fallback signal.
 *
 * Only adds yt_id where we don't already have one; never touches or removes
 * existing signals. Matches by normalized channel name (ids differ between
 * the two projects).
 *
 * Usage: node tools/merge_youtube_from_json_teles.js
 */

const fs = require('fs');
const path = require('path');

const CHANNELS_FILE = path.join(__dirname, '../json-tv/tv-channels.json');
const SOURCE_URL = 'https://raw.githubusercontent.com/Alplox/json-teles/main/channels.json';

function normalizeName(name) {
    return String(name || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // quitar acentos
        .replace(/[^a-z0-9]/g, ''); // quitar espacios/puntuacion
}

async function main() {
    console.log(`Fetching ${SOURCE_URL} ...`);
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching json-teles source`);
    const source = await res.json();
    const sourceChannels = Array.isArray(source.channels) ? source.channels : [];

    const byNormalizedName = new Map();
    for (const ch of sourceChannels) {
        if (ch.youtube) byNormalizedName.set(normalizeName(ch.name), ch.youtube);
    }

    const ours = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));
    let added = 0;
    for (const [id, data] of Object.entries(ours)) {
        if (!data?.signals || data.signals.yt_id) continue; // ya tiene, no tocar
        const match = byNormalizedName.get(normalizeName(data.name || id));
        if (match) {
            data.signals.yt_id = match;
            added++;
            console.log(`+ ${id} (${data.name}) -> yt_id ${match}`);
        }
    }

    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(ours, null, 2) + '\n', 'utf8');
    console.log(`\nDone. Added yt_id fallback to ${added} of ${Object.keys(ours).length} channels.`);
}

main().catch((err) => {
    console.error('Error:', err.message || err);
    process.exit(1);
});
