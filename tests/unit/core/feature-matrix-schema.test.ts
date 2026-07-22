import { describe, test, expect } from 'vitest';
import { parseFeatureMatrix, validateFeatureMatrix } from '../../../src/core/feature-matrix-schema';
import type { FeatureMatrix } from '../../../src/core/feature-matrix-schema';

const validMatrix: FeatureMatrix = {
  topic: '联邦学习差分隐私',
  generatedDate: '2026-07-15',
  features: [
    { id: 'F1', name: '客户端噪声注入', category: '架构', description: '在客户端梯度添加噪声' },
    { id: 'F2', name: '服务器端噪声注入', category: '架构', description: '服务器聚合时添加噪声' },
    { id: 'F3', name: '隐私预算管理', category: '算法', description: '跟踪累积隐私损失' },
    { id: 'F4', name: '异构设备支持', category: '架构', description: '支持不同计算能力的设备' },
    { id: 'F5', name: '本地差分隐私', category: '算法', description: '无需信任服务器' },
  ],
  references: ['INVENTION', 'R1', 'R2', 'R3'],
  cells: [],
  differentiators: ['F4', 'F5'],
};
validMatrix.cells = validMatrix.features.flatMap(f =>
  validMatrix.references.map(r => ({
    featureId: f.id,
    refId: r,
    status: 'present' as const,
    note: 'test',
  }))
);

describe('Feature Matrix Schema', () => {
  test('validates a complete matrix', () => {
    const result = validateFeatureMatrix(validMatrix);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('rejects insufficient features', () => {
    const m = { ...validMatrix, features: validMatrix.features.slice(0, 3) };
    const result = validateFeatureMatrix(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('insufficient features'))).toBe(true);
  });

  test('rejects missing INVENTION column', () => {
    const m = { ...validMatrix, references: ['R1', 'R2', 'R3'] };
    const result = validateFeatureMatrix(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('INVENTION'))).toBe(true);
  });

  test('rejects incomplete matrix', () => {
    const m = { ...validMatrix, cells: validMatrix.cells.slice(0, 5) };
    const result = validateFeatureMatrix(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('incomplete matrix'))).toBe(true);
  });

  test('rejects empty differentiators', () => {
    const m = { ...validMatrix, differentiators: [] };
    const result = validateFeatureMatrix(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('no differentiators'))).toBe(true);
  });

  test('rejects feature missing description', () => {
    const m = {
      ...validMatrix,
      features: [...validMatrix.features.slice(0, 4), { id: 'F5', name: 'Test', category: '架构', description: '' }],
    };
    const result = validateFeatureMatrix(m);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing description'))).toBe(true);
  });
});
