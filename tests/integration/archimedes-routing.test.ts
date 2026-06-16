import { describe, test, expect, vi } from 'vitest';
import { ArchimedesOrchestrator } from '../../src/agents/archimedes';
import { createInitialState } from '../../src/core/state';

describe('Archimedes Routing Integration', () => {
  test('routes NEW_PROJECT intent to correct workflow', async () => {
    const orchestrator = new ArchimedesOrchestrator();
    const mockFS = vi.fn().mockReturnValue(true);
    const result = await orchestrator.processInput(
      '我有个基于零知识证明的跨境支付方案',
      { fileExists: mockFS }
    );
    expect(result.action).toBe('CREATE_PROJECT');
    expect(result.extractedData?.topic).toContain('零知识证明');
  });

  test('continues from existing state', async () => {
    const orchestrator = new ArchimedesOrchestrator();
    const state = createInitialState({
      topic: 'Test',
      topicSlug: 'test',
      jurisdiction: 'CN',
      projectPath: 'projects/01-test'
    });
    state.current_stage = 'RESEARCH';
    const result = await orchestrator.processInput(
      '继续',
      { existingState: state, fileExists: () => true }
    );
    expect(result.action).toBe('CONTINUE_RESEARCH');
  });

  test('handles state inconsistency', async () => {
    const orchestrator = new ArchimedesOrchestrator();
    const state = {
      current_stage: 'DRAFT',
      stages: { DRAFT: { artifacts: ['MAIN.md'] } }
    } as any;
    const result = await orchestrator.processInput(
      '继续',
      { existingState: state, fileExists: () => false }
    );
    expect(result.action).toBe('PROMPT_USER');
    expect(result.message).toContain('状态不一致');
  });
});
