import { describe, test, expect } from 'vitest';
import { generateImprovementSuggestions, DEFAULT_THRESHOLD_CONFIG } from '../../src/core/threshold-config';
import type { ThresholdConfig, ThresholdDecision } from '../../src/core/threshold-config';
import type { InnovationScore } from '../../src/core/brainstorm-path';

/**
 * REQ-024: improvement suggestions must honour `config.weights`.
 *
 * The function used to hardcode 0.3/0.3/0.2/0.2 when picking the "lowest"
 * dimension, so custom weights never influenced the advice. The dimension is
 * now picked by weighted contribution (value × weight), which the fixture
 * below turns into an observable difference: the SAME score suggests a
 * DIFFERENT dimension under DIFFERENT weights.
 */
describe('generateImprovementSuggestions weights (REQ-024)', () => {
  const score: InnovationScore = {
    innovationId: 'INN-001',
    novelty: 6,
    creativity: 6,
    practicality: 6,
    businessValue: 7,
    weightedScore: 6.2,
  };

  const decision: ThresholdDecision = {
    action: 'ITERATE',
    reason: 'below threshold',
    scoreExceedsThreshold: false,
    redLineViolated: false,
    roundLimitReached: false,
  };

  test('default config reports the default weight for the chosen dimension', () => {
    const suggestions = generateImprovementSuggestions(score, DEFAULT_THRESHOLD_CONFIG, decision);
    // Contributions under 0.3/0.3/0.2/0.2: 1.8 / 1.8 / 1.2 / 1.4 → 实用性
    expect(suggestions.some((s) => s.includes('实用性'))).toBe(true);
    expect(suggestions.some((s) => s.includes('权重 20%'))).toBe(true);
  });

  test('custom weights change the prioritised dimension and the reported weight', () => {
    const config: ThresholdConfig = {
      ...DEFAULT_THRESHOLD_CONFIG,
      weights: { novelty: 0.4, creativity: 0.1, practicality: 0.1, businessValue: 0.4 },
    };
    const suggestions = generateImprovementSuggestions(score, config, decision);
    // Contributions under 0.4/0.1/0.1/0.4: 2.4 / 0.6 / 0.6 / 2.8 → 创造性
    expect(suggestions.some((s) => s.includes('创造性'))).toBe(true);
    expect(suggestions.some((s) => s.includes('权重 10%'))).toBe(true);
    expect(suggestions.some((s) => s.includes('实用性'))).toBe(false);
  });

  test('no suggestions for decisions that leave the iteration loop', () => {
    const pass: ThresholdDecision = { ...decision, action: 'PASS_TO_DRAFT' };
    expect(generateImprovementSuggestions(score, DEFAULT_THRESHOLD_CONFIG, pass)).toEqual([]);
  });
});
