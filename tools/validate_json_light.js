// Validador ligero para json-tv/tv-channels.json sin dependencias externas
// Uso: node tools/validate_json_light.js
// Sale con código 0 si OK, 1 si hay errores

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'json-tv', 'tv-channels.json');

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error('[ERROR] No se pudo leer/parsing JSON:', file, e.message);
    process.exit(2);
  }
}

const allowedChannelProps = new Set(['name', 'logo', 'signals', 'website', 'country']);
const allowedSignalProps = new Set(['iframe_url', 'm3u8_url', 'yt_id', 'yt_embed', 'yt_playlist', 'twitch_id']);
const channelKeyRegex = /^[a-z0-9._-]+$/;

function isString(v) { return typeof v === 'string'; }
function isArray(v) { return Array.isArray(v); }

function validate() {
  const data = loadJson(DATA_PATH);
  const errors = [];

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push('El JSON raíz debe ser un objeto { ... }');
    report(errors);
  }

  for (const key of Object.keys(data)) {
    if (!channelKeyRegex.test(key)) {
      errors.push(`Canal '${key}': nombre de propiedad inválido (solo [a-z0-9._-])`);
    }
    const chan = data[key];
    if (typeof chan !== 'object' || chan === null || Array.isArray(chan)) {
      errors.push(`Canal '${key}': debe ser un objeto`);
      continue;
    }
    // Propiedades adicionales
    for (const prop of Object.keys(chan)) {
      if (!allowedChannelProps.has(prop)) {
        errors.push(`Canal '${key}': propiedad desconocida '${prop}'`);
      }
    }
    // Requeridos
    for (const req of ['name', 'signals', 'country']) {
      if (!(req in chan)) errors.push(`Canal '${key}': falta propiedad requerida '${req}'`);
    }
    if ('name' in chan && (!isString(chan.name) || chan.name.trim().length === 0)) {
      errors.push(`Canal '${key}': 'name' debe ser string no vacío`);
    }
    if ('country' in chan) {
      if (!isString(chan.country) || chan.country.length < 2 || chan.country.length > 3) {
        errors.push(`Canal '${key}': 'country' debe ser string (2-3 chars)`);
      }
    }
    if ('signals' in chan) {
      const sig = chan.signals;
      if (typeof sig !== 'object' || sig === null || Array.isArray(sig)) {
        errors.push(`Canal '${key}': 'signals' debe ser un objeto`);
      } else {
        // additionalProperties false
        for (const sKey of Object.keys(sig)) {
          if (!allowedSignalProps.has(sKey)) {
            errors.push(`Canal '${key}': signals propiedad desconocida '${sKey}'`);
          }
        }
        // anyOf: requiere m3u8_url o iframe_url
        if (!('m3u8_url' in sig) && !('iframe_url' in sig)) {
          errors.push(`Canal '${key}': 'signals' requiere 'm3u8_url' o 'iframe_url'`);
        }
        // Arrays de strings
        for (const arrKey of ['m3u8_url', 'iframe_url']) {
          if (arrKey in sig) {
            if (!isArray(sig[arrKey])) {
              errors.push(`Canal '${key}': '${arrKey}' debe ser array`);
            } else {
              for (const [idx, val] of sig[arrKey].entries()) {
                if (!isString(val)) {
                  errors.push(`Canal '${key}': '${arrKey}[${idx}]' debe ser string`);
                }
              }
            }
          }
        }
        // Campos string simples opcionales
        for (const simple of ['yt_id', 'yt_embed', 'yt_playlist', 'twitch_id']) {
          if (simple in sig && !isString(sig[simple])) {
            errors.push(`Canal '${key}': '${simple}' debe ser string`);
          }
        }
      }
    }
  }

  report(errors);
}

function report(errors) {
  if (errors.length) {
    console.error(`\n❌ Validación falló (${errors.length} errores):`);
    for (const e of errors) console.error('-', e);
    process.exit(1);
  } else {
    console.log('✅ tv-channels.json válido según validación ligera.');
    process.exit(0);
  }
}

validate();
