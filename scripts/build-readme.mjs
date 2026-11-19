#!/usr/bin/env node
// Regenerates the list in README.md from data/kit.json. `--check` exits 1 if README is out of date.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadKit, syncReadme } from '../src/kit.mjs';

const file = join(ROOT, 'README.md');
const current = readFileSync(file, 'utf8');
const next = syncReadme(current, loadKit());
if (process.argv.includes('--check')) {
  if (next !== current) { console.error('README.md is out of date. Run: npm run build'); process.exit(1); }
  console.log('README.md matches data/kit.json');
} else {
  writeFileSync(file, next);
  console.log('README.md updated from data/kit.json');
}
