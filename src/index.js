// regexlab — explain regex patterns in plain english.
//
// pure parser. no external deps. handles common ECMAScript regex constructs:
// anchors, character classes, quantifiers, groups, alternation, backreferences,
// lookarounds, escape sequences. unknown constructs degrade to "unexplained".

const NAMED_CHARCLASSES = {
  '\\d': 'a digit (0–9)',
  '\\D': 'a non-digit',
  '\\w': 'a word character (letter, digit, or underscore)',
  '\\W': 'a non-word character',
  '\\s': 'a whitespace character',
  '\\S': 'a non-whitespace character',
  '\\b': 'a word boundary',
  '\\B': 'a non-word boundary',
  '\\n': 'a newline',
  '\\r': 'a carriage return',
  '\\t': 'a tab',
  '\\0': 'a null character',
  '.': 'any character (except newline)',
};

const ANCHORS = {
  '^': 'the start of the string',
  '$': 'the end of the string',
};

function parseQuantifier(src, i) {
  if (i >= src.length) return null;
  const ch = src[i];
  if (ch === '*') return { kind: 'q', text: '*', meaning: 'zero or more times', advance: 1 };
  if (ch === '+') return { kind: 'q', text: '+', meaning: 'one or more times', advance: 1 };
  if (ch === '?') return { kind: 'q', text: '?', meaning: 'optional (zero or one time)', advance: 1 };
  if (ch === '{') {
    const end = src.indexOf('}', i);
    if (end === -1) return null;
    const body = src.slice(i + 1, end);
    if (/^\d+$/.test(body)) {
      return { kind: 'q', text: `{${body}}`, meaning: `exactly ${body} times`, advance: end - i + 1 };
    }
    const m = body.match(/^(\d+),(\d*)$/);
    if (m) {
      const lo = m[1], hi = m[2];
      const meaning = hi === ''
        ? `at least ${lo} times`
        : `between ${lo} and ${hi} times`;
      return { kind: 'q', text: `{${body}}`, meaning, advance: end - i + 1 };
    }
  }
  return null;
}

function parseCharClass(src, i) {
  if (src[i] !== '[') return null;
  let end = i + 1;
  if (src[end] === '^') end++;
  while (end < src.length && src[end] !== ']') {
    if (src[end] === '\\') end += 2;
    else end++;
  }
  if (end >= src.length) return null;
  const body = src.slice(i + 1, end);
  const negated = body.startsWith('^');
  const inside = negated ? body.slice(1) : body;
  const parts = [];
  let j = 0;
  while (j < inside.length) {
    if (inside[j] === '\\') {
      const esc = inside.slice(j, j + 2);
      parts.push(NAMED_CHARCLASSES[esc] || `the character "${esc}"`);
      j += 2;
    } else if (inside[j + 1] === '-' && j + 2 < inside.length) {
      parts.push(`characters from "${inside[j]}" to "${inside[j + 2]}"`);
      j += 3;
    } else {
      parts.push(`the character "${inside[j]}"`);
      j += 1;
    }
  }
  const meaning = (negated ? 'any character except: ' : 'one of: ') + parts.join(', ');
  return { kind: 'cc', text: src.slice(i, end + 1), meaning, advance: end - i + 1 };
}

function parseGroup(src, i) {
  if (src[i] !== '(') return null;
  // Match closing paren with depth.
  let depth = 1;
  let j = i + 1;
  while (j < src.length && depth > 0) {
    if (src[j] === '\\') { j += 2; continue; }
    if (src[j] === '(') depth++;
    else if (src[j] === ')') depth--;
    if (depth === 0) break;
    j++;
  }
  if (depth !== 0) return null;
  const inner = src.slice(i + 1, j);
  let kind = 'capturing group';
  let consumeStart = 0;
  if (inner.startsWith('?:')) { kind = 'non-capturing group'; consumeStart = 2; }
  else if (inner.startsWith('?=')) { kind = 'positive lookahead'; consumeStart = 2; }
  else if (inner.startsWith('?!')) { kind = 'negative lookahead'; consumeStart = 2; }
  else if (inner.startsWith('?<=')) { kind = 'positive lookbehind'; consumeStart = 3; }
  else if (inner.startsWith('?<!')) { kind = 'negative lookbehind'; consumeStart = 3; }
  else if (inner.startsWith('?<')) {
    const close = inner.indexOf('>');
    if (close > 0) {
      const name = inner.slice(2, close);
      kind = `named capturing group "${name}"`;
      consumeStart = close + 1;
    }
  }
  const body = inner.slice(consumeStart);
  return { kind: 'g', subKind: kind, text: src.slice(i, j + 1), inner: body, advance: j - i + 1 };
}

export function explain(pattern) {
  // Strip leading/trailing slash and trailing flags if present (e.g. /foo/i).
  let src = pattern;
  let flags = '';
  const m = src.match(/^\/(.*)\/([gimsuy]*)$/);
  if (m) { src = m[1]; flags = m[2]; }

  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    // Anchors
    if (ANCHORS[ch] && (i === 0 || ch === '$')) {
      out.push({ token: ch, explanation: `match ${ANCHORS[ch]}` });
      i += 1;
      continue;
    }

    // Alternation
    if (ch === '|') {
      out.push({ token: '|', explanation: 'OR — match either side of this' });
      i += 1;
      continue;
    }

    // Escape
    if (ch === '\\') {
      const esc = src.slice(i, i + 2);
      let meaning = NAMED_CHARCLASSES[esc] || `the literal character "${esc[1]}"`;
      // Backref \1 .. \9
      if (/^\\[1-9]$/.test(esc)) {
        meaning = `back-reference to capturing group ${esc[1]}`;
      }
      const q = parseQuantifier(src, i + 2);
      out.push({ token: esc, explanation: q ? `${meaning} ${q.meaning}` : meaning });
      i += 2 + (q ? q.advance : 0);
      continue;
    }

    // Character class
    if (ch === '[') {
      const cc = parseCharClass(src, i);
      if (cc) {
        const q = parseQuantifier(src, i + cc.advance);
        const meaning = q ? `${cc.meaning}, ${q.meaning}` : cc.meaning;
        out.push({ token: cc.text + (q ? q.text : ''), explanation: meaning });
        i += cc.advance + (q ? q.advance : 0);
        continue;
      }
    }

    // Group
    if (ch === '(') {
      const g = parseGroup(src, i);
      if (g) {
        const inner = explain(g.inner);
        const q = parseQuantifier(src, i + g.advance);
        const innerSummary = inner.tokens.map(t => t.token).join('');
        let meaning = `${g.subKind} containing: ${innerSummary || '(empty)'}`;
        if (q) meaning += `, ${q.meaning}`;
        out.push({
          token: g.text + (q ? q.text : ''),
          explanation: meaning,
          children: inner.tokens,
        });
        i += g.advance + (q ? q.advance : 0);
        continue;
      }
    }

    // Dot
    if (ch === '.') {
      const q = parseQuantifier(src, i + 1);
      const meaning = q ? `${NAMED_CHARCLASSES['.']}, ${q.meaning}` : NAMED_CHARCLASSES['.'];
      out.push({ token: ch + (q ? q.text : ''), explanation: meaning });
      i += 1 + (q ? q.advance : 0);
      continue;
    }

    // Literal
    const q = parseQuantifier(src, i + 1);
    const meaning = q
      ? `the literal character "${ch}", ${q.meaning}`
      : `the literal character "${ch}"`;
    out.push({ token: ch + (q ? q.text : ''), explanation: meaning });
    i += 1 + (q ? q.advance : 0);
  }

  const flagMeanings = {
    g: 'global (match all occurrences, not just the first)',
    i: 'case-insensitive',
    m: 'multiline (^/$ match line boundaries)',
    s: 'dotall (. also matches newlines)',
    u: 'unicode',
    y: 'sticky (match starting from lastIndex)',
  };
  const flagsExplained = flags
    ? flags.split('').map(f => `${f} = ${flagMeanings[f] || 'unknown flag'}`)
    : [];

  return { source: pattern, flags, tokens: out, flagsExplained };
}

export function format(result, indent = 0) {
  const pad = ' '.repeat(indent * 2);
  const lines = [];
  if (indent === 0) {
    lines.push(`pattern: ${result.source}`);
    if (result.flagsExplained.length > 0) {
      lines.push(`flags: ${result.flagsExplained.join('; ')}`);
    }
    lines.push('');
  }
  for (const tok of result.tokens) {
    lines.push(`${pad}${tok.token.padEnd(12)} → ${tok.explanation}`);
    if (tok.children) {
      for (const c of tok.children) {
        lines.push(`${pad}  ${c.token.padEnd(10)} ↳ ${c.explanation}`);
      }
    }
  }
  return lines.join('\n');
}
