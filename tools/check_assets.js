const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
const matches = [...html.matchAll(scriptRegex)].map(m=>m[1]);
const missing = [];
for (const src of matches) {
  if (src.startsWith('http') || src.startsWith('//')) continue;
  const p = path.join(__dirname,'..',src).replace(/\\/g,'\\\\');
  if (!fs.existsSync(p)) missing.push(src);
}
console.log('scripts found:', matches.length);
console.log('missing local scripts:', missing.length>0 ? missing : 'none');
