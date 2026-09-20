import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { StateManager } from '../../src/core/state-manager';
import { createInitialState } from '../../src/core/state';

// REQ-044: 测试数据目录必须落在 os.tmpdir()。旧实现用
// `tests/fixtures/test-projects`，会在**源码树内**建目录 —— 崩溃时残留，
// 且会让仓库多出未被 .gitignore 覆盖的目录。
const TEST_DIR = mkdtempSync(join(tmpdir(), 'omp-state-persistence-'));

describe('State Persistence Integration', () => {
	beforeEach(() => {
		mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(() => {
		rmSync(TEST_DIR, { recursive: true, force: true });
	});

	test('writes state to file', async () => {
		const manager = new StateManager(TEST_DIR);
		const state = createInitialState({
			topic: '测试专利',
			topicSlug: 'test-patent',
			jurisdiction: 'CN',
			projectPath: 'projects/01-test'
		});

		await manager.saveState('01-test-patent', state);

		const statePath = join(TEST_DIR, '01-test-patent', '.patent', 'state.json');
		expect(existsSync(statePath)).toBe(true);
	});

	test('reads state from file', async () => {
		const manager = new StateManager(TEST_DIR);
		const state = createInitialState({
			topic: '测试专利',
			topicSlug: 'test-patent',
			jurisdiction: 'CN',
			projectPath: 'projects/01-test'
		});

		await manager.saveState('01-test-patent', state);
		const loaded = await manager.loadState('01-test-patent');

		expect(loaded!.project.topic).toBe('测试专利');
		expect(loaded!.current_stage).toBe('INIT');
	});

	test('returns null for non-existent project', async () => {
		const manager = new StateManager(TEST_DIR);
		const loaded = await manager.loadState('nonexistent');

		expect(loaded).toBeNull();
	});

	test('updates state atomically', async () => {
		const manager = new StateManager(TEST_DIR);
		const state = createInitialState({
			topic: '测试',
			topicSlug: 'test',
			jurisdiction: 'CN',
			projectPath: 'test'
		});

		await manager.saveState('01-test', state);

		state.current_stage = 'RESEARCH';
		await manager.saveState('01-test', state);

		const loaded = await manager.loadState('01-test');
		expect(loaded!.current_stage).toBe('RESEARCH');
	});
});
