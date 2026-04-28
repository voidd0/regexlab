#!/usr/bin/env node
// regexlab CLI entry point.

import { explain, format } from '../src/index.js';

const args = process.argv.slice(2);

function help() {
  console.log(`
regexlab — explain regex patterns in plain english.

  regexlab '<pattern>'         explain pattern (wrap in single quotes)
  regexlab '/<pattern>/<flags>' explain with flags
  regexlab --json '<pattern>'  output as JSON
  regexlab -h, --help          show this

examples:
  regexlab '\\\\d{3}-\\\\d{4}'
  regexlab '^[a-zA-Z0-9._-]+@example\\\\.com\$'
  regexlab '/foo|bar/gi'
`);
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
