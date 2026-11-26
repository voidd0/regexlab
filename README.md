# regexlab

Explains a regular expression in plain English, token by token. Reach for it when you meet a pattern you did not write and want to know what it matches.

[![npm](https://img.shields.io/npm/v/@v0idd0/regexlab?color=00f6d0&labelColor=050914)](https://www.npmjs.com/package/@v0idd0/regexlab)
[![test](https://github.com/voidd0/regexlab/actions/workflows/test.yml/badge.svg)](https://github.com/voidd0/regexlab/actions/workflows/test.yml)
[![license](https://img.shields.io/badge/license-MIT-00f6d0?labelColor=050914)](LICENSE)

## Install

```bash
npm install -g @v0idd0/regexlab
```

Or run it once without installing: `npx @v0idd0/regexlab --help`. Needs Node.js 18 or newer. No dependencies.

## Example

Explain a phone-style pattern. Output from a real run on 2026-11-26:

```console
$ regexlab '^\d{3}-\d{4}$'
pattern: ^\d{3}-\d{4}$

^            → match the start of the string
\d           → a digit (0 to 9) exactly 3 times
-            → the literal character "-"
\d           → a digit (0 to 9) exactly 4 times
$            → match the end of the string
```

A pattern with flags and a lookahead:

```console
$ regexlab '/(\d{3})-(?=\d{4})/g'
pattern: /(\d{3})-(?=\d{4})/g
flags: g = global (match all occurrences, not just the first)

(\d{3})      → capturing group containing: \d
  \d         ↳ a digit (0 to 9) exactly 3 times
-            → the literal character "-"
(?=\d{4})    → positive lookahead containing: \d
  \d         ↳ a digit (0 to 9) exactly 4 times
```

## Usage

```text
regexlab: explain a regular expression in plain English

Usage:
  regexlab '<pattern>'           explain a pattern (wrap it in single quotes)
  regexlab '/<pattern>/<flags>'  explain a pattern with flags
  regexlab --json '<pattern>'    print the explanation as JSON
  regexlab -V, --version         print the version
  regexlab -h, --help            show this help

Examples:
  regexlab '\d{3}-\d{4}'
  regexlab '^[a-zA-Z0-9._-]+@example\.com$'
  regexlab '/foo|bar/gi'

Docs and issues: https://github.com/voidd0/regexlab
```

## Limits

It reads ECMAScript syntax. Plain letters are explained one character at a time, so a long literal gives one line per letter. Constructs it does not know are reported as unexplained. Add `--json` to get the same explanation as data.

## License

MIT, see [LICENSE](LICENSE).

---

Made by [vøiddo](https://voiddo.com/?src=gh). More command line tools: [voiddo.com/packages](https://voiddo.com/packages/?src=gh).
We also run data scrapers for job boards, shops and ad libraries: [voiddo.com/scrapers](https://voiddo.com/scrapers/?src=gh).
