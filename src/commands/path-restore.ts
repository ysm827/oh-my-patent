/**
 * PathRestore - 方案恢复 API
 *
 * 提供创新点的恢复和归档功能，支持：
 * - 恢复被放弃的创新点
 * - 归档（放弃）创新点
 * - 获取创新点状态详情
 */

import { loadNode, saveNode, loadAllNodes } from '../core/path-persistence.js';
import { InnovationStatus, BrainstormNode } from '../core/brainstorm-path.js';

// ============================================================================
// 返回类型定义
// ============================================================================

/**
 * 恢复操作结果
 */
export interface RestoreResult {
  innovationId: string;
  nodeId: string;
  previousStatus: InnovationStatus;
  newStatus: InnovationStatus;
  message: string;
}

/**
 * 归档操作结果
 */
export interface ArchiveResult {
  innovationId: string;
  nodeId: string;
  reason: string;
  message: string;
}

/**
 * 创新点状态信息
 */
export interface InnovationStatusInfo {
  innovationId: string;
  currentStatus: InnovationStatus;
  nodeId: string;
  round: number;
  mergedInto?: string;
  history: Array<{
    round: number;
    status: InnovationStatus;
    action: 'created' | 'merged' | 'abandoned' | 'restored';
  }>;
}

// ============================================================================
// 核心函数
// ============================================================================

/**
 * 恢复被放弃的创新点
 *
 * @param projectPath - 项目根目录路径
 * @param nodeId - 节点ID（如 "round-1"）
 * @param innovationId - 创新点ID
 * @returns 恢复结果
 * @throws 如果节点或创新点不存在，或创新点状态不是 'abandoned'
 */
export async function restoreInnovation(
  projectPath: string,
  nodeId: string,
  innovationId: string
): Promise<RestoreResult> {
  // 1. 加载节点
  const node = await loadNode(projectPath, nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  // 2. 找到创新点
  const innovation = node.innovations.find(i => i.id === innovationId);
  if (!innovation) {
    throw new Error(`Innovation not found: ${innovationId} in node ${nodeId}`);
  }

  // 3. 检查当前状态
  const previousStatus = innovation.status;
  if (previousStatus !== 'abandoned') {
    throw new Error(
      `Cannot restore innovation ${innovationId}: current status is '${previousStatus}', not 'abandoned'`
    );
  }

  // 4. 更新状态
  innovation.status = 'active';

  // 5. 清除 mergedInto 字段（如果存在）
  if (innovation.mergedInto) {
    delete innovation.mergedInto;
  }

  // 6. 保存节点
  await saveNode(node, projectPath);

  // 7. 返回结果
  return {
    innovationId,
    nodeId,
    previousStatus,
    newStatus: 'active',
    message: `Innovation ${innovationId} has been restored from 'abandoned' to 'active'`,
  };
}

/**
 * 归档（放弃）创新点
 *
 * @param projectPath - 项目根目录路径
 * @param nodeId - 节点ID（如 "round-1"）
 * @param innovationId - 创新点ID
 * @param reason - 归档原因
 * @returns 归档结果
 * @throws 如果节点或创新点不存在，或创新点状态已经是 'abandoned'
 */
export async function archiveInnovation(
  projectPath: string,
  nodeId: string,
  innovationId: string,
  reason: string
): Promise<ArchiveResult> {
  // 1. 加载节点
  const node = await loadNode(projectPath, nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  // 2. 找到创新点
  const innovation = node.innovations.find(i => i.id === innovationId);
  if (!innovation) {
    throw new Error(`Innovation not found: ${innovationId} in node ${nodeId}`);
  }

  // 3. 检查当前状态
  if (innovation.status === 'abandoned') {
    throw new Error(`Innovation ${innovationId} is already abandoned`);
  }

  // 4. 更新状态
  innovation.status = 'abandoned';

  // 5. 保存节点
  await saveNode(node, projectPath);

  // 6. 返回结果
  return {
    innovationId,
    nodeId,
    reason,
    message: `Innovation ${innovationId} has been archived with reason: ${reason}`,
  };
}

/**
 * 获取创新点状态详情
 *
 * @param projectPath - 项目根目录路径
 * @param innovationId - 创新点ID
 * @returns 创新点状态信息，如果不存在则返回 null
 */
export async function getInnovationStatus(
  projectPath: string,
  innovationId: string
): Promise<InnovationStatusInfo | null> {
  // 1. 加载所有节点
  const nodes = await loadAllNodes(projectPath);

  if (nodes.length === 0) {
    return null;
  }

  // 2. 追踪创新点的状态历史
  const history: InnovationStatusInfo['history'] = [];
  let currentStatus: InnovationStatus = 'active';
  let currentNodeId: string = '';
  let currentRound: number = 0;
  let mergedInto: string | undefined;

  // 3. 遍历所有节点，查找该创新点的状态变化
  for (const node of nodes) {
    const innovation = node.innovations.find(i => i.id === innovationId);

    if (innovation) {
      // 确定动作类型
      let action: 'created' | 'merged' | 'abandoned' | 'restored';

      if (history.length === 0) {
        action = 'created';
      } else {
        const prevStatus = history[history.length - 1].status;
        if (innovation.status === 'merged' && prevStatus !== 'merged') {
          action = 'merged';
        } else if (innovation.status === 'abandoned' && prevStatus !== 'abandoned') {
          action = 'abandoned';
        } else if (innovation.status === 'active' && prevStatus === 'abandoned') {
          action = 'restored';
        } else {
          // 状态未变化，跳过记录
          continue;
        }
      }

      history.push({
        round: node.round,
        status: innovation.status,
        action,
      });

      // 更新当前状态
      currentStatus = innovation.status;
      currentNodeId = node.id;
      currentRound = node.round;
      mergedInto = innovation.mergedInto;
    }
  }

  // 4. 如果没有找到创新点，返回 null
  if (history.length === 0) {
    return null;
  }

  // 5. 构建返回结果
  return {
    innovationId,
    currentStatus,
    nodeId: currentNodeId,
    round: currentRound,
    mergedInto,
    history,
  };
}
