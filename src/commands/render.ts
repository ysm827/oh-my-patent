/**
 * Render - 被动渲染模块
 *
 * 将 brainstorm path 数据渲染为格式化文本输出。
 * "被动"指一次性输出到 stdout，不做交互循环。
 *
 * 支持四种视图：
 * - overview:  路径概览（时间线 + 分支 + 评分走势）
 * - node:      单轮节点详情
 * - innovation: 创新点演化历史
 * - branch:    分支概览
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { loadPath } from '../core/path-persistence.js';
import {
  getPathOverview,
  getNodeDetail,
  getInnovationHistory,
} from './path-query.js';
import { getBranchDetail, listBranches } from './path-branch.js';
import type { PathOverview, NodeDetail, InnovationHistory } from './path-query.js';
import type { BranchDetail } from './path-branch.js';
import { STATUS_LABELS, ACTION_LABELS, formatDate, formatScore } from './shared.js';

// ============================================================================
// 常量
// ============================================================================

const BOX_TOP    = '╔═══════════════════════════════════════════════════════════╗';
const BOX_MID    = '╠═══════════════════════════════════════════════════════════╣';
const BOX_BOT    = '╚═══════════════════════════════════════════════════════════╝';
const LINE       = '───────────────────────────────────────────────────────────';

const STATUS_LABEL = STATUS_LABELS;
const ACTION_LABEL = ACTION_LABELS;

// ============================================================================
// 工具函数
// ============================================================================

const fmtDate = formatDate;
const fmtScore = formatScore;

function pad(s: string, len: number): string {
  // CJK fullwidth chars count as 2 columns
  let width = 0;
  for (const ch of s) {
    width += ch.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  const padLen = Math.max(0, len - width);
  return s + ' '.repeat(padLen);
}

function section(title: string): string {
  return `${BOX_MID}\n║  ${title.padEnd(55)}║\n${BOX_MID}`;
}

// ============================================================================
// 渲染: 路径概览
// ============================================================================

export async function renderOverview(projectPath: string): Promise<string> {
  const pathData = await loadPath(projectPath);
  const overview = await getPathOverview(projectPath);

  if (!pathData || !overview) {
    return '⚠️  No brainstorm path data found.\n';
  }

  const L: string[] = [];

  // ── header ──
  L.push(BOX_TOP);
  L.push('║  BRAINSTORM PATH OVERVIEW                               ║');
  L.push(BOX_MID);
  L.push(`║  Topic:        ${pad(pathData.topic, 42)}║`);
  L.push(`║  Status:       ${pad(STATUS_LABEL[pathData.status] || pathData.status, 42)}║`);
  L.push(`║  Total Rounds: ${pad(String(overview.totalRounds), 42)}║`);
  L.push(`║  Current:      ${pad(overview.currentRound, 42)}║`);

  // ── score progression sparkline ──
  if (overview.scoreProgression.length > 0) {
    L.push(BOX_MID);
    L.push('║  SCORE PROGRESSION                                      ║');
    L.push(BOX_MID);
    const bar = (n: number) => {
      const filled = Math.round(n);
      return '█'.repeat(filled) + '░'.repeat(10 - filled);
    };
    for (const sp of overview.scoreProgression) {
      const avg = Math.round(sp.avgScore);
      L.push(`║  R${String(sp.round).padStart(2)}  ${bar(avg)}  avg ${fmtScore(sp.avgScore).padStart(4)}  top ${fmtScore(sp.topScore).padStart(4)}  ${pad(sp.topInnovationId, 8)}║`);
    }
  }

  // ── timeline ──
  L.push(BOX_MID);
  L.push('║  TIMELINE                                                ║');
  L.push(BOX_MID);

  for (let i = 0; i < overview.innovationEvolution.length; i++) {
    const evo = overview.innovationEvolution[i];
    const node = await getNodeDetail(projectPath, `round-${evo.round}`);
    if (!node) continue;

    const isLast = i === overview.innovationEvolution.length - 1;
    const marker = isLast ? ' ◀ END' : '';
    L.push(`║  Round ${evo.round}${marker}`);

    // active innovations
    for (const iid of evo.active) {
      const inn = node.innovations.find(x => x.id === iid);
      if (!inn) continue;
      const sc = node.scores.find(s => s.innovationId === iid);
      const scoreTag = sc ? ` ★${fmtScore(sc.weightedScore)}` : '';
      L.push(`║    [OK]  ${iid}: ${inn.title}${scoreTag}`);
    }

    // merged innovations
    if (evo.merged) {
      for (const m of evo.merged) {
        const [id, into] = m.split('→');
        const inn = node.innovations.find(x => x.id === id);
        if (!inn) continue;
        const sc = node.scores.find(s => s.innovationId === id);
        const scoreTag = sc ? ` ★${fmtScore(sc.weightedScore)}` : '';
        L.push(`║    [MG]  ${id}: ${inn.title} → ${into}${scoreTag}`);
      }
    }

    // decision
    L.push(`║    → ${ACTION_LABEL[node.decision.action] || node.decision.action}`);
    L.push('║');
  }

  // ── branches ──
  const branches = await listBranches(projectPath);
  L.push(BOX_MID);
  L.push('║  BRANCHES                                                ║');
  L.push(BOX_MID);
  if (branches.length === 0) {
    L.push('║  (none)                                                  ║');
  } else {
    for (const b of branches) {
      const rm = b.branchPointNodeId.match(/^round-(\d+)$/);
      const r = rm ? rm[1] : b.branchPointNodeId;
      L.push(`║  • ${b.branchId}: ${b.branchReason} (from R${r})`);
    }
  }

  L.push(BOX_BOT);
  return L.join('\n');
}

// ============================================================================
// 渲染: 节点详情
// ============================================================================

export async function renderNode(
  projectPath: string,
  nodeId: string
): Promise<string> {
  const detail = await getNodeDetail(projectPath, nodeId);

  if (!detail) {
    return `⚠️  Node ${nodeId} not found.\n`;
  }

  const L: string[] = [];

  L.push(BOX_TOP);
  L.push(`║  NODE DETAIL: ${nodeId}`);
  L.push(BOX_MID);
  L.push(`║  Round:       ${detail.round}`);
  L.push(`║  Timestamp:   ${fmtDate(detail.timestamp)}`);
  if (detail.predecessorId) L.push(`║  Predecessor: ${detail.predecessorId}`);
  if (detail.successorIds.length) L.push(`║  Successors:  ${detail.successorIds.join(', ')}`);

  // agent outputs
  L.push(BOX_MID);
  L.push('║  AGENT OUTPUTS');
  L.push(BOX_MID);
  if (detail.agentOutputs.length === 0) {
    L.push('║  (none)');
  } else {
    for (const o of detail.agentOutputs) {
      const summary = o.summary.replace(/\n/g, ' ').substring(0, 45);
      L.push(`║  ${o.agentId}: ${o.outputFile}`);
      L.push(`║    ${summary}…`);
    }
  }

  // innovations table
  L.push(BOX_MID);
  L.push('║  INNOVATIONS');
  L.push(BOX_MID);
  if (detail.innovations.length === 0) {
    L.push('║  (none)');
  } else {
    L.push(`║  ${pad('ID', 8)} ${pad('Title', 20)} ${pad('Status', 16)} Score`);
    L.push(`║  ${'─'.repeat(8)} ${'─'.repeat(20)} ${'─'.repeat(16)} ${'─'.repeat(5)}`);
    for (const inn of detail.innovations) {
      const sc = detail.scores.find(s => s.innovationId === inn.id);
      const scoreText = sc ? `★${fmtScore(sc.weightedScore)}` : 'N/A';
      const statusLabel = inn.status === 'merged' && inn.mergedInto
        ? `merged→${inn.mergedInto}`
        : inn.status;
      L.push(`║  ${pad(inn.id, 8)} ${pad(inn.title, 20)} ${pad(statusLabel, 16)} ${scoreText}`);
    }
  }

  // decision
  L.push(BOX_MID);
  L.push('║  DECISION');
  L.push(BOX_MID);
  L.push(`║  Action:   ${ACTION_LABEL[detail.decision.action] || detail.decision.action}`);
  L.push(`║  Reason:   ${detail.decision.reason}`);
  if (detail.decision.recommendations.length > 0) {
    L.push('║  Recommendations:');
    for (const r of detail.decision.recommendations) {
      L.push(`║    • ${r}`);
    }
  }

  L.push(BOX_BOT);
  return L.join('\n');
}

// ============================================================================
// 渲染: 创新点历史
// ============================================================================

export async function renderInnovation(
  projectPath: string,
  innovationId: string
): Promise<string> {
  const history = await getInnovationHistory(projectPath, innovationId);

  if (!history) {
    return `⚠️  Innovation ${innovationId} not found.\n`;
  }

  const L: string[] = [];

  L.push(BOX_TOP);
  L.push(`║  INNOVATION HISTORY: ${innovationId}`);
  L.push(BOX_MID);
  L.push(`║  Status: ${STATUS_LABEL[history.currentStatus] || history.currentStatus}`);
  if (history.mergedInto) {
    L.push(`║  Merged Into: ${history.mergedInto}`);
  }

  for (const entry of history.evolution) {
    L.push(BOX_MID);
    L.push(`║  ROUND ${entry.round}`);
    L.push(BOX_MID);
    L.push(`║  Title:         ${entry.title}`);
    L.push(`║  Problem:       ${entry.problem}`);
    L.push('║  Core Solution:');
    for (const s of entry.coreSolution) {
      L.push(`║    • ${s}`);
    }
    L.push('║  Differences:');
    for (const d of entry.differences) {
      L.push(`║    • ${d}`);
    }
    if (entry.score) {
      L.push('║  Scores:');
      L.push(`║    Novelty: ${entry.score.novelty}  Creativity: ${entry.score.creativity}  Practicality: ${entry.score.practicality}  BizValue: ${entry.score.businessValue}`);
      L.push(`║    Weighted: ★${fmtScore(entry.score.weightedScore)}`);
    }
    L.push(`║  Status: ${STATUS_LABEL[entry.status] || entry.status}`);
    if (entry.mergedInto) {
      L.push(`║  Merged Into: ${entry.mergedInto}`);
    }
  }

  L.push(BOX_BOT);
  return L.join('\n');
}

// ============================================================================
// 渲染: 分支概览
// ============================================================================

export async function renderBranch(
  projectPath: string,
  branchId: string
): Promise<string> {
  const detail = await getBranchDetail(projectPath, branchId);

  if (!detail) {
    return `⚠️  Branch ${branchId} not found.\n`;
  }

  const L: string[] = [];

  L.push(BOX_TOP);
  L.push(`║  BRANCH: ${branchId}`);
  L.push(BOX_MID);
  L.push(`║  Parent Path:  ${detail.parentPathId}`);
  L.push(`║  Branch Point: ${detail.branchPointNodeId}`);
  L.push(`║  Reason:       ${detail.branchReason}`);
  L.push(`║  Created:      ${fmtDate(detail.createdAt)}`);
  L.push(`║  Status:       ${STATUS_LABEL[detail.status] || detail.status}`);

  L.push(BOX_MID);
  L.push('║  NODES');
  L.push(BOX_MID);
  if (detail.nodes.length === 0) {
    L.push('║  (none)');
  } else {
    for (const nid of detail.nodes) {
      const rm = nid.match(/^round-(\d+)$/);
      const r = rm ? rm[1] : '-';
      const cur = nid === detail.currentNodeId ? ' ◀ CURRENT' : '';
      L.push(`║  ${nid}  (Round ${r})${cur}`);
    }
  }

  L.push(BOX_BOT);
  return L.join('\n');
}

// ============================================================================
// 渲染: 全景仪表板（组合视图）
// ============================================================================

export async function renderDashboard(projectPath: string): Promise<string> {
  const pathData = await loadPath(projectPath);
  const overview = await getPathOverview(projectPath);

  if (!pathData || !overview) {
    return '⚠️  No brainstorm path data found.\n';
  }

  const parts: string[] = [];

  // overview
  parts.push(await renderOverview(projectPath));
  parts.push('');

  // latest node detail
  const latestNodeId = overview.currentRound;
  if (latestNodeId) {
    parts.push(await renderNode(projectPath, latestNodeId));
    parts.push('');
  }

  // top innovation history
  if (overview.scoreProgression.length > 0) {
    const topId = overview.scoreProgression[overview.scoreProgression.length - 1].topInnovationId;
    if (topId) {
      parts.push(await renderInnovation(projectPath, topId));
    }
  }

  return parts.join('\n');
}

// ============================================================================
// CLI 入口
// ============================================================================

export type RenderMode = 'overview' | 'node' | 'innovation' | 'branch' | 'dashboard';

export interface RenderOptions {
  projectPath: string;
  mode: RenderMode;
  targetId?: string;     // nodeId / innovationId / branchId
  outputFile?: string;   // 可选输出到文件
}

/**
 * 渲染入口函数 - 被动模式
 */
export async function render(opts: RenderOptions): Promise<string> {
  let output: string;

  switch (opts.mode) {
    case 'overview':
      output = await renderOverview(opts.projectPath);
      break;
    case 'node':
      if (!opts.targetId) throw new Error('node mode requires targetId');
      output = await renderNode(opts.projectPath, opts.targetId);
      break;
    case 'innovation':
      if (!opts.targetId) throw new Error('innovation mode requires targetId');
      output = await renderInnovation(opts.projectPath, opts.targetId);
      break;
    case 'branch':
      if (!opts.targetId) throw new Error('branch mode requires targetId');
      output = await renderBranch(opts.projectPath, opts.targetId);
      break;
    case 'dashboard':
      output = await renderDashboard(opts.projectPath);
      break;
    default:
      throw new Error(`Unknown render mode: ${opts.mode}`);
  }

  if (opts.outputFile) {
    await fs.writeFile(opts.outputFile, output, 'utf-8');
  }

  return output;
}
