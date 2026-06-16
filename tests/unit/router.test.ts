import { describe, test, expect } from 'vitest';
import { classifyIntent, IntentType } from '../../src/core/router';

describe('Intent Router', () => {
  test('classifies "新建项目" as NEW_PROJECT', () => {
    const result = classifyIntent('我有个想法，想申请一个区块链支付的专利');
    expect(result.type).toBe(IntentType.NEW_PROJECT);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test('classifies "检索现有技术" as SEARCH', () => {
    const result = classifyIntent('帮我检索一下区块链支付相关的现有技术');
    expect(result.type).toBe(IntentType.SEARCH);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test('classifies "写交底书" as DRAFT', () => {
    const result = classifyIntent('帮我写交底书');
    expect(result.type).toBe(IntentType.DRAFT);
  });

  test('classifies "审核" as REVIEW', () => {
    const result = classifyIntent('审核一下这个交底书写得怎么样');
    expect(result.type).toBe(IntentType.REVIEW);
  });

  test('classifies ambiguous input as CONTINUE_WORKFLOW', () => {
    const result = classifyIntent('继续');
    expect(result.type).toBe(IntentType.CONTINUE_WORKFLOW);
  });

  test('extracts topic from NEW_PROJECT intent', () => {
    const result = classifyIntent('我有个基于零知识证明的隐私计算方案');
    expect(result.type).toBe(IntentType.NEW_PROJECT);
    expect(result.extracted?.topic).toContain('零知识证明');
  });
});
