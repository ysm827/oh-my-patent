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
	getSavedRounds,
	initBrainstormDirectory,
	loadAllNodes,
	loadNode,
	loadPath,
	saveNode,
	savePath,
} from '../../src/core/path-persistence';

import {
	getInnovationHistory,
	getNodeDetail,
	getPathOverview,
	getScoreProgression,
	listAllInnovations,
} from '../../src/commands/path-query';

import {
	createBranchFromNode,
	deleteBranch,
	getBranchDetail,
	listBranches,
} from '../../src/commands/path-branch';

import {
	archiveInnovation,
	getInnovationStatus,
	restoreInnovation,
} from '../../src/commands/path-restore';

function createTestInnovation(
	id: string,
	title: string,
	status: 'active' | 'merged' | 'abandoned' = 'active'
): InnovationSnapshot {
	return {
		id,
		title,
		problem: `测试问题 - ${title}`,
		coreSolution: [`特征1-${id}`, `特征2-${id}`],
		differences: [`差异点-${id}`],
		status,
	};
}

function createTestNode(
	round: number,
	innovations: InnovationSnapshot[],
	scores: InnovationScore[]
): BrainstormNode {
	const now = new Date().toISOString();

	return {
		id: `round-${round}`,
		round,
		agentOutputs: [
			{
				agentId: `test-agent-${round}`,
				outputFile: `outputs/agent-${round}.md`,
				summary: `第${round}轮代理输出摘要`,
				keyPoints: [`要点1-${round}`, `要点2-${round}`],
			},
		],
		innovations,
		scores,
		decision: {
			action: 'ITERATE',
			reason: `继续第${round + 1}轮迭代`,
			recommendations: [`建议1-${round}`],
		},
		timestamp: now,
	};
}

describe('BrainstormPath integration', () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = await fs.mkdtemp(path.join(tmpdir(), 'brainstorm-test-'));
	});

	afterEach(async () => {
		await fs.rm(testDir, { recursive: true, force: true });
	});

	test('creates a path and saves nodes', async () => {
		await initBrainstormDirectory(testDir);

		const initialPath = createInitialPath('test-project-001', '测试专利选题');
		expect(initialPath.id.startsWith('path-')).toBe(true);
		expect(initialPath.projectId).toBe('test-project-001');
		expect(initialPath.topic).toBe('测试专利选题');
		expect(initialPath.status).toBe('active');
		expect(initialPath.nodes).toHaveLength(0);

		await savePath(initialPath, testDir);

		const loadedPath = await loadPath(testDir);
		expect(loadedPath).not.toBeNull();
		expect(loadedPath!.id).toBe(initialPath.id);
		expect(loadedPath!.projectId).toBe('test-project-001');

		const innovations1 = [
			createTestInnovation('INN-001', '创新点一'),
			createTestInnovation('INN-002', '创新点二'),
		];
		const scores1 = [
			createInnovationScore('INN-001', 8, 8, 9, 8),
			createInnovationScore('INN-002', 7, 7, 8, 7),
		];
		const node1 = createTestNode(1, innovations1, scores1);

		await saveNode(node1, testDir);

		const loadedNode1 = await loadNode(testDir, 'round-1');
		expect(loadedNode1).not.toBeNull();
		expect(loadedNode1!.id).toBe('round-1');
		expect(loadedNode1!.round).toBe(1);
		expect(loadedNode1!.innovations).toHaveLength(2);
		expect(loadedNode1!.innovations[0].id).toBe('INN-001');
		expect(loadedNode1!.scores).toHaveLength(2);

		const innovations2 = [
			createTestInnovation('INN-001', '创新点一（优化）'),
			createTestInnovation('INN-003', '创新点三'),
		];
		const scores2 = [
			createInnovationScore('INN-001', 9, 9, 9, 9),
			createInnovationScore('INN-003', 8, 8, 8, 8),
		];
		const node2 = createTestNode(2, innovations2, scores2);

		await saveNode(node2, testDir);

		const savedRounds = await getSavedRounds(testDir);
		expect(savedRounds).toEqual([1, 2]);

		const allNodes = await loadAllNodes(testDir);
		expect(allNodes).toHaveLength(2);
	});

	test('queries path overview and innovation history', async () => {
		await initBrainstormDirectory(testDir);

		const initialPath = createInitialPath('test-project-002', '路径概览测试');
		await savePath(initialPath, testDir);

		const innovations1 = [
			createTestInnovation('INN-001', '创新点A'),
			createTestInnovation('INN-002', '创新点B'),
		];
		const scores1 = [
			createInnovationScore('INN-001', 8, 8, 9, 8),
			createInnovationScore('INN-002', 7, 7, 8, 7),
		];
		const node1 = createTestNode(1, innovations1, scores1);
		await saveNode(node1, testDir);

		const loadedPath = await loadPath(testDir);
		loadedPath!.nodes = ['round-1'];
		loadedPath!.currentNodeId = 'round-1';
		await savePath(loadedPath!, testDir);

		const overview = await getPathOverview(testDir);
		expect(overview).not.toBeNull();
		expect(overview!.totalRounds).toBe(1);
		expect(overview!.currentRound).toBe('round-1');
		expect(overview!.status).toBe('active');
		expect(overview!.innovationEvolution).toHaveLength(1);
		expect(overview!.innovationEvolution[0].count).toBe(2);
		expect(overview!.innovationEvolution[0].active).toHaveLength(2);
		expect(overview!.scoreProgression).toHaveLength(1);
		expect(overview!.scoreProgression[0].round).toBe(1);
		expect(overview!.scoreProgression[0].avgScore).toBeGreaterThan(0);

		const nodeDetail = await getNodeDetail(testDir, 'round-1');
		expect(nodeDetail).not.toBeNull();
		expect(nodeDetail!.id).toBe('round-1');
		expect(nodeDetail!.round).toBe(1);
		expect(nodeDetail!.innovations).toHaveLength(2);
		expect(nodeDetail!.agentOutputs).toHaveLength(1);
		expect(nodeDetail!.decision.action).toBe('ITERATE');

		const history = await getInnovationHistory(testDir, 'INN-001');
		expect(history).not.toBeNull();
		expect(history!.innovationId).toBe('INN-001');
		expect(history!.evolution).toHaveLength(1);
		expect(history!.currentStatus).toBe('active');

		const allInnovations = await listAllInnovations(testDir);
		expect(allInnovations).toHaveLength(2);
		expect(allInnovations[0].id).toBe('INN-001');
		expect(allInnovations[1].id).toBe('INN-002');
	});

	test('creates and deletes a branch from an existing node', async () => {
		await initBrainstormDirectory(testDir);

		const initialPath = createInitialPath('test-project-003', '分支测试');
		await savePath(initialPath, testDir);

		for (let round = 1; round <= 3; round += 1) {
			const innovations = [
				createTestInnovation(`INN-${round}01`, `创新点${round}A`),
				createTestInnovation(`INN-${round}02`, `创新点${round}B`),
			];
			const scores = [
				createInnovationScore(`INN-${round}01`, 7 + round, 7 + round, 8 + round, 7 + round),
				createInnovationScore(`INN-${round}02`, 6 + round, 6 + round, 7 + round, 6 + round),
			];
			await saveNode(createTestNode(round, innovations, scores), testDir);
		}

		const loadedPath = await loadPath(testDir);
		loadedPath!.nodes = ['round-1', 'round-2', 'round-3'];
		loadedPath!.currentNodeId = 'round-3';
		await savePath(loadedPath!, testDir);

		const branchResult = await createBranchFromNode(testDir, 'round-2', '探索替代创新方向');

		expect(branchResult.branchId.includes('-branch-')).toBe(true);
		expect(branchResult.parentPathId).toBe(loadedPath!.id);
		expect(branchResult.branchPointNodeId).toBe('round-2');
		expect(branchResult.branchReason).toBe('探索替代创新方向');

		const branches = await listBranches(testDir);
		expect(branches).toHaveLength(1);
		expect(branches[0].branchId).toBe(branchResult.branchId);
		expect(branches[0].status).toBe('active');

		const branchDetail = await getBranchDetail(testDir, branchResult.branchId);
		expect(branchDetail).not.toBeNull();
		expect(branchDetail!.nodes).toHaveLength(2);
		expect(branchDetail!.currentNodeId).toBe('round-2');

		const deleted = await deleteBranch(testDir, branchResult.branchId);
		expect(deleted).toBe(true);

		const branchesAfterDelete = await listBranches(testDir);
		expect(branchesAfterDelete).toHaveLength(0);
	});

	test('restores and archives innovations', async () => {
		await initBrainstormDirectory(testDir);

		const initialPath = createInitialPath('test-project-004', '恢复测试');
		await savePath(initialPath, testDir);

		const innovations = [
			createTestInnovation('INN-001', '活跃创新点', 'active'),
			createTestInnovation('INN-002', '被放弃的创新点', 'abandoned'),
			createTestInnovation('INN-003', '活跃创新点2', 'active'),
		];
		const scores = [
			createInnovationScore('INN-001', 8, 8, 9, 8),
			createInnovationScore('INN-002', 5, 5, 5, 5),
			createInnovationScore('INN-003', 7, 7, 8, 7),
		];
		await saveNode(createTestNode(1, innovations, scores), testDir);

		const loadedPath = await loadPath(testDir);
		loadedPath!.nodes = ['round-1'];
		loadedPath!.currentNodeId = 'round-1';
		await savePath(loadedPath!, testDir);

		const statusBefore = await getInnovationStatus(testDir, 'INN-002');
		expect(statusBefore).not.toBeNull();
		expect(statusBefore!.currentStatus).toBe('abandoned');

		const restoreResult = await restoreInnovation(testDir, 'round-1', 'INN-002');
		expect(restoreResult.innovationId).toBe('INN-002');
		expect(restoreResult.previousStatus).toBe('abandoned');
		expect(restoreResult.newStatus).toBe('active');

		const statusAfter = await getInnovationStatus(testDir, 'INN-002');
		expect(statusAfter).not.toBeNull();
		expect(statusAfter!.currentStatus).toBe('active');

		const archiveResult = await archiveInnovation(testDir, 'round-1', 'INN-001', '技术实现过于复杂');
		expect(archiveResult.innovationId).toBe('INN-001');
		expect(archiveResult.reason).toBe('技术实现过于复杂');

		const archivedStatus = await getInnovationStatus(testDir, 'INN-001');
		expect(archivedStatus).not.toBeNull();
		expect(archivedStatus!.currentStatus).toBe('abandoned');
	});

	test('tracks score progression across rounds', async () => {
		await initBrainstormDirectory(testDir);

		const initialPath = createInitialPath('test-project-005', '评分追踪测试');
		await savePath(initialPath, testDir);

		const innovations1 = [
			createTestInnovation('INN-001', '核心创新'),
			createTestInnovation('INN-002', '辅助创新'),
		];
		const scores1 = [
			createInnovationScore('INN-001', 6, 6, 7, 6),
			createInnovationScore('INN-002', 5, 5, 6, 5),
		];
		await saveNode(createTestNode(1, innovations1, scores1), testDir);

		const innovations2 = [
			createTestInnovation('INN-001', '核心创新（优化）'),
			createTestInnovation('INN-002', '辅助创新'),
		];
		const scores2 = [
			createInnovationScore('INN-001', 8, 8, 8, 8),
			createInnovationScore('INN-002', 6, 6, 7, 6),
		];
		await saveNode(createTestNode(2, innovations2, scores2), testDir);

		const innovations3 = [createTestInnovation('INN-001', '核心创新（最终版）')];
		const scores3 = [createInnovationScore('INN-001', 9, 9, 9, 9)];
		await saveNode(createTestNode(3, innovations3, scores3), testDir);

		const loadedPath = await loadPath(testDir);
		loadedPath!.nodes = ['round-1', 'round-2', 'round-3'];
		loadedPath!.currentNodeId = 'round-3';
		await savePath(loadedPath!, testDir);

		const progression = await getScoreProgression(testDir);
		expect(progression).not.toBeNull();
		expect(progression!.overallProgression).toHaveLength(3);

		const round1Stats = progression!.overallProgression.find((entry) => entry.round === 1);
		expect(round1Stats).toBeDefined();
		expect(round1Stats!.innovationCount).toBe(2);

		const inn001History = progression!.byInnovation.get('INN-001');
		expect(inn001History).toBeDefined();
		expect(inn001History).toHaveLength(3);

		const topInnovations = progression!.topInnovations;
		expect(topInnovations.length).toBeGreaterThan(0);
		expect(topInnovations[0].innovationId).toBe('INN-001');

		const singleProgression = await getScoreProgression(testDir, 'INN-001');
		expect(singleProgression).not.toBeNull();
		const inn001OnlyHistory = singleProgression!.byInnovation.get('INN-001');
		expect(inn001OnlyHistory).toBeDefined();
		expect(inn001OnlyHistory).toHaveLength(3);
	});
});
