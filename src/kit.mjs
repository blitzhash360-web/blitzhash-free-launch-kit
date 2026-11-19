// BlitzHash Free Launch Kit: data loading and rendering (zero dependencies).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const START = '<!-- kit:start (generated from data/kit.json by `npm run build`; edit the JSON, not this list) -->';
export const END = '<!-- kit:end -->';

export function loadKit(file = join(ROOT, 'data', 'kit.json')) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function slug(text) {
  // GitHub heading anchors: lowercase, drop punctuation, each space becomes a hyphen.
  return text.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/ /g, '-');
}

/** Markdown list for the README, awesome-list style. */
export function renderMarkdown(kit) {
  const out = [];
  out.push('## Contents', '');
  for (const c of kit.categories) out.push(`- [${c.name}](#${slug(c.name)})`);
  out.push('');
  for (const c of kit.categories) {
    const items = kit.entries.filter((e) => e.category === c.id);
    out.push(`## ${c.name}`, '', `${c.intro}`, '');
    for (const e of items) {
      out.push(`- [${e.name}](${e.url}) - **Free:** ${e.free} **Hits first:** ${e.hitsFirst} ([pricing](${e.pricing}))`);
    }
    out.push('');
  }
  out.push(`*${kit.entries.length} entries in ${kit.categories.length} categories. Every limit was checked against the vendor's official pricing or limits page on ${kit.lastVerified} (last verified: Nov 2026).*`);
  return out.join('\n');
}

export function syncReadme(readme, kit) {
  const a = readme.indexOf(START);
  const b = readme.indexOf(END);
  if (a < 0 || b < a) throw new Error('README is missing the kit:start / kit:end markers');
  return readme.slice(0, a + START.length) + '\n\n' + renderMarkdown(kit) + '\n\n' + readme.slice(b);
}

export function filterEntries(kit, { category, search } = {}) {
  let list = kit.entries;
  if (category) {
    const q = category.toLowerCase();
    const cat = kit.categories.find((c) => c.id === q || slug(c.name).startsWith(q) || c.name.toLowerCase().includes(q));
    if (!cat) return null;
    list = list.filter((e) => e.category === cat.id);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((e) => [e.name, e.free, e.hitsFirst].join(' ').toLowerCase().includes(q));
  }
  return list;
}

function wrap(text, width) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (line && (line + ' ' + w).length > width) { lines.push(line); line = w; }
    else line = line ? line + ' ' + w : w;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

/** Plain-text table for the terminal. */
export function renderTable(kit, entries, { width = 120, color = false } = {}) {
  const b = (s) => (color ? `\x1b[1m${s}\x1b[0m` : s);
  const g = (s) => (color ? `\x1b[32m${s}\x1b[0m` : s);
  const y = (s) => (color ? `\x1b[33m${s}\x1b[0m` : s);
  const dim = (s) => (color ? `\x1b[2m${s}\x1b[0m` : s);
  const nameW = 26;
  const colW = Math.max(24, Math.floor((width - nameW - 6) / 2));
  const out = [];
  let lastCat = '';
  for (const e of entries) {
    if (e.category !== lastCat) {
      const c = kit.categories.find((x) => x.id === e.category);
      out.push('', b(`${c.name.toUpperCase()}  `) + dim(`(${c.id})`));
      out.push(dim(`${'Tool'.padEnd(nameW)}  ${'Free'.padEnd(colW)}  Limit you hit first`));
      lastCat = e.category;
    }
    const n = wrap(e.name, nameW), f = wrap(e.free, colW), h = wrap(e.hitsFirst, colW);
    const rows = Math.max(n.length, f.length, h.length);
    for (let i = 0; i < rows; i++) {
      out.push(`${b((n[i] || '').padEnd(nameW))}  ${g((f[i] || '').padEnd(colW))}  ${y(h[i] || '')}`.trimEnd());
    }
    out.push('');
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}
