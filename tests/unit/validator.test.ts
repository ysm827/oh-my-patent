import { describe, test, expect, beforeEach } from 'vitest';
import { join, sep } from 'path';
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
    // REQ-023: the validator joins via path.join, so the mock must register
    // the joined form (backslashes on Windows — the old expectation hardcoded
    // the forward-slash interpolation bug).
    mockFs.files.set(join('projects/01-test', 'MAIN.md'), true);

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

describe('artifact path joining (REQ-023)', () => {
  test('project paths with backslash separators resolve like path.join', () => {
    mockFs.files.set('.patent/state.json', true);
    mockFs.files.set(join('projects\\01-x', 'MAIN.md'), true);

    const state = {
      project: { path: 'projects\\01-x' },
      current_stage: 'DRAFT',
      stages: {
        DRAFT: { status: 'in_progress', artifacts: ['MAIN.md'] }
      }
    };

    const result = validateConsistency(state, mockFs.exists);
    expect(result.missing).not.toContain('MAIN.md');
    expect(result.consistent).toBe(true);
  });

  test('mixed-separator input is normalized through path.join', () => {
    mockFs.files.set('.patent/state.json', true);
    // The artifact check must produce join(projectPath, artifact) — the same
    // string this test registers as existing — regardless of separators.
    const projectPath = 'projects' + sep + '01-x';
    mockFs.files.set(join(projectPath, 'MAIN.md'), true);

    const state = {
      project: { path: projectPath },
      current_stage: 'DRAFT',
      stages: {
        DRAFT: { status: 'in_progress', artifacts: ['MAIN.md'] }
      }
    };

    expect(validateConsistency(state, mockFs.exists).consistent).toBe(true);
  });
});
