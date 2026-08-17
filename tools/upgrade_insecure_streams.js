#!/usr/bin/env node
/**
 * Upgrades (or retires) plain-http m3u8 streams.
 *
 * The site is served over HTTPS and its CSP pins `media-src 'self' blob: https:`,
 * so an `http://` playlist can never play: the browser blocks it as mixed content
 * before video.js sees a single byte. Such a URL is dead weight in the list — it
 * only makes the tile fail and fall back.
 *
 * For every `http://` URL this script probes the same URL over https. If that
 * answers, the entry is upgraded in place. If it does not, the URL is dropped;
 * a channel left with no usable signal at all is moved to inactive.json.
 *
 * Usage: node tools/upgrade_insecure_streams.js [--dry-run] [--timeout=10000]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CHANNELS_FILE = path.join(__dirname, '../json-tv/tv-channels.json');
const INACTIVE_FILE = path.join(__dirname, '../json-tv/inactive.json');

const DRY_RUN = process.argv.includes('--dry-run');
const timeoutArg = process.argv.find((arg) => arg.startsWith('--timeout='));
const TIMEOUT = timeoutArg ? parseInt(timeoutArg.split('=')[1], 10) : 10000;

function probeHttps(url, timeout) {
    return new Promise((resolve) => {
        let req;
        try {
            req = https.get(url, { timeout }, (res) => {
                resolve(res.statusCode >= 200 && res.statusCode < 400);
                req.destroy();
            });
        } catch {
            resolve(false);
            return;
        }
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
    });
}

function hasUsableSignal(signals) {
    if (!signals) return false;
    return Boolean(
        (Array.isArray(signals.m3u8_url) && signals.m3u8_url.length > 0) ||
        (Array.isArray(signals.iframe_url) && signals.iframe_url.length > 0) ||
        signals.yt_id ||
        signals.yt_embed ||
        signals.yt_playlist ||
        signals.twitch_id,
    );
}

async function main() {
    const channels = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));
    const inactive = fs.existsSync(INACTIVE_FILE)
        ? JSON.parse(fs.readFileSync(INACTIVE_FILE, 'utf8'))
        : {};

    let upgraded = 0;
    let dropped = 0;
    const retired = [];

    for (const [id, data] of Object.entries(channels)) {
        const urls = data?.signals?.m3u8_url;
        if (!Array.isArray(urls) || urls.length === 0) continue;

        const kept = [];
        for (const url of urls) {
            if (!url.startsWith('http://')) {
                kept.push(url);
                continue;
            }
            const httpsUrl = 'https://' + url.slice('http://'.length);
            const ok = await probeHttps(httpsUrl, TIMEOUT);
            if (ok) {
                console.log(`↑ ${id}: ${url} -> ${httpsUrl}`);
                kept.push(httpsUrl);
                upgraded++;
            } else {
                console.log(`✗ ${id}: dropping ${url} (no https twin)`);
                dropped++;
            }
        }
        data.signals.m3u8_url = kept;

        if (!hasUsableSignal(data.signals)) {
            retired.push(id);
        }
    }

    for (const id of retired) {
        inactive[id] = channels[id];
        delete channels[id];
    }

    if (!DRY_RUN) {
        fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2) + '\n', 'utf8');
        fs.writeFileSync(INACTIVE_FILE, JSON.stringify(inactive, null, 2) + '\n', 'utf8');
    }

    console.log(`\nUpgraded to https: ${upgraded}`);
    console.log(`Dropped insecure urls: ${dropped}`);
    console.log(`Retired (no signal left) -> inactive.json: ${retired.length}`);
    if (retired.length) console.log(retired.join(', '));
    console.log(`Remaining active channels: ${Object.keys(channels).length}`);
    if (DRY_RUN) console.log('\n(dry run: nothing written)');
}

main().catch((err) => {
    console.error('Error:', err.message || err);
    process.exit(1);
});
