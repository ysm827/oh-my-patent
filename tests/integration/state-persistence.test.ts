import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { StateManager } from '../../src/core/state-manager';
import { createInitialState } from '../../src/core/state';

const TEST_DIR = join(__dirname, '..', 'fixtures', 'test-projects');

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
