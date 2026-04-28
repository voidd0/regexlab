// regexlab — smoke tests. run via `node test.js`.
import { explain } from './src/index.js';
import assert from 'node:assert';

function it(name, fn) {
  try { fn(); console.log(`  ok ${name}`); }
  catch (e) { console.error(`  FAIL ${name}: ${e.message}`); process.exitCode = 1; }
}

console.log('regexlab smoke tests');

it('plain literal', () => {
  const r = explain('foo');
  assert.equal(r.tokens.length, 3);
  assert.match(r.tokens[0].explanation, /literal character "f"/);
});

it('digits with quantifier', () => {
  const r = explain('\\d{3}');
  assert.equal(r.tokens.length, 1);
  assert.match(r.tokens[0].explanation, /digit/);
  assert.match(r.tokens[0].explanation, /exactly 3 times/);
});

it('character class with range', () => {
  const r = explain('[a-z]+');
  assert.match(r.tokens[0].explanation, /one of/);
  assert.match(r.tokens[0].explanation, /one or more/);
});

it('negated character class', () => {
  const r = explain('[^0-9]');
  assert.match(r.tokens[0].explanation, /except/);
});

it('alternation', () => {
  const r = explain('foo|bar');
  const pipeTok = r.tokens.find(t => t.token === '|');
  assert.ok(pipeTok);
  assert.match(pipeTok.explanation, /OR/);
});

it('capturing group', () => {
  const r = explain('(abc)');
  assert.match(r.tokens[0].explanation, /capturing group/);
});

it('flags parsed', () => {
  const r = explain('/foo/gi');
  assert.equal(r.flags, 'gi');
  assert.equal(r.flagsExplained.length, 2);
});

it('lookahead', () => {
  const r = explain('(?=\\d)');
  assert.match(r.tokens[0].explanation, /positive lookahead/);
});

console.log('done');
