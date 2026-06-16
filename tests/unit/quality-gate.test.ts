import { describe, test, expect } from 'vitest';
import { QualityChecker, QualityIssue, QualityLevel } from '../../src/skills/quality-gate';

describe('Quality Gate Skill', () => {
  test('detects missing title', () => {
    const checker = new QualityChecker();
    const issues = checker.check(`
## 技术领域
本发明涉及...
`);

    expect(issues.some(i => i.field === 'title')).toBe(true);
    expect(issues.find(i => i.field === 'title')?.level).toBe(QualityLevel.ERROR);
  });

  test('detects missing technical field', () => {
    const checker = new QualityChecker();
    const issues = checker.check(`
# 发明名称
测试专利

## 背景技术
...
`);

    expect(issues.some(i => i.field === 'technical_field')).toBe(true);
  });

  test('passes minimal valid disclosure', () => {
    const checker = new QualityChecker();
    const issues = checker.check(`
# 发明名称
测试专利

## 技术领域
本发明涉及数据处理领域。

## 背景技术
现有技术存在问题。

## 发明内容
本发明提供一种解决方案。

## 具体实施方式
具体实施例描述。

## 权利要求书
1. 一种方法，其特征在于...
`);

    expect(issues.filter(i => i.level === QualityLevel.ERROR)).toHaveLength(0);
  });

  test('detects empty claims', () => {
    const checker = new QualityChecker();
    const issues = checker.check(`
## 权利要求书
`);

    expect(issues.some(i => i.field === 'claims' && i.level === QualityLevel.ERROR)).toBe(true);
  });

  test('counts quality score', () => {
    const checker = new QualityChecker();
    const score = checker.getScore(`
# 发明名称
测试

## 技术领域
测试

## 权利要求书
1. 测试
`);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
