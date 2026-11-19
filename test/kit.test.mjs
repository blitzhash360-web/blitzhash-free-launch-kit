import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, loadKit, syncReadme, filterEntries, renderTable, renderMarkdown } from '../src/kit.mjs';

const kit = loadKit();
const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
const cli = join(ROOT, 'bin', 'free-launch-kit.mjs');
const run = (...args) => execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } });

test('kit.json has a verification date and a sensible size', () => {
  assert.match(kit.lastVerified, /^2026-11-\d\d$/);
  assert.ok(kit.entries.length >= 40 && kit.entries.length <= 80, `entries: ${kit.entries.length}`);
});

test('every entry is complete, https, in a known category and cites a pricing URL', () => {
  const ids = new Set(kit.categories.map((c) => c.id));
  const names = new Set();
  for (const e of kit.entries) {
    assert.ok(ids.has(e.category), `${e.name}: unknown category ${e.category}`);
    for (const k of ['name', 'url', 'pricing', 'free', 'hitsFirst']) assert.ok(e[k] && e[k].trim(), `${e.name}: missing ${k}`);
    for (const u of [e.url, e.pricing, ...(e.sources || [])]) assert.match(u, /^https:\/\/[^\s)]+$/, `${e.name}: bad URL ${u}`);
    assert.ok(!names.has(e.name), `duplicate entry ${e.name}`);
    names.add(e.name);
    assert.ok(e.free.length <= 260 && e.hitsFirst.length <= 220, `${e.name}: keep it short`);
  }
  for (const c of kit.categories) assert.ok(kit.entries.some((e) => e.category === c.id), `empty category ${c.id}`);
});

test('README list matches data/kit.json (run `npm run build` if this fails)', () => {
  assert.equal(syncReadme(readme, kit), readme);
  for (const e of kit.entries) assert.ok(readme.includes(`[${e.name}](${e.url})`), `README missing ${e.name}`);
});

test('README has the required sections and closing line', () => {
  for (const s of ['## Quick start', '## Outgrowing free tiers?', "## Going to production? What free tiers don't cover", '## Credits', 'https://github.com/ripienaar/free-for-dev', 'last verified', 'docs/screenshot.png']) {
    assert.ok(readme.includes(s), `README missing: ${s}`);
  }
  assert.ok(readme.trimEnd().endsWith('**Built by BlitzHash: need a senior team to check or scale your AI-built app? Free assessment at https://blitzhash.com**'));
});

test('no banned claims or wording anywhere in the repo', () => {
  const banned = [/24\/7/, /guarantee/i, /money[- ]back/i, /unlimited/i, /free hosting/i, /free web[- ]hosting/i, /25k hours/i, /\+1[\s-]?\(?\d{3}/];
  const files = [];
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      if (['.git', 'node_modules', 'docs'].includes(f)) continue;
      const p = join(d, f);
      statSync(p).isDirectory() ? walk(p) : files.push(p);
    }
  };
  walk(ROOT);
  for (const f of files) {
    if (f.endsWith('kit.test.mjs')) continue;
    const text = readFileSync(f, 'utf8');
    for (const re of banned) assert.ok(!re.test(text), `${relative(ROOT, f)} contains banned wording ${re}`);
  }
});

test('filtering by category id, name prefix and search works', () => {
  assert.equal(filterEntries(kit, { category: 'email' }).length, kit.entries.filter((e) => e.category === 'email').length);
  assert.ok(filterEntries(kit, { category: 'Data' }).every((e) => e.category === 'database'));
  assert.equal(filterEntries(kit, { category: 'nope' }), null);
  assert.ok(filterEntries(kit, { search: 'supabase' }).length >= 3);
});

test('table rendering is plain text without color', () => {
  const out = renderTable(kit, filterEntries(kit, { category: 'auth' }), { width: 110 });
  assert.ok(!out.includes('\x1b['));
  assert.match(out, /Limit you hit first/);
  assert.match(renderMarkdown(kit), /## Contents/);
});

test('CLI: default, category, search, json, list, unknown category', () => {
  assert.match(run(), new RegExp(`${kit.entries.length} of ${kit.entries.length} entries`));
  const db = run('database');
  assert.match(db, /DATABASES/);
  assert.match(db, /Supabase \(Free\)/);
  assert.doesNotMatch(db, /Resend/);
  assert.match(run('--search', 'resend'), /Resend/);
  const json = JSON.parse(run('email', '--json'));
  assert.ok(json.entries.length > 0 && json.entries.every((e) => e.category === 'email'));
  assert.match(run('--list'), /security/);
  assert.match(run('--help'), /Usage/);
  assert.throws(() => run('not-a-category'), /Unknown category/);
});
