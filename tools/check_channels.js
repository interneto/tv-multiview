// Verificaciones ligeras sobre json-tv/tv-channels.json sin dependencias externas
// Uso: node tools/check_channels.js

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'json-tv', 'tv-channels.json');

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch (e) { console.error('[ERROR] No se pudo leer tv-channels.json:', e.message); process.exit(2); }
}

function isString(v) { return typeof v === 'string'; }
function isArray(v) { return Array.isArray(v); }

function main() {
  const data = load();
  const errors = [];
  const warnings = [];

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    console.error('Raíz inválida: se esperaba objeto.');
    process.exit(1);
  }

  const keys = Object.keys(data);
  if (new Set(keys).size !== keys.length) {
    errors.push('Hay claves duplicadas (improbable en JSON parseado, revisar fuente).');
  }

  // Reglas de inspección
  for (const key of keys) {
    const ch = data[key];
    if (typeof ch !== 'object' || ch === null || Array.isArray(ch)) {
      errors.push(`'${key}': debe ser objeto.`); continue;
    }
    // name / country
    if (!isString(ch.name) || !ch.name.trim()) errors.push(`'${key}': 'name' vacío o no-string.`);
    if (!isString(ch.country) || ch.country.length < 2 || ch.country.length > 3) errors.push(`'${key}': 'country' inválido.`);

    // signals
    if (!ch.signals || typeof ch.signals !== 'object' || Array.isArray(ch.signals)) {
      errors.push(`'${key}': 'signals' debe ser objeto.`);
      continue;
    }
    const s = ch.signals;
    const hasM3u8 = 'm3u8_url' in s && isArray(s.m3u8_url) && s.m3u8_url.length > 0;
    const hasIframe = 'iframe_url' in s && isArray(s.iframe_url) && s.iframe_url.length > 0;
    if (!hasM3u8 && !hasIframe) {
      errors.push(`'${key}': 'signals' debe tener al menos una URL en m3u8_url o iframe_url.`);
    }
    // URLs vacías
    for (const k of ['m3u8_url','iframe_url']) {
      if (k in s) {
        if (!isArray(s[k])) errors.push(`'${key}': '${k}' debe ser array.`);
        else if (s[k].some(v => !isString(v) || !v.trim())) errors.push(`'${key}': '${k}' contiene entradas no-string o vacías.`);
      }
    }
    // Señales redundantes: if both arrays empty
    if ('m3u8_url' in s && isArray(s.m3u8_url) && s.m3u8_url.length === 0 &&
        'iframe_url' in s && isArray(s.iframe_url) && s.iframe_url.length === 0) {
      warnings.push(`'${key}': ambas listas (m3u8_url, iframe_url) vacías.`);
    }

    // Campos string opcionales vacíos que podrían limpiarse
    for (const opt of ['logo','website']) {
      if (opt in ch && typeof ch[opt] === 'string' && ch[opt].trim() === '') {
        warnings.push(`'${key}': '${opt}' está vacío (considera removerlo).`);
      }
    }
  }

  if (errors.length) {
    console.error(`\n❌ ${errors.length} errores:`);
    for (const e of errors) console.error(' -', e);
  }
  if (warnings.length) {
    console.warn(`\n⚠️  ${warnings.length} advertencias:`);
    for (const w of warnings) console.warn(' -', w);
  }

  if (errors.length) process.exit(1);
  console.log('\n✅ Verificación básica completada sin errores.');
  process.exit(0);
}

main();
