import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { atomicWriteFileSync } from './atomic-write.js';
import { PatentState, validateState } from './state.js';

export class StateManager {
  constructor(private baseDir: string) {}

  saveState(projectSlug: string, state: PatentState): void {
    const validation = validateState(state);
    if (!validation.valid) {
      throw new Error(`Invalid state: ${validation.errors.join(', ')}`);
    }

    const projectDir = join(this.baseDir, projectSlug);
    const patentDir = join(projectDir, '.patent');

    const statePath = join(patentDir, 'state.json');
    // REQ-016: temp file + rename with NO unlink of the target. The previous
    // unlink-then-rename left a window where state.json did not exist; a
    // crash there lost the file. rename over an existing file replaces it
    // without that window.
    atomicWriteFileSync(statePath, JSON.stringify(state, null, 2));
  }

  loadState(projectSlug: string): PatentState | null {
    const statePath = join(this.baseDir, projectSlug, '.patent', 'state.json');

    if (!existsSync(statePath)) {
      return null;
    }

    try {
      const content = readFileSync(statePath, 'utf-8');
      const parsed = JSON.parse(content) as unknown;
      const validation = validateState(parsed);
      if (!validation.valid) {
        throw new Error(`Corrupted state file: ${validation.errors.join(', ')}`);
      }
      return parsed as PatentState;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Corrupted state file: invalid JSON');
      }
      throw error;
    }
  }
}
