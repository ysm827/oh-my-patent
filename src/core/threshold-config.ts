/**
 * ThresholdConfig - 评分阈值配置
 *
 * 用于头脑风暴环节的评分阈值判断，支持：
 * - 综合评分达标阈值
 * - 强制迭代条件
 * - 单维度红线检查
 */

import { InnovationScore, DecisionAction } from './brainstorm-path.js';

// ============================================================================
// 阈值配置接口
// ============================================================================

/**
 * 强制迭代配置
 */
export interface ForceIterationConfig {
  maxRounds: number; // 最大轮数 (默认 3)
  minImprovement: number; // 轮间最小提升 (默认 0.3)
}

/**
 * 红线配置 - 单维度最低分
 */
export interface RedLinesConfig {
  novelty: number; // 新颖性最低分 (默认 6.0)
  creativity: number; // 创造性最低分 (默认 6.0)
}

/**
 * 阈值配置
 */
export interface ThresholdConfig {
  passToDraft: number; // 进入下一阶段的最低综合评分 (默认 8.5)
  forceIteration: ForceIterationConfig;
  redLines: RedLinesConfig;
}

// ============================================================================
// 默认配置
// ============================================================================

/**
 * 默认阈值配置
 */
export const DEFAULT_THRESHOLD_CONFIG: ThresholdConfig = {
  passToDraft: 8.5,
  forceIteration: {
    maxRounds: 3,
    minImprovement: 0.3
  },
  redLines: {
    novelty: 6.0,
    creativity: 6.0
  }
};

// ============================================================================
// 阈值决策结果
// ============================================================================

/**
 * 阈值决策结果
 */
export interface ThresholdDecision {
  action: DecisionAction;
  reason: string;
  scoreExceedsThreshold: boolean; // 是否达到阈值
  redLineViolated: boolean; // 是否违反红线
  roundLimitReached: boolean; // 是否达到最大轮数
}

// ============================================================================
// 配置验证
// ============================================================================

/**
 * 验证阈值配置
 * @param config 待验证的配置
 * @returns 验证结果，包含是否有效和错误列表
 */
export function validateThresholdConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof config !== 'object' || config === null) {
    return { valid: false, errors: ['配置必须是一个对象'] };
  }

  const cfg = config as Record<string, unknown>;

  // 验证 passToDraft
  if (typeof cfg.passToDraft !== 'number') {
    errors.push('passToDraft 必须是数字');
  } else if (cfg.passToDraft < 0 || cfg.passToDraft > 10) {
    errors.push('passToDraft 必须在 0-10 之间');
  }

  // 验证 forceIteration
  if (typeof cfg.forceIteration !== 'object' || cfg.forceIteration === null) {
    errors.push('forceIteration 必须是一个对象');
  } else {
    const forceIter = cfg.forceIteration as Record<string, unknown>;
    if (typeof forceIter.maxRounds !== 'number') {
      errors.push('forceIteration.maxRounds 必须是数字');
    } else if (forceIter.maxRounds < 1) {
      errors.push('forceIteration.maxRounds 必须大于等于 1');
    }
    if (typeof forceIter.minImprovement !== 'number') {
      errors.push('forceIteration.minImprovement 必须是数字');
    } else if (forceIter.minImprovement < 0) {
      errors.push('forceIteration.minImprovement 必须大于等于 0');
    }
  }

  // 验证 redLines
  if (typeof cfg.redLines !== 'object' || cfg.redLines === null) {
    errors.push('redLines 必须是一个对象');
  } else {
    const redLines = cfg.redLines as Record<string, unknown>;
    if (typeof redLines.novelty !== 'number') {
      errors.push('redLines.novelty 必须是数字');
    } else if (redLines.novelty < 0 || redLines.novelty > 10) {
      errors.push('redLines.novelty 必须在 0-10 之间');
    }
    if (typeof redLines.creativity !== 'number') {
      errors.push('redLines.creativity 必须是数字');
    } else if (redLines.creativity < 0 || redLines.creativity > 10) {
      errors.push('redLines.creativity 必须在 0-10 之间');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// 配置合并
// ============================================================================

/**
 * 合并自定义配置与默认配置
 * @param custom 自定义配置（部分）
 * @returns 合并后的完整配置
 */
export function mergeThresholdConfig(custom: Partial<ThresholdConfig>): ThresholdConfig {
  return {
    passToDraft: custom.passToDraft ?? DEFAULT_THRESHOLD_CONFIG.passToDraft,
    forceIteration: {
      maxRounds: custom.forceIteration?.maxRounds ?? DEFAULT_THRESHOLD_CONFIG.forceIteration.maxRounds,
      minImprovement: custom.forceIteration?.minImprovement ?? DEFAULT_THRESHOLD_CONFIG.forceIteration.minImprovement
    },
    redLines: {
      novelty: custom.redLines?.novelty ?? DEFAULT_THRESHOLD_CONFIG.redLines.novelty,
      creativity: custom.redLines?.creativity ?? DEFAULT_THRESHOLD_CONFIG.redLines.creativity
    }
  };
}

// ============================================================================
// 阈值评估
// ============================================================================

/**
 * 评估评分是否达到阈值
 * @param score 创新点评分
 * @param config 阈值配置
 * @param currentRound 当前轮次 (默认 1)
 * @returns 阈值决策结果
 */
export function evaluateThreshold(
  score: InnovationScore,
  config: ThresholdConfig,
  currentRound: number = 1
): ThresholdDecision {
  const { passToDraft, redLines, forceIteration } = config;

  // 1. 检查红线（新颖性、创造性最低分）
  const noveltyViolation = score.novelty < redLines.novelty;
  const creativityViolation = score.creativity < redLines.creativity;
  const redLineViolated = noveltyViolation || creativityViolation;

  // 2. 检查综合分是否达标
  const scoreExceedsThreshold = score.weightedScore >= passToDraft;

  // 3. 检查是否达到最大轮数
  const roundLimitReached = currentRound >= forceIteration.maxRounds;

  // 决策逻辑（优先级顺序）
  let action: DecisionAction;
  let reason: string;

  if (redLineViolated) {
    // 红线违反 → 必须迭代（除非达到最大轮数）
    if (roundLimitReached) {
      action = 'FORCE_PASS';
      const violations: string[] = [];
      if (noveltyViolation) violations.push(`新颖性 ${score.novelty} < ${redLines.novelty}`);
      if (creativityViolation) violations.push(`创造性 ${score.creativity} < ${redLines.creativity}`);
      reason = `达到最大轮数但存在红线违规: ${violations.join(', ')}`;
    } else {
      action = 'ITERATE';
      const violations: string[] = [];
      if (noveltyViolation) violations.push(`新颖性 ${score.novelty} < ${redLines.novelty}`);
      if (creativityViolation) violations.push(`创造性 ${score.creativity} < ${redLines.creativity}`);
      reason = `低于红线阈值: ${violations.join(', ')}`;
    }
  } else if (scoreExceedsThreshold) {
    // 综合分达标 → 进入撰写阶段
    action = 'PASS_TO_DRAFT';
    reason = `综合分 ${score.weightedScore} ≥ 阈值 ${passToDraft}`;
  } else if (roundLimitReached) {
    // 达到最大轮数 → 强制通过
    action = 'FORCE_PASS';
    reason = `达到最大轮数 ${forceIteration.maxRounds}，综合分 ${score.weightedScore} < ${passToDraft}`;
  } else {
    // 继续迭代
    action = 'ITERATE';
    reason = `综合分 ${score.weightedScore} < 阈值 ${passToDraft}，继续优化`;
  }

  return {
    action,
    reason,
    scoreExceedsThreshold,
    redLineViolated,
    roundLimitReached
  };
}

// ============================================================================
// 批量评估
// ============================================================================

/**
 * 批量评估多个创新点的评分
 * @param scores 创新点评分数组
 * @param config 阈值配置
 * @param currentRound 当前轮次
 * @returns 各创新点的评估结果
 */
export function evaluateAllThresholds(
  scores: InnovationScore[],
  config: ThresholdConfig,
  currentRound: number = 1
): Map<string, ThresholdDecision> {
  const results = new Map<string, ThresholdDecision>();

  for (const score of scores) {
    results.set(score.innovationId, evaluateThreshold(score, config, currentRound));
  }

  return results;
}

// ============================================================================
// 获取最高分创新点
// ============================================================================

/**
 * 获取评分最高的创新点
 * @param scores 创新点评分数组
 * @returns 最高分创新点，如果没有则返回 null
 */
export function getTopScoredInnovation(scores: InnovationScore[]): InnovationScore | null {
  if (scores.length === 0) return null;

  return scores.reduce((top, current) =>
    current.weightedScore > top.weightedScore ? current : top
  );
}

// ============================================================================
// 生成改进建议
// ============================================================================

/**
 * 根据评估结果生成改进建议
 * @param score 创新点评分
 * @param config 阈值配置
 * @param decision 评估决策
 * @returns 改进建议列表
 */
export function generateImprovementSuggestions(
  score: InnovationScore,
  config: ThresholdConfig,
  decision: ThresholdDecision
): string[] {
  const suggestions: string[] = [];

  // 如果已经达标或需要强制通过，不需要建议
  if (decision.action === 'PASS_TO_DRAFT' || decision.action === 'FORCE_PASS') {
    return suggestions;
  }

  // 针对红线违反的建议
  if (score.novelty < config.redLines.novelty) {
    suggestions.push(`新颖性 ${score.novelty}/${config.redLines.novelty}: 强化技术方案与现有技术的差异点描述`);
  }
  if (score.creativity < config.redLines.creativity) {
    suggestions.push(`创造性 ${score.creativity}/${config.redLines.creativity}: 补充非显而易见性的技术细节`);
  }

  // 针对综合分的建议
  if (!decision.scoreExceedsThreshold) {
    const gap = config.passToDraft - score.weightedScore;
    suggestions.push(`综合分差距 ${gap.toFixed(1)}: 需要全面提升各维度评分`);

    // 找出最低分维度
    const dimensions = [
      { name: '新颖性', value: score.novelty, weight: 0.3 },
      { name: '创造性', value: score.creativity, weight: 0.3 },
      { name: '实用性', value: score.practicality, weight: 0.2 },
      { name: '商业价值', value: score.businessValue, weight: 0.2 }
    ];
    const lowest = dimensions.reduce((min, d) => d.value < min.value ? d : min);

    if (lowest.value < 8) {
      suggestions.push(`优先提升${lowest.name}: 当前 ${lowest.value}/10，权重 ${lowest.weight * 100}%`);
    }
  }

  return suggestions;
}
