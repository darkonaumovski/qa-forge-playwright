import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
const root = fs.realpathSync(fileURLToPath(new URL('../', import.meta.url)));
const privateValues = [process.env.SITE_BYPASS_TOKEN].filter(Boolean);
const patterns = privateValues.flatMap(value => [value, Buffer.from(value).toString('base64'), encodeURIComponent(value)]).map(value => Buffer.from(value));
const findings = [];
let scanned = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || (entry.name.startsWith('.env') && entry.name !== '.env.example')) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) { walk(absolute); continue; }
    if (absolute.includes(`${path.sep}.auth${path.sep}`)) continue;
    const relative = path.relative(root, absolute);
    if (privateValues.length && /\.zip$/i.test(entry.name)) findings.push(`${relative}: unexpected archive; private traces must be disabled`);
    const contents = fs.readFileSync(absolute); scanned++;
    if (patterns.some(pattern => contents.includes(pattern))) findings.push(`${relative}: contains a configured private credential`);
    if (/-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----/.test(contents.toString('utf8'))) findings.push(`${relative}: contains private-key material`);
  }
}
walk(root);
if (findings.length) { console.error(findings.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${scanned} source/artifact files; no configured private token or private-key material found. Auth files excluded by design.`);
