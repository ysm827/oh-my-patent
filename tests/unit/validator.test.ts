import { describe, test, expect, beforeEach } from 'vitest';
import { validateConsistency } from '../../src/core/validator';

const mockFs = {
  files: new Map<string, boolean>(),
  exists: (path: string) => mockFs.files.has(path),
  reset: () => mockFs.files.clear()
};

describe('State Validator', () => {
  beforeEach(() => {
    mockFs.reset();
  });

  test('detects missing MAIN.md in DRAFT stage', () => {
    mockFs.files.set('.patent/state.json', true);
    // Missing: MAIN.md

    const state = {
      project: { path: 'projects/01-test' },
      current_stage: 'DRAFT',
      stages: {
        DRAFT: { status: 'in_progress', artifacts: ['MAIN.md'] }
      }
    };

    const result = validateConsistency(state, mockFs.exists);

    expect(result.consistent).toBe(false);
    expect(result.missing).toContain('MAIN.md');
  });

  test('passes when all artifacts exist', () => {
    mockFs.files.set('.patent/state.json', true);
    mockFs.files.set('projects/01-test/MAIN.md', true);

    const state = {
      project: { path: 'projects/01-test' },
      current_stage: 'DRAFT',
      stages: {
        DRAFT: { status: 'completed', artifacts: ['MAIN.md'] }
      }
    };

    const result = validateConsistency(state, mockFs.exists);

    expect(result.consistent).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('detects state file missing', () => {
    mockFs.files.clear();

    const result = validateConsistency({}, mockFs.exists);

    expect(result.consistent).toBe(false);
    expect(result.errors).toContain('State file not found');
  });
});
