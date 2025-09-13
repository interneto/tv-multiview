const fs = require('fs');
const path = require('path');

// Paths
const jsonFilePath = path.join(__dirname, '..', 'json-teles', 'tv-channels.json');
const nombrePaisesPath = path.join(__dirname, '..', 'assets', 'js', 'constants', 'nombrePaises.js');

function extractObjectLiteral(jsText, varName) {
  const idx = jsText.indexOf(varName);
  if (idx === -1) return null;
  const braceStart = jsText.indexOf('{', idx);
  if (braceStart === -1) return null;
  let i = braceStart;
  let depth = 0;
  for (; i < jsText.length; i++) {
    const ch = jsText[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return jsText.slice(braceStart, i + 1);
      }
    }
  }
  return null;
}

// Read nombrePaises.js and build ordered country-code list
let orderedCodes = [];
try {
  const text = fs.readFileSync(nombrePaisesPath, 'utf8');
  const objText = extractObjectLiteral(text, 'CODIGOS_PAISES');
  if (!objText) throw new Error('No CODIGOS_PAISES object found');
  // Evaluate the object literal safely using Function
  const mapping = (new Function('return ' + objText))();
  orderedCodes = Object.keys(mapping);
  console.log('Loaded', orderedCodes.length, 'country codes from nombrePaises.js');
} catch (err) {
  console.error('Error loading nombrePaises.js:', err);
}

const indexOfCode = (code) => {
  const idx = orderedCodes.indexOf(code);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
};

// Read the channels file and sort by the index of the country code in nombrePaises
try {
  const data = fs.readFileSync(jsonFilePath, 'utf8');
  const channels = JSON.parse(data);

  const entries = Object.entries(channels || {});

  entries.sort((a, b) => {
    const codeA = a[1] && a[1].country ? a[1].country : '';
    const codeB = b[1] && b[1].country ? b[1].country : '';
    const ia = indexOfCode(codeA);
    const ib = indexOfCode(codeB);
    if (ia !== ib) return ia - ib;
    // fallback: keep original order by key
    return String(a[0]).localeCompare(String(b[0]));
  });

  // Build JSON string preserving order
  let json = '{\n';
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    json += '  "' + key + '": ' + JSON.stringify(value, null, 2).replace(/\n/g, '\n  ');
    if (i < entries.length - 1) json += ',\n';
    else json += '\n';
  }
  json += '}';

  fs.writeFileSync(jsonFilePath, json, 'utf8');
  console.log('tv-channels.json sorted and written. Total entries:', entries.length);
} catch (err) {
  console.error('Error processing tv-channels.json:', err);
}
