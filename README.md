# regexlab

[![npm version](https://img.shields.io/npm/v/@v0idd0/regexlab.svg?color=A0573A)](https://www.npmjs.com/package/@v0idd0/regexlab)
[![npm downloads](https://img.shields.io/npm/dw/@v0idd0/regexlab.svg?color=1F1A14)](https://www.npmjs.com/package/@v0idd0/regexlab)
[![License: MIT](https://img.shields.io/badge/license-MIT-A0573A.svg)](LICENSE)
[![Node ≥14](https://img.shields.io/badge/node-%E2%89%A514-1F1A14)](package.json)

**[Homepage](https://tools.voiddo.com/regexlab/?ref=regexlab-readme)** · **[GitHub](https://github.com/voidd0/regexlab)** · **[npm](https://www.npmjs.com/package/@v0idd0/regexlab)** · **[All tools](https://tools.voiddo.com/?ref=regexlab-catalog-readme)** · **[Contact](mailto:support@voiddo.com)**

---

Explain regex patterns in plain english. Read the manual.

```
$ regexlab '\d{3}-\d{4}'
pattern: \d{3}-\d{4}

\d{3}        → a digit (0-9) exactly 3 times
-            → the literal character "-"
\d{4}        → a digit (0-9) exactly 4 times
```

## Why regexlab

You wrote a regex six months ago. You don't remember what it does. Today's reviewer wants you to explain it. Stack Overflow answers from 2014 paraphrase, regex101 wants your network and your eyes, and the real `man re_format(7)` is hostile if you only need it twice a year. regexlab is the explainer that lives in your terminal, local, offline-capable, no popovers.

## Install

```bash
npm install -g @v0idd0/regexlab
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

## What teams use it for

- code reviews: quickly document what a new regex actually matches before approving a PR
- CI and linting: output deterministic token explanations to include in PR logs
- incident response: explain opaque alert patterns under time pressure
- onboarding: create a quick glossary of regex tokens for teammates

### vs regex101.com and friends

`regexlab` and online testers solve different tasks:

- Use **regexlab** when you need a deterministic, offline explanation of pattern syntax.
- Use **regex testers** when you need live sample matching, capture groups, or multi-engine behavior.

Use `--json` when you want stable machine output for docs or scripts, and run it twice if you need a quick local pattern diff.

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

## Compared to alternatives

| tool | offline? | network IO | per-token explanation | regex101-style match testing |
|---|---|---|---|---|
| regexlab | yes | none | yes | optional via API |
| regex101.com | no | tracks input | yes | yes (web) |
| regexr.com | no | tracks input | yes | yes (web) |
| `pcregrep --explain` | yes | none | terse | no |
| ChatGPT/Claude | depends | sends pattern | conversational | manual |

If you're authoring a long regex and want hover-to-test feedback, regex101 is unbeatable. If you're explaining a regex *in your terminal* (in a code review, in a hook, on a server you SSHed into), regexlab is the one that fits the workflow.

## FAQ

**Does it actually run the regex against test strings?** Only via the programmatic API (returns matches if you pass a `subject` string). The CLI is explanation-only because that's the dominant use case.

**Is it accurate on PCRE-only features?** Most of what JavaScript's RegExp supports is the safe subset. Lookbehinds, named groups, atomic groups, covered. `\K` and balanced groups (.NET) are explicitly out of scope and the parser will say so.

**Why doesn't it suggest a "better" regex?** Because "better" depends on whether you're optimizing for readability, backtracking safety, or one of nine character-class alternatives. Static suggestions miss the point, regexlab explains, doesn't editorialize.

**Will it choke on a 4KB regex?** Try us. The tokenizer is recursive descent and has been fed several embarrassingly large captcha-bypass regexes in testing. The output gets long before the tool gets slow.

## Programmatic API

```javascript
import { explain, format } from '@v0idd0/regexlab';

const result = explain('/^\\d{3}-\\d{4}$/g');
console.log(format(result));

// Or get structured output:
console.log(result.tokens);
// [{ token: '\\d{3}', explanation: '...' }, ...]
```

## License

MIT.

---

Maintained by v0idd0.
