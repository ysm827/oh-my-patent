import { describe, test, expect } from 'vitest';
import { parseLandscape, validateLandscape } from '../../../src/core/landscape-schema';

const validLandscape = `# 技术全景：联邦学习中的差分隐私保护

**检索日期**: 2026-06-15
**关键词**: federated learning, differential privacy
**时间范围**: 2021-2026
**数据源**: Google Scholar, USPTO

---

## 1. 专利文献

### [R1] US10123456B2 - Differential Privacy for Federated Learning
- **申请人**: Google LLC
- **来源**: USPTO
- **类型**: 专利
- **申请日**: 2020-03-15
- **相关度**: ⭐⭐⭐⭐⭐

### [R2] CN108234567A - 基于差分隐私的联邦学习系统
- **申请人**: 阿里巴巴
- **来源**: CNIPA
- **类型**: 专利
- **申请日**: 2021-08-20
- **相关度**: ⭐⭐⭐⭐

## 2. 学术文献

### [R3] Deep Learning with Differential Privacy
- **作者**: Abadi et al.
- **来源**: CCS 2016
- **类型**: 论文
- **相关度**: ⭐⭐⭐⭐⭐

## 统计
- 专利: 2
- 论文: 1
`;

describe('Landscape Schema', () => {
  test('parses valid landscape', () => {
    const parsed = parseLandscape(validLandscape);
    expect(parsed.meta.topic).toContain('联邦学习');
    expect(parsed.meta.keywords.length).toBeGreaterThan(0);
    expect(parsed.meta.sources.length).toBeGreaterThan(0);
    expect(parsed.entries.length).toBe(3);
    expect(parsed.entries[0].id).toBe('R1');
    expect(parsed.entries[0].relevance).toBe(5);
  });

  test('validates valid landscape without errors', () => {
    const parsed = parseLandscape(validLandscape);
    const result = validateLandscape(parsed);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('detects missing reference table', () => {
    const noRefs = '# 技术全景：测试\n**检索日期**: 2026-01-01\n**关键词**: test\n**数据源**: USPTO\n\n## 内容\n没有引用';
    const parsed = parseLandscape(noRefs);
    const result = validateLandscape(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('no entries'))).toBe(true);
  });

  test('detects non-sequential R# numbers', () => {
    const broken = `# 技术全景：测试
**检索日期**: 2026-01-01
**关键词**: test
**数据源**: USPTO

### [R1] Title A
- **来源**: USPTO
- **相关度**: ⭐⭐⭐

### [R3] Title B
- **来源**: USPTO
- **相关度**: ⭐⭐⭐
`;
    const parsed = parseLandscape(broken);
    const result = validateLandscape(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('non-sequential'))).toBe(true);
  });

  test('detects relevance out of range', () => {
    const parsed = parseLandscape(validLandscape);
    parsed.entries[0].relevance = 6;
    const result = validateLandscape(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('relevance out of range'))).toBe(true);
  });

  test('detects statistics mismatch', () => {
    const parsed = parseLandscape(validLandscape);
    parsed.statistics.patentCount = 99;
    const result = validateLandscape(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('statistics mismatch'))).toBe(true);
  });
});
