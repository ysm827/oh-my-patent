/**
 * BrainstormPathGraph - 内存图存储实现
 *
 * 用于管理头脑风暴路径的图结构数据，支持：
 * - 节点和边的增删查改
 * - 前驱/后继节点查询
 * - 创新点演化路径追踪
 */

import {
  BrainstormPath,
  BrainstormNode,
  BrainstormEdge,
  InnovationSnapshot,
  InnovationScore,
} from './brainstorm-path.js';

// ============================================================================
// 图节点和边类型
// ============================================================================

/**
 * 节点类型
 */
export type NodeType = 'Round' | 'Innovation' | 'AgentOutput' | 'Decision';

/**
 * 边类型
 */
export type EdgeType =
  | 'PREV_ROUND'      // 轮次顺序
  | 'GENERATES'       // Agent 输出产生创新点
  | 'EVALUATES'       // 评估节点
  | 'MERGES_INTO'     // 创新点合并
  | 'DERIVES_FROM'    // 创新点演化
  | 'DECIDES'         // 决策边
  | 'BRANCHES_FROM';  // 分支

/**
 * 图节点
 */
export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, unknown>;
}

/**
 * 图边
 */
export interface GraphEdge {
  id: string;
  type: EdgeType;
  from: string;
  to: string;
  properties: Record<string, unknown>;
}

// ============================================================================
// 评分和合并记录类型
// ============================================================================

/**
 * 评分记录
 */
export interface ScoreRecord {
  round: number;
  score: InnovationScore;
}

/**
 * 合并记录
 */
export interface MergeRecord {
  from: string;
  to: string;
  round: number;
  reason: string;
}

// ============================================================================
// BrainstormPathGraph 类
// ============================================================================

/**
 * 头脑风暴路径图 - 内存存储实现
 */
export class BrainstormPathGraph {
  private nodes: Map<string, GraphNode>;
  private edges: Map<string, GraphEdge>;
  private edgeIndex: Map<string, string>; // "from->to" -> edgeId for O(1) lookup
  private adjacencyList: Map<string, Set<string>>;
  private reverseAdjacencyList: Map<string, Set<string>>;
  private pathMeta: { id: string; projectId: string; topic: string; createdAt: string };

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.edgeIndex = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();
    this.pathMeta = { id: `path-${Date.now()}`, projectId: '', topic: '', createdAt: new Date().toISOString() };
  }

  /**
   * 设置路径元信息（保留原始 id 和 createdAt）
   */
  setPathMeta(meta: { id: string; projectId: string; topic: string; createdAt: string }): void {
    this.pathMeta = meta;
  }

  /**
   * 获取路径元信息
   */
  getPathMeta(): { id: string; projectId: string; topic: string; createdAt: string } {
    return { ...this.pathMeta };
  }

  // ============================================================================
  // 节点操作
  // ============================================================================

  /**
   * 添加节点
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Set());
    }
    if (!this.reverseAdjacencyList.has(node.id)) {
      this.reverseAdjacencyList.set(node.id, new Set());
    }
  }

  /**
   * 获取节点
   */
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * 删除节点（同时删除相关的边）
   */
  removeNode(nodeId: string): void {
    // 删除所有相关的边
    const edgesToRemove: string[] = [];
    for (const [edgeId, edge] of this.edges) {
      if (edge.from === nodeId || edge.to === nodeId) {
        edgesToRemove.push(edgeId);
      }
    }
    edgesToRemove.forEach(edgeId => this.removeEdge(edgeId));

    // 删除节点
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    this.reverseAdjacencyList.delete(nodeId);
  }

  /**
   * 获取所有节点
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  // ============================================================================
  // 边操作
  // ============================================================================

  /**
   * 添加边
   */
  addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);
    this.edgeIndex.set(`${edge.from}->${edge.to}`, edge.id);

    // 更新正向邻接表
    const fromAdj = this.adjacencyList.get(edge.from) || new Set();
    fromAdj.add(edge.to);
    this.adjacencyList.set(edge.from, fromAdj);

    // 更新反向邻接表
    const toRevAdj = this.reverseAdjacencyList.get(edge.to) || new Set();
    toRevAdj.add(edge.from);
    this.reverseAdjacencyList.set(edge.to, toRevAdj);
  }

  /**
   * 获取边
   */
  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  /**
   * 删除边
   */
  removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) return;

    // 更新正向邻接表
    const fromAdj = this.adjacencyList.get(edge.from);
    if (fromAdj) {
      fromAdj.delete(edge.to);
    }

    // 更新反向邻接表
    const toRevAdj = this.reverseAdjacencyList.get(edge.to);
    if (toRevAdj) {
      toRevAdj.delete(edge.from);
    }

    this.edgeIndex.delete(`${edge.from}->${edge.to}`);
    this.edges.delete(edgeId);
  }

  /**
   * 获取所有边
   */
  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  // ============================================================================
  // 查询操作
  // ============================================================================

  /**
   * 获取节点的所有前驱节点
   */
  getPredecessors(nodeId: string): GraphNode[] {
    const predecessorIds = this.reverseAdjacencyList.get(nodeId) || new Set();
    const predecessors: GraphNode[] = [];

    for (const id of predecessorIds) {
      const node = this.nodes.get(id);
      if (node) {
        predecessors.push(node);
      }
    }

    return predecessors;
  }

  /**
   * 获取节点的所有后继节点
   */
  getSuccessors(nodeId: string): GraphNode[] {
    const successorIds = this.adjacencyList.get(nodeId) || new Set();
    const successors: GraphNode[] = [];

    for (const id of successorIds) {
      const node = this.nodes.get(id);
      if (node) {
        successors.push(node);
      }
    }

    return successors;
  }

  /**
   * 获取指定类型的前驱节点
   */
  getPredecessorsByType(nodeId: string, edgeType: EdgeType): GraphNode[] {
    const predecessorIds = this.reverseAdjacencyList.get(nodeId) || new Set();
    const predecessors: GraphNode[] = [];

    for (const id of predecessorIds) {
      const edgeKey = this.edgeIndex.get(`${id}->${nodeId}`);
      const edge = edgeKey ? this.edges.get(edgeKey) : undefined;
      if (edge && edge.type === edgeType) {
        const node = this.nodes.get(id);
        if (node) {
          predecessors.push(node);
        }
      }
    }

    return predecessors;
  }

  /**
   * 获取指定类型的后继节点
   */
  getSuccessorsByType(nodeId: string, edgeType: EdgeType): GraphNode[] {
    const successorIds = this.adjacencyList.get(nodeId) || new Set();
    const successors: GraphNode[] = [];

    for (const id of successorIds) {
      const edgeKey = this.edgeIndex.get(`${nodeId}->${id}`);
      const edge = edgeKey ? this.edges.get(edgeKey) : undefined;
      if (edge && edge.type === edgeType) {
        const node = this.nodes.get(id);
        if (node) {
          successors.push(node);
        }
      }
    }

    return successors;
  }

  /**
   * 获取创新点的完整演化路径
   */
  getInnovationEvolution(innovationId: string): GraphNode[] {
    const path: GraphNode[] = [];
    let current = this.nodes.get(innovationId);

    while (current) {
      path.unshift(current);

      // 找到 DERIVES_FROM 的前驱
      const predecessors = this.getPredecessorsByType(current.id, 'DERIVES_FROM');
      if (predecessors.length > 0) {
        current = predecessors[0];
      } else {
        break;
      }
    }

    return path;
  }

  // ============================================================================
  // 序列化与反序列化
  // ============================================================================

  /**
   * 导出为 BrainstormPath JSON 格式
   */
  toJSON(): BrainstormPath {
    const nodeIds: string[] = Array.from(this.nodes.keys());
    const edges: BrainstormEdge[] = [];

    // 转换边格式
    for (const edge of this.edges.values()) {
      const validTypes = ['refine', 'merge', 'split', 'pivot'] as const;
      const typeVal = validTypes.includes(edge.properties.type as typeof validTypes[number])
        ? (edge.properties.type as typeof validTypes[number])
        : 'refine';

      edges.push({
        id: edge.id,
        fromNodeId: edge.from,
        toNodeId: edge.to,
        transformation: {
          type: typeVal,
          description: (edge.properties.description as string) || '',
          changes: (edge.properties.changes as Array<{ type: 'add' | 'modify' | 'remove'; target: string; description: string }>) || []
        }
      });
    }

    // 获取路径元信息（从第一个 Round 节点推断，保留原始值）
    const roundNodes = Array.from(this.nodes.values())
      .filter(n => n.type === 'Round')
      .sort((a, b) => {
        const roundA = (a.properties.round as number) || 0;
        const roundB = (b.properties.round as number) || 0;
        return roundA - roundB;
      });

    const firstRound = roundNodes[0];
    const lastRound = roundNodes[roundNodes.length - 1];

    // 优先使用 pathMeta，其次从节点推断
    const projectId = this.pathMeta.projectId || (firstRound?.properties.projectId as string) || '';
    const topic = this.pathMeta.topic || (firstRound?.properties.topic as string) || '';
    const createdAt = this.pathMeta.createdAt || (firstRound?.properties.timestamp as string) || new Date().toISOString();
    const pathId = this.pathMeta.id || `path-${Date.now()}`;

    // 确定当前节点和状态
    const currentNodeId = lastRound?.id || '';
    const finalDecision = lastRound?.properties.finalDecision as BrainstormPath['finalDecision'];

    return {
      id: pathId,
      projectId,
      topic,
      createdAt,
      status: finalDecision ? 'completed' : 'active',
      nodes: nodeIds,
      edges,
      currentNodeId,
      finalDecision
    };
  }

  /**
   * 从 BrainstormPath JSON 导入
   */
  static fromJSON(data: BrainstormPath, nodes?: BrainstormNode[]): BrainstormPathGraph {
    const graph = new BrainstormPathGraph();

    // 保留原始路径元信息
    graph.setPathMeta({
      id: data.id,
      projectId: data.projectId,
      topic: data.topic,
      createdAt: data.createdAt,
    });

    // 重建节点（如果提供了 BrainstormNode 数据）
    if (nodes) {
      for (const node of nodes) {
        graph.addNode(BrainstormPathGraph.createNodeFromBrainstormNode(node, data.projectId, data.topic));
      }
    }

    // 重建边
    for (const edge of data.edges) {
      graph.addEdge({
        id: edge.id,
        type: 'DERIVES_FROM', // 默认类型
        from: edge.fromNodeId,
        to: edge.toNodeId,
        properties: {
          type: edge.transformation.type,
          description: edge.transformation.description,
          changes: edge.transformation.changes
        }
      });
    }

    return graph;
  }

  /**
   * 从 BrainstormNode 创建图节点
   */
  static createNodeFromBrainstormNode(node: BrainstormNode, projectId: string, topic: string): GraphNode {
    return {
      id: node.id,
      type: 'Round',
      label: `Round ${node.round}`,
      properties: {
        round: node.round,
        agentOutputs: node.agentOutputs,
        innovations: node.innovations,
        scores: node.scores,
        decision: node.decision,
        timestamp: node.timestamp,
        projectId,
        topic
      }
    };
  }
}

// ============================================================================
// 辅助查询函数
// ============================================================================

/**
 * 获取某轮次的所有创新点
 */
export function getRoundInnovations(graph: BrainstormPathGraph, roundId: string): InnovationSnapshot[] {
  const roundNode = graph.getNode(roundId);
  if (!roundNode || roundNode.type !== 'Round') {
    return [];
  }

  const innovations = roundNode.properties.innovations as InnovationSnapshot[] | undefined;
  return innovations || [];
}

/**
 * 获取创新点的评分历史
 */
export function getScoreHistory(graph: BrainstormPathGraph, innovationId: string): ScoreRecord[] {
  const history: ScoreRecord[] = [];

  // 遍历所有 Round 节点
  for (const node of graph.getAllNodes()) {
    if (node.type !== 'Round') continue;

    const scores = node.properties.scores as InnovationScore[] | undefined;
    if (!scores) continue;

    const score = scores.find(s => s.innovationId === innovationId);
    if (score) {
      history.push({
        round: node.properties.round as number,
        score
      });
    }
  }

  return history.sort((a, b) => a.round - b.round);
}

/**
 * 获取创新点的合并历史
 */
export function getMergeHistory(graph: BrainstormPathGraph, innovationId: string): MergeRecord[] {
  const merges: MergeRecord[] = [];

  // 查找所有从该创新点出发的 MERGES_INTO 边
  for (const edge of graph.getAllEdges()) {
    if (edge.type === 'MERGES_INTO' && edge.from === innovationId) {
      merges.push({
        from: innovationId,
        to: edge.to,
        round: (edge.properties.round as number) || 0,
        reason: (edge.properties.reason as string) || ''
      });
    }
  }

  return merges;
}

/**
 * 获取路径概览信息
 *
 * 注意：PathOverview 类型定义在 src/commands/path-query.ts 中，
 * 此处仅提供基于图数据的概览计算函数。
 */
export function getPathOverviewFromGraph(graph: BrainstormPathGraph) {
  const roundNodes = graph.getAllNodes()
    .filter(n => n.type === 'Round')
    .sort((a, b) => {
      const roundA = (a.properties.round as number) || 0;
      const roundB = (b.properties.round as number) || 0;
      return roundA - roundB;
    });

  const innovationEvolution: Array<{
    round: number;
    count: number;
    active: string[];
    merged?: string[];
    final?: boolean;
  }> = [];
  const scoreProgression: Array<{
    round: number;
    avgScore: number;
  }> = [];

  for (const node of roundNodes) {
    const round = node.properties.round as number;
    const innovations = (node.properties.innovations as InnovationSnapshot[]) || [];
    const scores = (node.properties.scores as InnovationScore[]) || [];

    // 统计活跃和合并的创新点
    const active = innovations.filter(i => i.status === 'active').map(i => i.id);
    const merged = innovations.filter(i => i.status === 'merged').map(i => `${i.id}→${i.mergedInto}`);

    innovationEvolution.push({
      round,
      count: innovations.length,
      active,
      merged: merged.length > 0 ? merged : undefined,
      final: round === roundNodes[roundNodes.length - 1].properties.round
    });

    // 计算平均分
    if (scores.length > 0) {
      const avgScore = scores.reduce((sum, s) => sum + s.weightedScore, 0) / scores.length;
      scoreProgression.push({
        round,
        avgScore: Math.round(avgScore * 10) / 10
      });
    }
  }

  const lastRound = roundNodes[roundNodes.length - 1];

  return {
    totalRounds: roundNodes.length,
    currentRound: lastRound?.id || '',
    innovationEvolution,
    scoreProgression
  };
}
