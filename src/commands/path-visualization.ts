/**
 * PathVisualization - 路径 Markdown 渲染 API
 *
 * 提供头脑风暴路径的 Markdown 渲染功能，支持：
 * - 路径概览渲染
 * - 节点详情渲染
 * - 创新点历史渲染
 * - 分支概览渲染
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import {
  getPathOverview,
  getNodeDetail,
  getInnovationHistory,
} from './path-query.js';
import { getBranchDetail, listBranches } from './path-branch.js';
import { loadPath } from '../core/path-persistence.js';
import type { PathOverview, NodeDetail, InnovationHistory } from './path-query.js';
import type { BranchDetail, BranchInfo } from './path-branch.js';
import { STATUS_ICONS, ACTION_LABELS, formatDate, formatScore } from './shared.js';

// ============================================================================
// 辅助类型
// ============================================================================

/**
 * 状态标签颜色映射
 */
const STATUS_COLORS: Record<string, string> = STATUS_ICONS;

/**
 * 决策动作标签
 */
const ACTION_MAP: Record<string, string> = ACTION_LABELS;

// ============================================================================
// 辅助函数
// ============================================================================

const formatDateLocal = formatDate;
const formatScoreLocal = formatScore;

/**
 * 获取状态标签
 *
 * @param status - 状态字符串
 * @returns 状态标签（带图标）
 */
function getStatusLabel(status: string): string {
  return `${STATUS_COLORS[status] || '⚪'} ${status.toUpperCase()}`;
}

/**
 * 获取决策动作标签
 *
 * @param action - 决策动作
 * @returns 决策动作标签
 */
function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action;
}

// ============================================================================
// 路径概览渲染
// ============================================================================

/**
 * 渲染路径概览为 Markdown
 *
 * @param projectPath - 项目根目录路径
 * @returns Markdown 格式的路径概览
 *
 * @example
 * ```typescript
 * const markdown = await renderPathOverview('/path/to/project');
 * console.log(markdown);
 * ```
 */
export async function renderPathOverview(projectPath: string): Promise<string> {
  const pathData = await loadPath(projectPath);
  const overview = await getPathOverview(projectPath);

  if (!pathData || !overview) {
    return '# Brainstorm Path Overview\n\n⚠️ No path data found.\n';
  }

  const lines: string[] = [];

  // 标题和基本信息
  lines.push('# Brainstorm Path Overview');
  lines.push('');
  lines.push(`**Topic**: ${pathData.topic}`);
  lines.push(`**Status**: ${getStatusLabel(pathData.status)}`);
  lines.push(`**Total Rounds**: ${overview.totalRounds}`);
  lines.push('');

  // 时间线
  lines.push('## Timeline');
  lines.push('');

  for (const evolution of overview.innovationEvolution) {
    const node = await getNodeDetail(projectPath, `round-${evolution.round}`);
    if (!node) continue;

    lines.push(`### Round ${evolution.round} (${formatDateLocal(node.timestamp)})`);
    lines.push('');

    // 活跃的创新点
    for (const innovationId of evolution.active) {
      const innovation = node.innovations.find(i => i.id === innovationId);
      if (innovation) {
        const score = node.scores.find(s => s.innovationId === innovationId);
        const scoreText = score ? ` (Score: ${formatScoreLocal(score.weightedScore)})` : '';
        lines.push(`- ${innovationId}: ${innovation.title} [ACCEPTED]${scoreText}`);
      }
    }

    // 合并的创新点
    if (evolution.merged && evolution.merged.length > 0) {
      for (const mergedInfo of evolution.merged) {
        const [id, mergedInto] = mergedInfo.split('→');
        const innovation = node.innovations.find(i => i.id === id);
        if (innovation) {
          const score = node.scores.find(s => s.innovationId === id);
          const scoreText = score ? ` (Score: ${formatScoreLocal(score.weightedScore)})` : '';
          lines.push(`- ${id}: ${innovation.title} [MERGED → ${mergedInto}]${scoreText}`);
        }
      }
    }

    lines.push('');
  }

  // 分支信息
  lines.push('## Branches');
  lines.push('');

  const branches = await listBranches(projectPath);
  if (branches.length === 0) {
    lines.push('_No branches created._');
  } else {
    for (const branch of branches) {
      const branchDetail = await getBranchDetail(projectPath, branch.branchId);
      if (branchDetail) {
        const roundMatch = branch.branchPointNodeId.match(/^round-(\d+)$/);
        const round = roundMatch ? roundMatch[1] : branch.branchPointNodeId;
        lines.push(`- **${branch.branchId}**: ${branch.branchReason} (from Round ${round})`);
      }
    }
  }

  return lines.join('\n');
}

// ============================================================================
// 节点详情渲染
// ============================================================================

/**
 * 渲染节点详情为 Markdown
 *
 * @param projectPath - 项目根目录路径
 * @param nodeId - 节点ID（如 "round-1"）
 * @returns Markdown 格式的节点详情
 *
 * @example
 * ```typescript
 * const markdown = await renderNodeDetail('/path/to/project', 'round-1');
 * console.log(markdown);
 * ```
 */
export async function renderNodeDetail(
  projectPath: string,
  nodeId: string
): Promise<string> {
  const detail = await getNodeDetail(projectPath, nodeId);

  if (!detail) {
    return `# Node Detail: ${nodeId}\n\n⚠️ Node not found.\n`;
  }

  const lines: string[] = [];

  // 标题和基本信息
  lines.push(`# Node Detail: ${nodeId}`);
  lines.push('');
  lines.push(`**Round**: ${detail.round}`);
  lines.push(`**Timestamp**: ${formatDateLocal(detail.timestamp)}`);
  if (detail.predecessorId) {
    lines.push(`**Predecessor**: ${detail.predecessorId}`);
  }
  if (detail.successorIds.length > 0) {
    lines.push(`**Successors**: ${detail.successorIds.join(', ')}`);
  }
  lines.push('');

  // Agent 输出
  lines.push('## Agent Outputs');
  lines.push('');

  if (detail.agentOutputs.length === 0) {
    lines.push('_No agent outputs recorded._');
  } else {
    lines.push('| Agent | Output File | Summary |');
    lines.push('|-------|-------------|---------|');
    for (const output of detail.agentOutputs) {
      const summary = output.summary.replace(/\n/g, ' ').substring(0, 50);
      lines.push(`| ${output.agentId} | ${output.outputFile} | ${summary}... |`);
    }
    lines.push('');
  }

  // 创新点
  lines.push('## Innovations');
  lines.push('');

  if (detail.innovations.length === 0) {
    lines.push('_No innovations recorded._');
  } else {
    lines.push('| ID | Title | Status | Score |');
    lines.push('|----|-------|--------|-------|');
    for (const innovation of detail.innovations) {
      const score = detail.scores.find(s => s.innovationId === innovation.id);
      const scoreText = score ? formatScoreLocal(score.weightedScore) : 'N/A';
      const statusLabel = innovation.status === 'merged' && innovation.mergedInto
        ? `merged → ${innovation.mergedInto}`
        : innovation.status;
      lines.push(`| ${innovation.id} | ${innovation.title} | ${statusLabel} | ${scoreText} |`);
    }
    lines.push('');
  }

  // 决策
  lines.push('## Decision');
  lines.push('');

  lines.push(`- **Action**: ${getActionLabel(detail.decision.action)}`);
  lines.push(`- **Reason**: ${detail.decision.reason}`);
  if (detail.decision.recommendations.length > 0) {
    lines.push(`- **Recommendations**:`);
    for (const rec of detail.decision.recommendations) {
      lines.push(`  - ${rec}`);
    }
  }

  return lines.join('\n');
}

// ============================================================================
// 创新点历史渲染
// ============================================================================

/**
 * 渲染创新点历史为 Markdown
 *
 * @param projectPath - 项目根目录路径
 * @param innovationId - 创新点ID
 * @returns Markdown 格式的创新点历史
 *
 * @example
 * ```typescript
 * const markdown = await renderInnovationHistory('/path/to/project', 'INN-001');
 * console.log(markdown);
 * ```
 */
export async function renderInnovationHistory(
  projectPath: string,
  innovationId: string
): Promise<string> {
  const history = await getInnovationHistory(projectPath, innovationId);

  if (!history) {
    return `# Innovation History: ${innovationId}\n\n⚠️ Innovation not found.\n`;
  }

  const lines: string[] = [];

  // 标题和状态
  lines.push(`# Innovation History: ${innovationId}`);
  lines.push('');
  lines.push(`**Current Status**: ${getStatusLabel(history.currentStatus)}`);
  if (history.mergedInto) {
    lines.push(`**Merged Into**: ${history.mergedInto}`);
  }
  lines.push('');

  // 演化时间线
  lines.push('## Evolution Timeline');
  lines.push('');

  for (const entry of history.evolution) {
    lines.push(`### Round ${entry.round}`);
    lines.push('');

    lines.push(`- **Title**: ${entry.title}`);
    lines.push(`- **Problem**: ${entry.problem}`);
    lines.push(`- **Core Solution**:`);
    for (const sol of entry.coreSolution) {
      lines.push(`  - ${sol}`);
    }
    lines.push(`- **Differences**:`);
    for (const diff of entry.differences) {
      lines.push(`  - ${diff}`);
    }

    if (entry.score) {
      lines.push(`- **Score**:`);
      lines.push(`  - Novelty: ${entry.score.novelty}`);
      lines.push(`  - Creativity: ${entry.score.creativity}`);
      lines.push(`  - Practicality: ${entry.score.practicality}`);
      lines.push(`  - Business Value: ${entry.score.businessValue}`);
      lines.push(`  - **Weighted Score**: ${formatScoreLocal(entry.score.weightedScore)}`);
    }

    lines.push(`- **Status**: ${getStatusLabel(entry.status)}`);
    if (entry.mergedInto) {
      lines.push(`- **Merged Into**: ${entry.mergedInto}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================================
// 分支概览渲染
// ============================================================================

/**
 * 渲染分支概览为 Markdown
 *
 * @param projectPath - 项目根目录路径
 * @param branchId - 分支ID
 * @returns Markdown 格式的分支概览
 *
 * @example
 * ```typescript
 * const markdown = await renderBranchOverview('/path/to/project', 'path-1712345678-branch-1');
 * console.log(markdown);
 * ```
 */
export async function renderBranchOverview(
  projectPath: string,
  branchId: string
): Promise<string> {
  const detail = await getBranchDetail(projectPath, branchId);

  if (!detail) {
    return `# Branch Overview: ${branchId}\n\n⚠️ Branch not found.\n`;
  }

  const lines: string[] = [];

  // 标题和基本信息
  lines.push(`# Branch Overview: ${branchId}`);
  lines.push('');
  lines.push(`**Parent Path**: ${detail.parentPathId}`);
  lines.push(`**Branch Point**: ${detail.branchPointNodeId}`);
  lines.push(`**Reason**: ${detail.branchReason}`);
  lines.push(`**Created At**: ${formatDateLocal(detail.createdAt)}`);
  lines.push(`**Status**: ${getStatusLabel(detail.status)}`);
  lines.push('');

  // 节点列表
  lines.push('## Nodes');
  lines.push('');

  if (detail.nodes.length === 0) {
    lines.push('_No nodes in this branch._');
  } else {
    lines.push('| Node ID | Round | Current |');
    lines.push('|---------|-------|---------|');
    for (const nodeId of detail.nodes) {
      const roundMatch = nodeId.match(/^round-(\d+)$/);
      const round = roundMatch ? roundMatch[1] : '-';
      const isCurrent = nodeId === detail.currentNodeId ? '✅' : '';
      lines.push(`| ${nodeId} | ${round} | ${isCurrent} |`);
    }
    lines.push('');
  }

  // 当前节点信息
  lines.push('## Current Node');
  lines.push('');
  lines.push(`**Node ID**: ${detail.currentNodeId}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`[View Node Detail](./node-detail-${detail.currentNodeId}.md)`);

  return lines.join('\n');
}
