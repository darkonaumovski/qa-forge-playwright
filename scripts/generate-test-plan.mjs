import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const cases = JSON.parse(fs.readFileSync(new URL('docs/test-cases.json', root), 'utf8'));
const sections = new Map();
for (const item of cases) {
  const key = item.id.split('-')[1];
  if (!sections.has(key)) sections.set(key, []);
  sections.get(key).push(item);
}
const overview = fs.readFileSync(new URL('docs/test-strategy.md', root), 'utf8');
let output = `${overview}\n\n## Detailed scenario catalog\n\n${cases.length} scenarios; each runs in Chromium, Firefox and WebKit (${cases.length * 3} executions). IDs map directly to test titles and Allure labels. P1 denotes the smoke gate; P2 denotes full regression.\n\n`;
for (const [name, group] of sections) {
  output += `### ${name}\n\n`;
  for (const item of group) {
    output += `#### ${item.id} — ${item.title}\n\nPriority: **${item.priority}** · Automation: [${item.file}](../${item.file})\n\n**Preconditions:** ${item.preconditions}.\n\n`;
    output += item.steps.map((step, i) => `${i + 1}. ${step}.`).join('\n');
    output += `\n\n**Expected:** ${item.expected}.\n\n`;
  }
}
fs.writeFileSync(new URL('docs/test-plan.md', root), output.trimEnd() + '\n');
console.log(`Generated ${fileURLToPath(new URL('docs/test-plan.md', root))}`);
