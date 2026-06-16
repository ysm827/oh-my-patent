/**
 * Shared constants and helpers for path rendering modules.
 *
 * Single source of truth for status/action labels, date formatting,
 * and score formatting — used by render.ts, path-visualization.ts, and app.tsx.
 */

// ============================================================================
// 状态标签映射
// ============================================================================

export const STATUS_ICONS: Record<string, string> = {
  active:    '🟢',
  completed: '✅',
  abandoned: '🔴',
  merged:    '🔀',
};

export const STATUS_LABELS: Record<string, string> = {
  active:    '🟢 ACTIVE',
  completed: '✅ COMPLETED',
  abandoned: '🔴 ABANDONED',
  merged:    '🔀 MERGED',
};

export const ACTION_ICONS: Record<string, string> = {
  ITERATE:      '🔄',
  PASS_TO_DRAFT:'✅',
  FORCE_PASS:   '⚠️',
};

export const ACTION_LABELS: Record<string, string> = {
  ITERATE:      '🔄 ITERATE',
  PASS_TO_DRAFT:'✅ PASS_TO_DRAFT',
  FORCE_PASS:   '⚠️ FORCE_PASS',
};

// ============================================================================
// 格式化工具函数
// ============================================================================

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toISOString().split('T')[0];
}

/**
 * 格式化评分为一位小数
 */
export function formatScore(score: number): string {
  return score.toFixed(1);
}
