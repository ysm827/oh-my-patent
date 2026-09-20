import { join } from 'path';

export interface ConsistencyResult {
  consistent: boolean;
  missing: string[];
  errors: string[];
}

export function validateConsistency(
  state: Record<string, unknown>,
  fileExists: (path: string) => boolean
): ConsistencyResult {
  const missing: string[] = [];
  const errors: string[] = [];

  if (!fileExists('.patent/state.json')) {
    errors.push('State file not found');
    return { consistent: false, missing, errors };
  }

  const currentStage = state.current_stage as string;
  const stages = state.stages as Record<string, { artifacts?: string[] }>;

  const project = state.project as { path?: string } | undefined;
  const projectPath = project?.path || '';

  if (stages && stages[currentStage]) {
    const stageArtifacts = stages[currentStage].artifacts || [];
    for (const artifact of stageArtifacts) {
      // REQ-023: string interpolation with a hardcoded `/` produced mixed
      // separators on Windows (`projects\01-x/MAIN.md`); path.join normalizes.
      const artifactPath = projectPath ? join(projectPath, artifact) : artifact;
      if (!fileExists(artifactPath)) {
        missing.push(artifact);
      }
    }
  }

  const consistent = errors.length === 0 && missing.length === 0;
  return { consistent, missing, errors };
}
