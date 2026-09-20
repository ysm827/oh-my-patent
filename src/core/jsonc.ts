/**
 * JSONC (JSON with Comments) parsing — the single implementation.
 *
 * Before REQ-015 there were three independent copies: this module,
 * `init-checker.ts` and the e2e plugin-load test (the latter a regex-based
 * version that truncated any string literal containing `//`, such as an
 * `https://` URL). Everyone now imports from here.
 *
 * The comment stripper is stateful rather than regex-based so it can tell a
 * comment opener from the same two characters inside a string literal.
 * Trailing commas are deliberately NOT removed: the configuration files this
 * parser serves (`plugin.jsonc`, `codex.json`, `opencode.jsonc`) are written
 * without them, and silently accepting them would mask real syntax errors.
 */

/** Remove `//` line comments and block comments, respecting string literals. */
export function stripJsonComments(content: string): string {
  let result = '';
  let index = 0;
  let inString = false;

  while (index < content.length) {
    const current = content[index];
    const next = content[index + 1];

    if (inString) {
      result += current;
      if (current === '\\') {
        // Preserve escaped characters verbatim (`\"` must not end the string).
        index++;
        if (index < content.length) result += content[index];
      } else if (current === '"') {
        inString = false;
      }
      index++;
    } else if (current === '"') {
      inString = true;
      result += current;
      index++;
    } else if (current === '/' && next === '/') {
      // Line comment — skip to end of line (the newline itself is kept).
      while (index < content.length && content[index] !== '\n') index++;
    } else if (current === '/' && next === '*') {
      // Block comment — skip to the closing `*/`.
      index += 2;
      while (index < content.length - 1 && !(content[index] === '*' && content[index + 1] === '/')) index++;
      index += 2;
    } else {
      result += current;
      index++;
    }
  }

  return result;
}

/** Parse JSONC content and return the decoded value. */
export function parseJsonc(content: string): unknown {
  return JSON.parse(stripJsonComments(content));
}
