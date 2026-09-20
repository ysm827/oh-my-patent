import { describe, test, expect } from 'vitest';
import { stripJsonComments, parseJsonc } from '../../src/core/jsonc';

/**
 * REQ-015: one shared JSONC parser. The e2e suite used to carry a regex-based
 * copy whose `\/\/.*$` rule truncated any string literal containing `//` —
 * an `https://` URL would have broken every parse. These tests pin the
 * string-aware behaviour that the shared implementation guarantees.
 */
describe('jsonc (REQ-015)', () => {
  test('preserves // inside string literals (URLs)', () => {
    const content = [
      '{',
      '  // config with a URL',
      '  "url": "https://open.example.com/v1/api",',
      '  "note": "a // b",',
      '  "n": 1',
      '}',
    ].join('\n');

    const parsed = parseJsonc(content) as { url: string; note: string; n: number };
    expect(parsed.url).toBe('https://open.example.com/v1/api');
    expect(parsed.note).toBe('a // b');
    expect(parsed.n).toBe(1);
  });

  test('preserves /* inside string literals and removes real block comments', () => {
    const content = `{
  /* block
     comment */
  "text": "contains /* not a comment */ here"
}`;
    const parsed = parseJsonc(content) as { text: string };
    expect(parsed.text).toBe('contains /* not a comment */ here');
  });

  test('respects escaped quotes when tracking strings', () => {
    const content = String.raw`{
  "quote": "she said \"stop // here\"",
  "n": 2
}`;
    const parsed = parseJsonc(content) as { quote: string; n: number };
    expect(parsed.quote).toBe('she said "stop // here"');
    expect(parsed.n).toBe(2);
  });

  test('stripJsonComments keeps newlines after line comments (lines stay aligned)', () => {
    const stripped = stripJsonComments('{\n// c\n"a": 1\n}');
    // The comment line becomes an empty line; the newline survives so JSON
    // error messages keep pointing at the right line.
    expect(stripped).toBe('{\n\n"a": 1\n}');
  });

  test('plugin.jsonc parses through the shared parser', () => {
    // The e2e suite covers the file too, but one direct assertion here keeps
    // this unit honest about the format the loader actually consumes.
    const parsed = parseJsonc(
      // minimal document in the shape of the real file
      '{"name": "oh-my-patent", /* x */ "version": "0.3.0"}',
    ) as { name: string; version: string };
    expect(parsed.name).toBe('oh-my-patent');
    expect(parsed.version).toBe('0.3.0');
  });
});
