/**
 * REQ-028: ScoreBar clamping.
 *
 * The historical inline computation `'█'.repeat(Math.round(score))` threw
 * `RangeError` for any score outside [0, max] — the acceptance criteria name
 * 12 and -1. The bar logic is extracted to `scoreBarString` so it can be
 * asserted without rendering the Ink component.
 */
import { describe, expect, test } from 'vitest';
import { scoreBarString } from '../../src/tui/app';

describe('scoreBarString clamps out-of-range scores (REQ-028)', () => {
  test('accepts 12 (above max) without throwing', () => {
    expect(() => scoreBarString(12)).not.toThrow();
    expect(scoreBarString(12)).toBe('█'.repeat(10));
  });

  test('accepts -1 (negative) without throwing', () => {
    expect(() => scoreBarString(-1)).not.toThrow();
    expect(scoreBarString(-1)).toBe('░'.repeat(10));
  });

  test('accepts NaN and custom max without throwing', () => {
    expect(() => scoreBarString(NaN)).not.toThrow();
    expect(scoreBarString(NaN)).toBe('░'.repeat(10));
    expect(() => scoreBarString(5, 0)).not.toThrow();
    expect(scoreBarString(12, 4)).toBe('█'.repeat(4));
  });

  test('in-range values are unchanged', () => {
    expect(scoreBarString(3)).toBe('███' + '░'.repeat(7));
    expect(scoreBarString(0)).toBe('░'.repeat(10));
    expect(scoreBarString(10)).toBe('█'.repeat(10));
  });
});
