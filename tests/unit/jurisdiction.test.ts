import { describe, test, expect } from 'vitest';
import {
  getJurisdictionRules,
  getClaimFormat,
  getExaminationTimeline,
  JurisdictionCode,
  SUPPORTED_JURISDICTIONS,
  isValidJurisdiction
} from '../../src/skills/jurisdiction';

describe('Jurisdiction Skill', () => {
  test('returns CN rules for CN jurisdiction', () => {
    const rules = getJurisdictionRules(JurisdictionCode.CN);
    expect(rules.country).toBe('中国');
    expect(rules.examinationType).toBe('实质审查');
    expect(rules.defaultTimeline).toBeGreaterThan(12);
  });

  test('CN claim format includes independent and dependent claims', () => {
    const format = getClaimFormat(JurisdictionCode.CN);
    expect(format.independentClaimTemplate).toContain('其特征在于');
    expect(format.dependentClaimPrefix).toContain('根据权利要求');
  });

  test('CN examination timeline is 18-36 months', () => {
    const timeline = getExaminationTimeline(JurisdictionCode.CN);
    expect(timeline.minMonths).toBe(18);
    expect(timeline.maxMonths).toBe(36);
  });

  test('throws error for unsupported jurisdiction', () => {
    expect(() => getJurisdictionRules('JP' as JurisdictionCode)).toThrow();
  });

  test('CN fees structure is defined', () => {
    const rules = getJurisdictionRules(JurisdictionCode.CN);
    expect(rules.fees).toBeDefined();
    expect(rules.fees.filing).toBeGreaterThan(0);
    expect(rules.fees.examination).toBeGreaterThan(0);
  });

  test('REQ-017: SUPPORTED_JURISDICTIONS is the single source of truth', () => {
    expect([...SUPPORTED_JURISDICTIONS]).toEqual(['CN', 'US', 'PCT']);
  });

  test('REQ-017: isValidJurisdiction accepts members and rejects EP/JP', () => {
    expect(isValidJurisdiction('CN')).toBe(true);
    expect(isValidJurisdiction('US')).toBe(true);
    expect(isValidJurisdiction('PCT')).toBe(true);
    expect(isValidJurisdiction('EP')).toBe(false);
    expect(isValidJurisdiction('JP')).toBe(false);
    expect(isValidJurisdiction('')).toBe(false);
  });
});
