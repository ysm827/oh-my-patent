import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

import {
  BrainstormNode,
  InnovationScore,
  InnovationSnapshot,
  createInitialPath,
  createInnovationScore,
} from '../../src/core/brainstorm-path';

import {
  initBrainstormDirectory,
  loadPath,
  saveNode,
  savePath,
} from '../../src/core/path-persistence';

import {
  render,
  renderOverview,
  renderNode,
  renderInnovation,
  renderBranch,
  renderDashboard,
} from '../../src/commands/render';

// ============================================================================
// 测试辅助
// ============================================================================

function mkInnovation(
  id: string,
  title: string,
  status: 'active' | 'merged' | 'abandoned' = 'active'
): InnovationSnapshot {
  return {
    id,
    title,
    problem: `问题-${title}`,
    coreSolution: [`方案1-${id}`, `方案2-${id}`],
    differences: [`差异-${id}`],
    status,
  };
}

function mkScore(innovationId: string, n: number, c: number, p: number, b: number): InnovationScore {
  return createInnovationScore(innovationId, n, c, p, b);
}

function mkNode(
  round: number,
  innovations: InnovationSnapshot[],
  scores: InnovationScore[],
  action: 'ITERATE' | 'PASS_TO_DRAFT' | 'FORCE_PASS' = 'ITERATE'
): BrainstormNode {
  return {
    id: `round-${round}`,
    round,
    agentOutputs: [
      {
        agentId: `agent-${round}`,
        outputFile: `out-${round}.md`,
        summary: `Round ${round} output`,
        keyPoints: [`k1-r${round}`],
      },
    ],
    innovations,
    scores,
    decision: {
      action,
      reason: `reason-r${round}`,
      recommendations: [`rec-r${round}`],
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// 测试
// ============================================================================

describe('render (passive)', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(tmpdir(), 'render-test-'));
    await initBrainstormDirectory(testDir);

    // 创建 3 轮数据
    const pathData = createInitialPath('proj-001', '测试专利选题');
    pathData.nodes = ['round-1', 'round-2', 'round-3'];
    pathData.currentNodeId = 'round-3';
    await savePath(pathData, testDir);

    // Round 1
    const inn1 = [mkInnovation('INN-001', '创新A'), mkInnovation('INN-002', '创新B')];
    const sc1 = [mkScore('INN-001', 6, 6, 7, 6), mkScore('INN-002', 5, 5, 6, 5)];
    await saveNode(mkNode(1, inn1, sc1), testDir);

    // Round 2
    const inn2 = [mkInnovation('INN-001', '创新A-优化'), mkInnovation('INN-003', '创新C')];
    const sc2 = [mkScore('INN-001', 8, 8, 8, 8), mkScore('INN-003', 7, 7, 7, 7)];
    await saveNode(mkNode(2, inn2, sc2), testDir);

    // Round 3
    const inn3 = [mkInnovation('INN-001', '创新A-最终版')];
    const sc3 = [mkScore('INN-001', 9, 9, 9, 9)];
    await saveNode(mkNode(3, inn3, sc3, 'PASS_TO_DRAFT'), testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('renderOverview produces boxed output with key data', async () => {
    const out = await renderOverview(testDir);

    expect(out).toContain('BRAINSTORM PATH OVERVIEW');
    expect(out).toContain('测试专利选题');
    expect(out).toContain('ACTIVE');
    expect(out).toContain('Round 1');
    expect(out).toContain('Round 2');
    expect(out).toContain('Round 3');
    expect(out).toContain('INN-001');
    expect(out).toContain('INN-002');
    expect(out).toContain('PASS_TO_DRAFT');
    expect(out).toContain('SCORE PROGRESSION');
  });

  test('renderNode shows detail for a specific round', async () => {
    const out = await renderNode(testDir, 'round-2');

    expect(out).toContain('NODE DETAIL: round-2');
    expect(out).toContain('Round:       2');
    expect(out).toContain('INN-001');
    expect(out).toContain('创新A-优化');
    expect(out).toContain('INN-003');
    expect(out).toContain('AGENT OUTPUTS');
    expect(out).toContain('DECISION');
  });

  test('renderNode returns not-found for missing node', async () => {
    const out = await renderNode(testDir, 'round-99');
    expect(out).toContain('not found');
  });

  test('renderInnovation shows evolution across rounds', async () => {
    const out = await renderInnovation(testDir, 'INN-001');

    expect(out).toContain('INNOVATION HISTORY: INN-001');
    expect(out).toContain('ROUND 1');
    expect(out).toContain('ROUND 2');
    expect(out).toContain('ROUND 3');
    expect(out).toContain('创新A');
    expect(out).toContain('创新A-优化');
    expect(out).toContain('Weighted');
  });

  test('renderInnovation returns not-found for missing innovation', async () => {
    const out = await renderInnovation(testDir, 'INN-999');
    expect(out).toContain('not found');
  });

  test('render with overview mode', async () => {
    const out = await render({ projectPath: testDir, mode: 'overview' });
    expect(out).toContain('BRAINSTORM PATH OVERVIEW');
  });

  test('render with node mode', async () => {
    const out = await render({ projectPath: testDir, mode: 'node', targetId: 'round-1' });
    expect(out).toContain('NODE DETAIL: round-1');
  });

  test('render with innovation mode', async () => {
    const out = await render({ projectPath: testDir, mode: 'innovation', targetId: 'INN-001' });
    expect(out).toContain('INNOVATION HISTORY: INN-001');
  });

  test('render with dashboard mode combines overview + node + innovation', async () => {
    const out = await renderDashboard(testDir);

    expect(out).toContain('BRAINSTORM PATH OVERVIEW');
    expect(out).toContain('NODE DETAIL');
    expect(out).toContain('INNOVATION HISTORY');
  });

  test('render writes to file when outputFile is specified', async () => {
    const outFile = path.join(testDir, 'output.txt');
    await render({ projectPath: testDir, mode: 'overview', outputFile: outFile });

    const content = await fs.readFile(outFile, 'utf-8');
    expect(content).toContain('BRAINSTORM PATH OVERVIEW');
  });

  test('render throws on missing targetId for node mode', async () => {
    await expect(
      render({ projectPath: testDir, mode: 'node' })
    ).rejects.toThrow('targetId');
  });

  test('renderOverview with no path data returns warning', async () => {
    const emptyDir = await fs.mkdtemp(path.join(tmpdir(), 'render-empty-'));
    const out = await renderOverview(emptyDir);
    expect(out).toContain('No brainstorm path data');
    await fs.rm(emptyDir, { recursive: true, force: true });
  });
});
