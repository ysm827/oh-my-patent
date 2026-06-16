/**
 * PathQuery - 路径查询 API
 *
 * 提供对头脑风暴路径的查询功能，支持：
 * - 路径概览查看
 * - 节点详情获取
 * - 创新点演化历史
 * - 评分进展追踪
 */

import { loadPath, loadNode, loadAllNodes } from '../core/path-persistence.js';
import {
  BrainstormNode,
  InnovationSnapshot,
  InnovationScore,
} from '../core/brainstorm-path.js';

// ============================================================================
// 返回类型定义
// ============================================================================

/**
 * 路径概览信息
 */
export interface PathOverview {
  totalRounds: number;
  currentRound: string;
  status: 'active' | 'completed' | 'abandoned';
  innovationEvolution: Array<{
    round: number;
    count: number;
    active: string[];
    merged?: string[];
    final?: boolean;
  }>;
  scoreProgression: Array<{
    round: number;
    avgScore: number;
    topScore: number;
    topInnovationId: string;
  }>;
}

/**
 * 节点详情
 */
export interface NodeDetail {
  id: string;
  round: number;
  predecessorId?: string;
  successorIds: string[];
  agentOutputs: Array<{
    agentId: string;
    outputFile: string;
    summary: string;
    keyPoints: string[];
  }>;
  innovations: InnovationSnapshot[];
  scores: InnovationScore[];
  decision: {
    action: 'ITERATE' | 'PASS_TO_DRAFT' | 'FORCE_PASS';
    reason: string;
    recommendations: string[];
  };
  timestamp: string;
}

/**
 * 创新点演化历史
 */
export interface InnovationHistory {
  innovationId: string;
  evolution: Array<{
    round: number;
    title: string;
    problem: string;
    coreSolution: string[];
    differences: string[];
    status: 'active' | 'merged' | 'abandoned';
    mergedInto?: string;
    score?: InnovationScore;
  }>;
  currentStatus: 'active' | 'merged' | 'abandoned';
  mergedInto?: string;
}

/**
 * 创新点摘要信息
 */
export interface InnovationSummary {
  id: string;
  title: string;
  status: 'active' | 'merged' | 'abandoned';
  firstRound: number;
  lastRound?: number;
  finalScore?: number;
}

/**
 * 评分进展
 */
export interface ScoreProgression {
  byInnovation: Map<string, Array<{
    round: number;
    score: InnovationScore;
  }>>;
  overallProgression: Array<{
    round: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
    innovationCount: number;
  }>;
  topInnovations: Array<{
    innovationId: string;
    avgScore: number;
    rounds: number;
  }>;
}

// ============================================================================
// 查询函数
// ============================================================================

/**
 * 获取路径概览
 *
 * @param projectPath - 项目根目录路径
 * @returns 路径概览信息
 */
export async function getPathOverview(projectPath: string): Promise<PathOverview | null> {
  const pathData = await loadPath(projectPath);
  if (!pathData) {
    return null;
  }

  const nodes = await loadAllNodes(projectPath);

  const innovationEvolution: PathOverview['innovationEvolution'] = [];
  const scoreProgression: PathOverview['scoreProgression'] = [];

  for (const node of nodes) {
    const innovations = node.innovations || [];
    const scores = node.scores || [];

    // 统计活跃和合并的创新点
    const active = innovations
      .filter(i => i.status === 'active')
      .map(i => i.id);

    const merged = innovations
      .filter(i => i.status === 'merged')
      .map(i => `${i.id}→${i.mergedInto}`);

    innovationEvolution.push({
      round: node.round,
      count: innovations.length,
      active,
      merged: merged.length > 0 ? merged : undefined,
      final: node.id === pathData.currentNodeId,
    });

    // 计算评分统计
    if (scores.length > 0) {
      const avgScore = scores.reduce((sum, s) => sum + s.weightedScore, 0) / scores.length;
      const topScore = Math.max(...scores.map(s => s.weightedScore));
      const topInnovation = scores.find(s => s.weightedScore === topScore);

      scoreProgression.push({
        round: node.round,
        avgScore: Math.round(avgScore * 10) / 10,
        topScore,
        topInnovationId: topInnovation?.innovationId || '',
      });
    }
  }

  return {
    totalRounds: pathData.nodes.length,
    currentRound: pathData.currentNodeId,
    status: pathData.status,
    innovationEvolution,
    scoreProgression,
  };
}

/**
 * 获取节点详情
 *
 * @param projectPath - 项目根目录路径
 * @param nodeId - 节点ID（如 "round-1"）
 * @returns 节点详情
 */
export async function getNodeDetail(
  projectPath: string,
  nodeId: string
): Promise<NodeDetail | null> {
  const pathData = await loadPath(projectPath);
  const node = await loadNode(projectPath, nodeId);

  if (!node || !pathData) {
    return null;
  }

  // 计算 predecessorId 和 successorIds
  const nodeIndex = pathData.nodes.indexOf(nodeId);
  const predecessorId = nodeIndex > 0 ? pathData.nodes[nodeIndex - 1] : undefined;
  const successorIds = nodeIndex < pathData.nodes.length - 1 ? [pathData.nodes[nodeIndex + 1]] : [];

  return {
    id: node.id,
    round: node.round,
    predecessorId,
    successorIds,
    agentOutputs: node.agentOutputs.map(output => ({
      agentId: output.agentId,
      outputFile: output.outputFile,
      summary: output.summary,
      keyPoints: output.keyPoints,
    })),
    innovations: node.innovations,
    scores: node.scores,
    decision: {
      action: node.decision.action,
      reason: node.decision.reason,
      recommendations: node.decision.recommendations,
    },
    timestamp: node.timestamp,
  };
}

/**
 * 获取创新点历史
 *
 * @param projectPath - 项目根目录路径
 * @param innovationId - 创新点ID
 * @returns 创新点演化历史
 */
export async function getInnovationHistory(
  projectPath: string,
  innovationId: string
): Promise<InnovationHistory | null> {
  const nodes = await loadAllNodes(projectPath);

  const evolution: InnovationHistory['evolution'] = [];
  let currentStatus: 'active' | 'merged' | 'abandoned' = 'active';
  let mergedInto: string | undefined;

  // 遍历所有节点，查找该创新点的历史
  for (const node of nodes) {
    const innovation = node.innovations.find(i => i.id === innovationId);

    if (innovation) {
      const score = node.scores.find(s => s.innovationId === innovationId);

      evolution.push({
        round: node.round,
        title: innovation.title,
        problem: innovation.problem,
        coreSolution: innovation.coreSolution,
        differences: innovation.differences,
        status: innovation.status,
        mergedInto: innovation.mergedInto,
        score,
      });

      // 更新当前状态
      currentStatus = innovation.status;
      mergedInto = innovation.mergedInto;
    }
  }

  if (evolution.length === 0) {
    return null;
  }

  return {
    innovationId,
    evolution,
    currentStatus,
    mergedInto,
  };
}

/**
 * 获取评分进展
 *
 * @param projectPath - 项目根目录路径
 * @param innovationId - 可选，指定创新点ID
 * @returns 评分进展
 */
export async function getScoreProgression(
  projectPath: string,
  innovationId?: string
): Promise<ScoreProgression | null> {
  const nodes = await loadAllNodes(projectPath);

  if (nodes.length === 0) {
    return null;
  }

  const byInnovation = new Map<string, Array<{ round: number; score: InnovationScore }>>();
  const overallProgression: ScoreProgression['overallProgression'] = [];

  // 收集所有创新点的评分历史
  for (const node of nodes) {
    const scores = node.scores || [];

    // 按创新点分组
    for (const score of scores) {
      if (innovationId && score.innovationId !== innovationId) {
        continue;
      }

      const history = byInnovation.get(score.innovationId) || [];
      history.push({ round: node.round, score });
      byInnovation.set(score.innovationId, history);
    }

    // 计算整体统计
    if (scores.length > 0) {
      const avgScore = scores.reduce((sum, s) => sum + s.weightedScore, 0) / scores.length;
      const maxScore = Math.max(...scores.map(s => s.weightedScore));
      const minScore = Math.min(...scores.map(s => s.weightedScore));

      overallProgression.push({
        round: node.round,
        avgScore: Math.round(avgScore * 10) / 10,
        maxScore,
        minScore,
        innovationCount: scores.length,
      });
    }
  }

  // 计算每个创新点的平均分
  const topInnovations: ScoreProgression['topInnovations'] = [];

  for (const [id, history] of byInnovation) {
    const avgScore = history.reduce((sum, h) => sum + h.score.weightedScore, 0) / history.length;

    topInnovations.push({
      innovationId: id,
      avgScore: Math.round(avgScore * 10) / 10,
      rounds: history.length,
    });
  }

  // 按平均分降序排列
  topInnovations.sort((a, b) => b.avgScore - a.avgScore);

  return {
    byInnovation,
    overallProgression,
    topInnovations,
  };
}

/**
 * 列出所有路径分支
 *
 * @param projectPath - 项目根目录路径
 * @returns 路径分支列表（节点ID数组）
 */
export async function listAllPaths(projectPath: string): Promise<string[]> {
  const pathData = await loadPath(projectPath);

  if (!pathData) {
    return [];
  }

  // 当前实现中，路径是线性的，直接返回所有节点
  return pathData.nodes;
}

/**
 * 列出所有创新点摘要
 *
 * @param projectPath - 项目根目录路径
 * @returns 创新点摘要数组
 */
export async function listAllInnovations(projectPath: string): Promise<InnovationSummary[]> {
  const nodes = await loadAllNodes(projectPath);

  if (nodes.length === 0) {
    return [];
  }

  // 使用 Map 来追踪每个创新点的信息
  const innovationMap = new Map<string, InnovationSummary>();

  // 从最后一轮开始反向遍历，以获取最新状态
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];

    for (const innovation of node.innovations) {
      // 如果已经记录过，只更新首次出现轮次
      if (innovationMap.has(innovation.id)) {
        const existing = innovationMap.get(innovation.id)!;
        existing.firstRound = node.round;
        continue;
      }

      // 创建新的摘要记录
      const summary: InnovationSummary = {
        id: innovation.id,
        title: innovation.title,
        status: innovation.status,
        firstRound: node.round,
        lastRound: node.round,
      };

      // 查找该创新点的最终评分
      const score = node.scores.find(s => s.innovationId === innovation.id);
      if (score) {
        summary.finalScore = score.weightedScore;
      }

      innovationMap.set(innovation.id, summary);
    }
  }

  // 转换为数组并按 ID 排序
  const summaries = Array.from(innovationMap.values());
  summaries.sort((a, b) => a.id.localeCompare(b.id));

  return summaries;
}
