/**
 * BrainstormPath - 头脑风暴路径数据结构
 * 
 * 用于记录头脑风暴过程中的完整演进路径，支持：
 * - 多轮迭代追踪
 * - 关键节点回溯
 * - 创新点演化路径
 */

// ============================================================================
// 核心类型定义
// ============================================================================

/**
 * 路径状态
 */
export type PathStatus = 'active' | 'completed' | 'abandoned';

/**
 * 决策动作类型
 */
export type DecisionAction = 'ITERATE' | 'PASS_TO_DRAFT' | 'FORCE_PASS';

/**
 * 创新点状态
 */
export type InnovationStatus = 'active' | 'merged' | 'abandoned';

/**
 * 演化类型
 */
export type TransformationType = 'refine' | 'merge' | 'split' | 'pivot';

/**
 * 变更类型
 */
export type ChangeType = 'add' | 'modify' | 'remove';

// ============================================================================
// 评分相关类型
// ============================================================================

/**
 * 创新点评分
 */
export interface InnovationScore {
  innovationId: string;
  novelty: number;        // 新颖性 (1-10)
  creativity: number;     // 创造性 (1-10)
  practicality: number;   // 实用性 (1-10)
  businessValue: number;  // 商业价值 (1-10)
  weightedScore: number;  // 加权综合分
}

/**
 * 评分配置
 */
export interface ScoreWeights {
  novelty: number;        // 默认 0.3
  creativity: number;     // 默认 0.3
  practicality: number;   // 默认 0.2
  businessValue: number;  // 默认 0.2
}

// ============================================================================
// Agent 输出引用
// ============================================================================

/**
 * Agent 输出引用
 */
export interface AgentOutputRef {
  agentId: string;
  outputFile: string;     // 相对文件路径
  summary: string;        // 摘要
  keyPoints: string[];    // 关键要点
}

// ============================================================================
// 创新点快照
// ============================================================================

/**
 * 创新点快照
 */
export interface InnovationSnapshot {
  id: string;             // INN-001, INN-002, ...
  title: string;
  problem: string;        // 技术问题（简化版）
  coreSolution: string[]; // 核心方案（关键特征）
  differences: string[];  // 差异点
  status: InnovationStatus;
  mergedInto?: string;    // 如果被合并，记录合并到哪个方案
}

// ============================================================================
// 决策
// ============================================================================

/**
 * 轮次决策
 */
export interface RoundDecision {
  action: DecisionAction;
  reason: string;
  recommendations: string[];
}

// ============================================================================
// 边（演化关系）
// ============================================================================

/**
 * 变更记录
 */
export interface ChangeRecord {
  type: ChangeType;
  target: string;         // 创新点ID或特征名称
  description: string;
}

/**
 * 演化描述
 */
export interface Transformation {
  type: TransformationType;
  description: string;
  changes: ChangeRecord[];
}

/**
 * 边 - 节点间的演化关系
 */
export interface BrainstormEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  transformation: Transformation;
}

// ============================================================================
// 节点
// ============================================================================

/**
 * 脑力风暴节点 - 每轮迭代的快照
 */
export interface BrainstormNode {
  id: string;             // 节点ID (如 "round-1", "round-2")
  round: number;
  
  // Agent 输出引用
  agentOutputs: AgentOutputRef[];
  
  // 创新点快照
  innovations: InnovationSnapshot[];
  
  // 评分
  scores: InnovationScore[];
  
  // 决策
  decision: RoundDecision;
  
  // 时间戳
  timestamp: string;
}

// ============================================================================
// 最终决策
// ============================================================================

/**
 * 最终决策
 */
export interface FinalDecision {
  action: 'PASS_TO_DRAFT' | 'FORCE_PASS';
  selectedInnovation: string;
  timestamp: string;
}

// ============================================================================
// 路径主结构
// ============================================================================

/**
 * 头脑风暴路径
 */
export interface BrainstormPath {
  // 元信息
  id: string;             // 路径唯一标识
  projectId: string;      // 所属项目
  topic: string;          // 选题
  createdAt: string;      // 创建时间
  status: PathStatus;
  
  // 节点列表
  nodes: string[];        // 节点ID列表
  
  // 边列表
  edges: BrainstormEdge[];
  
  // 当前状态
  currentNodeId: string;
  
  // 最终决策
  finalDecision?: FinalDecision;
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建初始路径
 */
export function createInitialPath(
  projectId: string,
  topic: string
): BrainstormPath {
  const now = new Date().toISOString();
  const pathId = `path-${Date.now()}`;
  
  return {
    id: pathId,
    projectId,
    topic,
    createdAt: now,
    status: 'active',
    nodes: [],
    edges: [],
    currentNodeId: '',
    finalDecision: undefined
  };
}

/**
 * 创建初始节点
 */
export function createInitialNode(round: number): BrainstormNode {
  const now = new Date().toISOString();
  
  return {
    id: `round-${round}`,
    round,
    agentOutputs: [],
    innovations: [],
    scores: [],
    decision: {
      action: 'ITERATE',
      reason: '初始节点',
      recommendations: []
    },
    timestamp: now
  };
}

/**
 * 创建创新点快照
 */
export function createInnovationSnapshot(
  id: string,
  title: string,
  problem: string,
  coreSolution: string[],
  differences: string[]
): InnovationSnapshot {
  return {
    id,
    title,
    problem,
    coreSolution,
    differences,
    status: 'active'
  };
}

/**
 * 计算加权评分
 */
export function calculateWeightedScore(
  score: Omit<InnovationScore, 'weightedScore'>,
  weights: ScoreWeights = { novelty: 0.3, creativity: 0.3, practicality: 0.2, businessValue: 0.2 }
): number {
  return (
    score.novelty * weights.novelty +
    score.creativity * weights.creativity +
    score.practicality * weights.practicality +
    score.businessValue * weights.businessValue
  );
}

/**
 * 创建评分记录
 */
export function createInnovationScore(
  innovationId: string,
  novelty: number,
  creativity: number,
  practicality: number,
  businessValue: number,
  weights?: ScoreWeights
): InnovationScore {
  const weightedScore = calculateWeightedScore(
    { innovationId, novelty, creativity, practicality, businessValue },
    weights
  );
  
  return {
    innovationId,
    novelty,
    creativity,
    practicality,
    businessValue,
    weightedScore: Math.round(weightedScore * 10) / 10
  };
}

// ============================================================================
// 类型守卫
// ============================================================================

/**
 * 验证是否为有效的 BrainstormPath
 */
export function isValidBrainstormPath(data: unknown): data is BrainstormPath {
  if (typeof data !== 'object' || data === null) return false;
  
  const path = data as Record<string, unknown>;
  
  return (
    typeof path.id === 'string' &&
    typeof path.projectId === 'string' &&
    typeof path.topic === 'string' &&
    typeof path.createdAt === 'string' &&
    ['active', 'completed', 'abandoned'].includes(path.status as string) &&
    Array.isArray(path.nodes) &&
    Array.isArray(path.edges) &&
    typeof path.currentNodeId === 'string'
  );
}

/**
 * 验证是否为有效的 BrainstormNode
 */
export function isValidBrainstormNode(data: unknown): data is BrainstormNode {
  if (typeof data !== 'object' || data === null) return false;
  
  const node = data as Record<string, unknown>;
  
  return (
    typeof node.id === 'string' &&
    typeof node.round === 'number' &&
    Array.isArray(node.agentOutputs) &&
    Array.isArray(node.innovations) &&
    Array.isArray(node.scores) &&
    typeof node.decision === 'object' &&
    typeof node.timestamp === 'string'
  );
}
