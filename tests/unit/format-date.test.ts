import { describe, test, expect } from 'vitest';
import { formatDate } from '../../src/commands/shared';

/**
 * REQ-018: formatDate must render the LOCAL calendar date.
 *
 * The previous implementation used `toISOString()` (always UTC), so a user at
 * GMT+8 saw the previous day for every instant between local midnight and
 * 08:00. Node on Windows ignores the `TZ` environment variable, so a
 * "fixed-timezone" test cannot run portably here. Instead this suite asserts
 * equivalence with the local Date fields — that assertion is exactly what
 * separates a local-timezone implementation from a UTC one, and it fails on
 * any machine whose offset differs at the chosen instants (it demonstrably
 * fails for the old implementation on this GMT+8 machine).
 */
describe('formatDate local timezone (REQ-018)', () => {
  const localDateOf = (iso: string): string => {
    const date = new Date(iso);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  test('matches the local Date fields for instants near UTC midnight', () => {
    // 2026-09-14T16:30:00Z is 2026-09-15T00:30+08:00 — the spec's example
    // instant. Around it, UTC and GMT+8 disagree about the calendar date, so
    // a UTC implementation fails this on any GMT+8 machine (and a +08
    // implementation fails it on UTC machines — the point: it must track the
    // LOCAL fields, whatever they are).
    for (const iso of [
      '2026-09-14T16:30:00.000Z',
      '2026-09-14T15:59:00.000Z',
      '2026-09-14T20:00:00.000Z',
      '2026-09-15T00:30:00+08:00',
      '2026-01-01T00:30:00+08:00',
      '2026-12-31T23:30:00-05:00',
    ]) {
      expect(formatDate(iso)).toBe(localDateOf(iso));
    }
  });

  test('pads month and day to two digits', () => {
    // Derive the expectation from the local fields of the same instant.
    const iso = '2026-03-05T10:00:00Z';
    expect(formatDate(iso)).toBe(localDateOf(iso));
    expect(formatDate(iso)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('rejects invalid input instead of producing NaN strings', () => {
    expect(() => formatDate('not-a-date')).toThrow(RangeError);
  });
});
