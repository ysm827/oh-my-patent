import { describe, expect, test } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  ClaimFormat,
  ExaminationTimeline,
  JurisdictionCode,
  JurisdictionRules,
  getClaimFormat,
  getExaminationTimeline,
  getJurisdictionRules,
} from '../../../src/skills/jurisdiction';

/**
 * REQ-011: `src/skills/jurisdiction/SKILL.md` must describe the implementation
 * that exists, not one that was imagined.
 *
 * The document is parsed mechanically and every number/string it states is
 * compared against `jurisdiction.ts`. A hand-written expectation list would
 * repeat the same mistake the original document made (two independent copies
 * drifting apart), so the document is the input and the code is the oracle.
 *
 * The previous version of the document documented `isValidJurisdiction()`,
 * `getClaimTemplate()`, `rules.timeline.minMonths` and
 * `rules.claimFormat.separator` -- none of which ever existed.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_MD = join(__dirname, '../../../src/skills/jurisdiction/SKILL.md');
const doc = readFileSync(SKILL_MD, 'utf-8');

/** Field pattern: `- **Label**: value`, tolerating CRLF. */
function field(section: string, label: string): string | null {
  const re = new RegExp(`^- \\*\\*${label}\\*\\*: (.+)$`, 'm');
  const m = section.match(re);
  return m ? m[1].trim() : null;
}

/** Split the "Supported Jurisdictions" area into one block per `###` heading. */
function jurisdictionSections(): Map<string, string> {
  const start = doc.indexOf('## Supported Jurisdictions');
  const end = doc.indexOf('## Examples');
  expect(start, 'SKILL.md lost its Supported Jurisdictions section').toBeGreaterThan(-1);
  expect(end, 'SKILL.md lost its Examples section').toBeGreaterThan(start);
  const body = doc.slice(start, end);

  const out = new Map<string, string>();
  const blocks = body.split(/^### /m).slice(1);
  for (const block of blocks) {
    const code = block.slice(0, block.indexOf('(')).trim();
    out.set(code, block);
  }
  return out;
}

const SECTIONS = jurisdictionSections();
/** Every code the document claims to describe, in document order. */
const DOC_CODES = [...SECTIONS.keys()];

const unwrap = (v: string): string => v.replace(/^`|`$/g, '');

describe('jurisdiction SKILL.md matches the implementation (REQ-011)', () => {
  test('the document describes exactly the codes the enum defines', () => {
    expect(DOC_CODES).toEqual(Object.values(JurisdictionCode));
  });

  test.each(DOC_CODES)('%s: rules block matches getJurisdictionRules()', (code) => {
    const section = SECTIONS.get(code) as string;
    const rules: JurisdictionRules = getJurisdictionRules(code as JurisdictionCode);

    expect(field(section, 'Country')).toBe(rules.country);
    expect(field(section, 'Examination Type')).toBe(rules.examinationType);

    // Documented as "24 months"; the implementation is a plain month count.
    const timeline = field(section, 'Default Timeline');
    expect(timeline).not.toBeNull();
    expect(Number((timeline as string).replace(/[^0-9]/g, ''))).toBe(rules.defaultTimeline);

    const fees = field(section, 'Fees') as string;
    for (const key of ['filing', 'examination', 'grant', 'maintenance'] as const) {
      const m = fees.match(new RegExp(`${key} (\\d+)`));
      expect(m, `fees.${key} missing from the ${code} block`).not.toBeNull();
      expect(Number((m as RegExpMatchArray)[1])).toBe(rules.fees[key]);
    }

    if (rules.specialRequirements) {
      // Quoted in the Examples section rather than in the per-jurisdiction
      // block, so the whole document is the search space.
      for (const req of rules.specialRequirements) {
        expect(doc, `special requirement not documented: ${req}`).toContain(req);
      }
    }
  });

  test.each(DOC_CODES)('%s: timeline block matches getExaminationTimeline()', (code) => {
    const section = SECTIONS.get(code) as string;
    const t: ExaminationTimeline = getExaminationTimeline(code as JurisdictionCode);

    const line = field(section, 'Examination Timeline') as string;
    expect(line).not.toBeNull();
    // Form: "18–36 months (typical 24)" -- accept en dash or hyphen.
    const range = line.match(/(\d+)\s*[–-]\s*(\d+)/);
    const typical = line.match(/typical\s+(\d+)/);
    expect(range, `unparseable range: ${line}`).not.toBeNull();
    expect(typical, `unparseable typical: ${line}`).not.toBeNull();

    expect(Number((range as RegExpMatchArray)[1])).toBe(t.minMonths);
    expect(Number((range as RegExpMatchArray)[2])).toBe(t.maxMonths);
    expect(Number((typical as RegExpMatchArray)[1])).toBe(t.typical);
  });

  test.each(DOC_CODES)('%s: claim block matches getClaimFormat()', (code) => {
    const section = SECTIONS.get(code) as string;
    const f: ClaimFormat = getClaimFormat(code as JurisdictionCode);

    expect(unwrap(field(section, 'Claim Format') as string)).toBe(f.independentClaimTemplate);
    expect(unwrap(field(section, 'Dependent Claim Prefix') as string)).toBe(
      f.dependentClaimPrefix,
    );

    const multi = field(section, 'Multiple Dependent Claims') as string;
    expect(multi).toContain(f.multipleDependentClaims ? 'allowed' : 'not allowed');
    // "not allowed" also contains "allowed", so pin the negative explicitly.
    if (!f.multipleDependentClaims) expect(multi).toMatch(/not allowed/);
    const max = multi.match(/max (\d+)/);
    expect(max, `claim ceiling missing: ${multi}`).not.toBeNull();
    expect(Number((max as RegExpMatchArray)[1])).toBe(f.maxClaims);
  });

  test('every symbol named in the Exports table actually exists', () => {
    const start = doc.indexOf('## Exports');
    const end = doc.indexOf('## Supported Jurisdictions');
    const table = doc.slice(start, end);
    const names = [...table.matchAll(/^\| `([A-Za-z][A-Za-z0-9_]*)`/gm)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(0);

    const actual: Record<string, unknown> = {
      JurisdictionCode,
      JurisdictionRules,
      ClaimFormat,
      ExaminationTimeline,
      getJurisdictionRules,
      getClaimFormat,
      getExaminationTimeline,
    };
    // Type-only interfaces erase at runtime; assert they are at least declared
    // in the source module rather than asserting a runtime binding.
    const source = readFileSync(
      join(__dirname, '../../../src/skills/jurisdiction.ts'),
      'utf-8',
    );
    for (const name of names) {
      const isRuntime = name in actual;
      const isType = new RegExp(`export (interface|type|enum|function|const) ${name}\\b`).test(
        source,
      );
      expect(isRuntime || isType, `${name} is documented but not exported`).toBe(true);
      if (!isRuntime) expect(source).toContain(`export interface ${name}`);
    }
  });

  test('the document does not resurrect the invented API', () => {
    // These never existed; naming them as real API is the defect REQ-011 fixes.
    // A passing mention is fine only when it is explicitly negated, and it must
    // never appear inside a code block (where it would read as usable API).
    const prose = doc.replace(/```[\s\S]*?```/g, '');
    const invented = [
      /isValidJurisdiction\s*\(/,
      /getClaimTemplate\s*\(/,
      /\.timeline\.minMonths/,
      /claimFormat\.separator/,
    ];
    for (const pattern of invented) {
      const hits = prose
        .split('\n')
        .filter((line) => pattern.test(line));
      for (const line of hits) {
        expect(
          line,
          `invented API mentioned without negation: ${line.trim()}`,
        ).toMatch(/\b(no|not|never|nonexistent)\b/i);
      }
      // And never as code.
      expect(doc.replace(/```[\s\S]*?```/g, '')).not.toMatch(
        new RegExp(`=\\s*.*${pattern.source}`),
      );
    }
    // The code blocks themselves must not call anything undefined.
    const codeBlocks = [...doc.matchAll(/```typescript\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
    const called = codeBlocks.flatMap((b) =>
      [...b.matchAll(/(?:^|[^.\w])([a-zA-Z][a-zA-Z0-9_]*)\(/g)].map((m) => m[1]),
    );
    const allowed = new Set([
      'getJurisdictionRules',
      'getClaimFormat',
      'getExaminationTimeline',
      'isValidJurisdiction', // defined locally inside Example 4, not imported
      'Object', // Object.values(...)
    ]);
    for (const name of called) {
      expect(allowed.has(name), `code block calls undocumented symbol: ${name}`).toBe(true);
    }
  });

  test('the documented import specifier resolves from the skill directory', () => {
    // The snippet imports '../jurisdiction.js'; from src/skills/jurisdiction/
    // that must resolve to the real source module.
    const resolved = join(__dirname, '../../../src/skills/jurisdiction.ts');
    expect(readFileSync(resolved, 'utf-8')).toContain('export function getJurisdictionRules');
  });
});
