#!/usr/bin/env node
import { readFileSync as __readPkgVersion } from 'node:fs';
if (process.argv[2] === '--version' || process.argv[2] === '-V') { console.log(JSON.parse(__readPkgVersion(new URL('../package.json', import.meta.url), 'utf8')).version); process.exit(0); }
import { explain, format } from '../src/index.js';

const args = process.argv.slice(2);

function help() {
  console.log(`regexlab: explain a regular expression in plain English

Usage:
  regexlab '<pattern>'           explain a pattern (wrap it in single quotes)
  regexlab '/<pattern>/<flags>'  explain a pattern with flags
  regexlab --json '<pattern>'    print the explanation as JSON
  regexlab -V, --version         print the version
  regexlab -h, --help            show this help

Examples:
  regexlab '\\d{3}-\\d{4}'
  regexlab '^[a-zA-Z0-9._-]+@example\\.com\$'
  regexlab '/foo|bar/gi'

Docs and issues: https://github.com/voidd0/regexlab`);
}

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  help();
  process.exit(0);
}

const wantJson = args.includes('--json');
const pattern = args.find(a => !a.startsWith('--'));

if (!pattern) {
  console.error('error: no pattern given. try `regexlab --help`.');
  process.exit(1);
}

try {
  const result = explain(pattern);
  if (wantJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(format(result));
  }
} catch (err) {
  console.error(`regexlab: ${err.message}`);
  process.exit(2);
}
