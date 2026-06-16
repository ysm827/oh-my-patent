import { describe, test, expect } from 'vitest';
import { validateState, createInitialState } from '../../src/core/state';

describe('State Management', () => {
  test('createInitialState creates valid state object', () => {
    const state = createInitialState({
      topic: '基于区块链的跨境支付',
      topicSlug: 'blockchain-crossborder',
      jurisdiction: 'CN',
      projectPath: 'projects/01-blockchain-crossborder'
    });

    expect(state.project.topic).toBe('基于区块链的跨境支付');
    expect(state.project.topic_slug).toBe('blockchain-crossborder');
    expect(state.project.jurisdiction).toBe('CN');
    expect(state.current_stage).toBe('INIT');
    expect(state.stages.INIT.status).toBe('pending');
    expect(state.stages.RESEARCH.status).toBe('pending');
  });

  test('validateState rejects invalid jurisdiction', () => {
    const invalidState = {
      project: { jurisdiction: 'INVALID' },
      current_stage: 'INIT',
      stages: {}
    };
    const result = validateState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid jurisdiction: INVALID');
  });

  test('validateState accepts valid CN jurisdiction', () => {
    const validState = createInitialState({
      topic: 'Test',
      topicSlug: 'test',
      jurisdiction: 'CN',
      projectPath: 'test'
    });
    const result = validateState(validState);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
