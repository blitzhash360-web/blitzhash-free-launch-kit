#!/usr/bin/env node
// npx -y github:blitzhash360-web/blitzhash-free-launch-kit [category] [--search term] [--json] [--list]
import { loadKit, filterEntries, renderTable } from '../src/kit.mjs';

const args = process.argv.slice(2);
const kit = loadKit();
const flag = (name) => args.includes(name);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--search');

if (flag('--help') || flag('-h')) {
  console.log(`BlitzHash Free Launch Kit: free tiers for founders building with AI (last verified ${kit.lastVerified})

Usage:
  npx -y github:blitzhash360-web/blitzhash-free-launch-kit              all ${kit.entries.length} entries
  npx -y github:blitzhash360-web/blitzhash-free-launch-kit <category>   one category (e.g. database, email)
  npx -y github:blitzhash360-web/blitzhash-free-launch-kit --search supabase
  ... --list    list categories     ... --json    machine-readable output

Categories: ${kit.categories.map((c) => c.id).join(', ')}`);
  process.exit(0);
}

if (flag('--list')) {
  for (const c of kit.categories) {
    const n = kit.entries.filter((e) => e.category === c.id).length;
    console.log(`${c.id.padEnd(12)} ${String(n).padStart(2)}  ${c.name}`);
  }
  process.exit(0);
}

const list = filterEntries(kit, { category: positional[0], search: value('--search') });
if (list === null) {
  console.error(`Unknown category "${positional[0]}". Try: ${kit.categories.map((c) => c.id).join(', ')}`);
  process.exit(2);
}
if (flag('--json')) {
  console.log(JSON.stringify({ lastVerified: kit.lastVerified, entries: list }, null, 2));
  process.exit(0);
}
if (!list.length) { console.log('No matching entries.'); process.exit(1); }

const fc = process.env.FORCE_COLOR;
const color = fc !== undefined && fc !== '' ? fc !== '0' : (!!process.stdout.isTTY && !process.env.NO_COLOR);
const width = Math.min(Math.max(process.stdout.columns || 120, 90), 160);
console.log(`BlitzHash Free Launch Kit · ${list.length} of ${kit.entries.length} entries · limits last verified ${kit.lastVerified} (Nov 2026)`);
console.log(renderTable(kit, list, { width, color }));
console.log(`\nPricing links and sources: https://github.com/blitzhash360-web/blitzhash-free-launch-kit
Going to production? Free assessment from BlitzHash: https://blitzhash.com`);
