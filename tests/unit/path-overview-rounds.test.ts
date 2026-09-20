import { describe, test, expect, afterAll } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getPathOverview } from '../../src/commands/path-query';
import { BrainstormPathGraph, getPathOverviewFromGraph } from '../../src/core/path-graph';
import type { BrainstormNode } from '../../src/core/brainstorm-path';

/**
 * REQ-019: both overview APIs must agree on `totalRounds`.
 *
 * The command-layer implementation counted `pathData.nodes.length` — entries
 * of the id list in path.json — while the graph implementation counted actual
 * Round nodes. A stale id (node file deleted, id not pruned) made the two
 * APIs disagree. The fixture below reproduces exactly that: three ids, two
 * node files.
 */
describe('path overview round counts agree (REQ-019)', () => {
  const dirs: string[] = [];
  const tempDir = () => {
    const dir = mkdtempSync(join(tmpdir(), 'omp-overview-'));
    dirs.push(dir);
    return dir;
  };

  afterAll(() => {
    for (const dir of dirs) {
      if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    }
  });

  const nodeFile = (id: string, round: number): BrainstormNode => ({
    id,
    round,
    agentOutputs: [],
    innovations: [],
    scores: [],
    decision: { action: 'ITERATE', reason: 'fixture', recommendations: [] },
    timestamp: '2026-09-15T10:00:00.000Z',
  });

  const makeProject = (): string => {
    const projectPath = tempDir();
    const nodesDir = join(projectPath, '.brainstorm', 'nodes');
    mkdirSync(nodesDir, { recursive: true });

    writeFileSync(
      join(projectPath, '.brainstorm', 'path.json'),
      JSON.stringify({
        id: 'path-fixture',
        projectId: 'proj',
        topic: 't',
        createdAt: '2026-09-15T10:00:00.000Z',
        status: 'active',
        nodes: ['round-1', 'round-2', 'round-99'], // round-99 has no file
        edges: [],
        currentNodeId: 'round-2',
      }),
      'utf-8',
    );
    writeFileSync(join(nodesDir, 'round-1.json'), JSON.stringify(nodeFile('round-1', 1)), 'utf-8');
    writeFileSync(join(nodesDir, 'round-2.json'), JSON.stringify(nodeFile('round-2', 2)), 'utf-8');

    return projectPath;
  };

  test('the command API counts loaded round nodes, not id-list entries', async () => {
    const overview = await getPathOverview(makeProject());
    expect(overview).not.toBeNull();
    // Pre-fix this was 3 (the stale round-99 id inflated the count).
    expect(overview?.totalRounds).toBe(2);
  });

  test('both APIs return the same totalRounds for the same data', async () => {
    const projectPath = makeProject();
    const commandOverview = await getPathOverview(projectPath);

    const { loadPath, loadAllNodes } = await import('../../src/core/path-persistence');
    const pathData = (await loadPath(projectPath))!;
    const nodes = await loadAllNodes(projectPath);
    const graphOverview = getPathOverviewFromGraph(
      BrainstormPathGraph.fromJSON(pathData, nodes),
    );

    expect(commandOverview?.totalRounds).toBe(graphOverview.totalRounds);
    expect(graphOverview.totalRounds).toBe(2);
  });
});
