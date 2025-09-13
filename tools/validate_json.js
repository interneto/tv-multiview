const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const schemaPath = path.join(__dirname, '..', 'schema', 'tv-channels.schema.json');
const dataPath = path.join(__dirname, '..', 'json-teles', 'tv-channels.json');

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Error reading JSON ${filePath}: ${err.message}`);
    process.exit(2);
  }
}

function formatAjvError(err) {
  const instance = err.instancePath || '/';
  const message = err.message || '';
  return `${instance} ${message}`.trim();
}

function main() {
  const schema = loadJson(schemaPath);
  const data = loadJson(dataPath);

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const valid = validate(data);
  if (!valid) {
    console.error('Validation failed. Errors:');
    for (const err of validate.errors || []) {
      console.error('-', formatAjvError(err));
    }
    process.exit(1);
  }

  console.log('tv-channels.json is valid according to schema.');
  process.exit(0);
}

main();
