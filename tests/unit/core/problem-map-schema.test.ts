import { describe, test, expect } from 'vitest';
import { validateProblemMap } from '../../../src/core/problem-map-schema';
import type { ProblemMap } from '../../../src/core/problem-map-schema';

const validMap: ProblemMap = {
  topic: '联邦学习差分隐私',
  generatedDate: '2026-07-15',
  problems: [
    {
      id: 'P1',
      problem: '隐私与精度权衡',
      existingSolutions: [
        { refId: 'R1', approach: '客户端噪声注入', limitation: '收敛速度慢' },
        { refId: 'R2', approach: '服务器端噪声注入', limitation: '需信任服务器' },
      ],
      unresolvedGap: '异构设备下的隐私预算分配无方案',
    },
    {
      id: 'P2',
      problem: '通信效率',
      existingSolutions: [
        { refId: 'R3', approach: '梯度压缩', limitation: '精度损失' },
        { refId: 'R1', approach: '稀疏化', limitation: '额外计算开销' },
      ],
      unresolvedGap: '差分隐私约束下的通信优化缺失',
    },
    {
      id: 'P3',
      problem: '拜占庭容错',
      existingSolutions: [
        { refId: 'R2', approach: '中位数聚合', limitation: '不支持差分隐私' },
        { refId: 'R3', approach: 'Krum算法', limitation: '与隐私机制冲突' },
      ],
      unresolvedGap: '差分隐私 + 拜占庭容错的联合方案空白',
    },
  ],
};

describe('Problem Map Schema', () => {
  test('validates a complete problem map', () => {
    const result = validateProblemMap(validMap);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('rejects insufficient problems', () => {
    const m = { ...validMap, problems: validMap.problems.slice(0, 2) };
    const result = validateProblemMap(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('insufficient problems'))).toBe(true);
  });

  test('rejects problem with insufficient solutions', () => {
    const m = {
      ...validMap,
      problems: [
        { ...validMap.problems[0], existingSolutions: [validMap.problems[0].existingSolutions[0]] },
        ...validMap.problems.slice(1),
      ],
    };
    const result = validateProblemMap(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('min 2 solutions'))).toBe(true);
  });

  test('rejects missing unresolved gap', () => {
    const m = {
      ...validMap,
      problems: [
        { ...validMap.problems[0], unresolvedGap: '' },
        ...validMap.problems.slice(1),
      ],
    };
    const result = validateProblemMap(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing unresolved gap'))).toBe(true);
  });

  test('rejects invalid reference format', () => {
    const m = {
      ...validMap,
      problems: [
        {
          ...validMap.problems[0],
          existingSolutions: [
            { refId: 'X1', approach: 'test', limitation: 'test' },
            { refId: 'R2', approach: 'test', limitation: 'test' },
          ],
        },
        ...validMap.problems.slice(1),
      ],
    };
    const result = validateProblemMap(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('invalid reference format'))).toBe(true);
  });
});
