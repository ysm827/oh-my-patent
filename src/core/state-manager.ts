import { writeFileSync, readFileSync, mkdirSync, existsSync, renameSync, unlinkSync } from 'fs';
import { join } from 'path';
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

    mkdirSync(patentDir, { recursive: true });

    const statePath = join(patentDir, 'state.json');
    const tempPath = join(patentDir, `state.json.${Date.now()}.tmp`);

    try {
      writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf-8');

      if (existsSync(statePath)) {
        unlinkSync(statePath);
      }

      renameSync(tempPath, statePath);
    } catch (error) {
      if (existsSync(tempPath)) {
        try {
          unlinkSync(tempPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
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
