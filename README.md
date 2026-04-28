# regexlab

Explain regex patterns in plain english. Read the manual.

```
$ regexlab '\d{3}-\d{4}'
pattern: \d{3}-\d{4}

\d{3}        → a digit (0–9) exactly 3 times
-            → the literal character "-"
\d{4}        → a digit (0–9) exactly 4 times
```

## Install

```bash
npm install -g rtfm-regexlab
```

## Usage

```bash
# Explain a bare pattern
regexlab '\d{3}-\d{4}'

# Explain with flags
regexlab '/foo|bar/gi'

# JSON output for piping
regexlab --json '^[a-z]+$' | jq '.tokens'

# Help
regexlab --help
```

## What it handles

- Anchors: `^`, `$`, `\b`, `\B`
- Character classes: `\d`, `\D`, `\w`, `\W`, `\s`, `\S`, `[...]`, `[^...]`
- Quantifiers: `*`, `+`, `?`, `{n}`, `{n,}`, `{n,m}`
- Groups: capturing `(...)`, non-capturing `(?:...)`, named `(?<name>...)`
- Lookarounds: `(?=...)`, `(?!...)`, `(?<=...)`, `(?<!...)`
- Alternation: `|`
- Escapes: `\.`, `\\`, `\(`, etc.
- Backreferences: `\1` through `\9`
- Flags: `g`, `i`, `m`, `s`, `u`, `y`

## Why

You wrote a regex six months ago. You don't remember what it does. The grep manual is hostile. So is regex101 if you're offline. This explains it locally.

## Programmatic API

```javascript
import { explain, format } from 'rtfm-regexlab';

const result = explain('/^\\d{3}-\\d{4}$/g');
console.log(format(result));

// Or get structured output:
console.log(result.tokens);
// [{ token: '\\d{3}', explanation: '...' }, ...]
```

## License

MIT — part of the [vøiddo](https://voiddo.com) tools collection.
