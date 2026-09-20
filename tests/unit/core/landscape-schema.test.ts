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

// 含「引用数」「IPC分类」的样本：原测试夹具恰好绕开了这四个字段（REQ-005）
const richLandscape = `# 技术全景：测试主题

**检索日期**: 2026-06-15
**关键词**: alpha, beta
**时间范围**: 2021-2026
**数据源**: Google Scholar, USPTO

---

## 1. 专利文献

### [R1] US10123456B2 - A patent
- **申请人**: Google LLC
- **来源**: USPTO
- **类型**: 专利
- **申请日**: 2020-03-15
- **IPC分类**: G06N20/00, H04L9/00
- **相关度**: ⭐⭐⭐⭐⭐

## 2. 学术文献

### [R2] A paper
- **作者**: Abadi et al.
- **来源**: CCS 2016
- **类型**: 论文
- **引用数**: 2,856
- **相关度**: ⭐⭐⭐⭐
`;

describe('Landscape Schema — 曾被静默吞掉的字段（REQ-005 / REQ-049）', () => {
  test('populates type and source instead of falling back silently', () => {
    const parsed = parseLandscape(validLandscape);

    // 修复前：`类型[：:]` / `来源[：:]` 无法匹配 `**类型**:` 的粗体包裹，
    // 于是 type 恒为 'patent'（论文也被当成专利）、source 恒为 ''（REQ-049）。
    expect(parsed.entries[0].type).toBe('patent');
    expect(parsed.entries[0].source).toBe('USPTO');
    expect(parsed.entries[1].source).toBe('CNIPA');
    expect(parsed.entries[2].type).toBe('paper');
    expect(parsed.entries[2].source).toBe('CCS 2016');
  });

  test('populates applicant and authors', () => {
    const parsed = parseLandscape(validLandscape);
    // 修复前：这两个字段只在类型中声明，从未被解析（REQ-005）
    expect(parsed.entries[0].applicant).toBe('Google LLC');
    expect(parsed.entries[1].applicant).toBe('阿里巴巴');
    expect(parsed.entries[2].authors).toBe('Abadi et al.');
    // 论文没有「申请人」，保持未定义而不是空串
    expect(parsed.entries[2].applicant).toBeUndefined();
  });

  test('parses citationCount and makes totalCitations non-zero', () => {
    const parsed = parseLandscape(richLandscape);
    const paper = parsed.entries.find(e => e.id === 'R2');

    // 修复前：citationCount 从未被解析，statistics.totalCitations 恒为 0
    expect(paper?.citationCount).toBe(2856);
    expect(parsed.statistics.totalCitations).toBe(2856);
  });

  test('parses ipcCodes into an array', () => {
    const parsed = parseLandscape(richLandscape);
    const patent = parsed.entries.find(e => e.id === 'R1');

    expect(patent?.ipcCodes).toEqual(['G06N20/00', 'H04L9/00']);
  });

  test('warns explicitly when no citation data could be parsed', () => {
    const parsed = parseLandscape(validLandscape);
    const result = validateLandscape(parsed);

    expect(parsed.statistics.totalCitations).toBe(0);
    expect(result.warnings.some(w => w.includes('totalCitations is 0'))).toBe(true);
    // 警告不影响有效性判定
    expect(result.valid).toBe(true);
  });
});
