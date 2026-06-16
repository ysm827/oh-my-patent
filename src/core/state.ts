export interface PatentState {
  project: {
    path: string;
    topic: string;
    topic_slug: string;
    created_at: string;
    jurisdiction: 'CN' | 'US' | 'PCT';
  };
  current_stage: 'INIT' | 'RESEARCH' | 'BRAINSTORM_R1' | 'BRAINSTORM_R2' | 'DRAFT' | 'DIAGRAM_DRAFT' | 'QA_LOOP' | 'FINAL_REVIEW' | 'DIAGRAM_FINAL' | 'DONE';
  stages: Record<string, { status: string; timestamp?: string; artifacts?: string[] }>;
  innovation_candidates: unknown[];
  selected_innovation: unknown | null;
  qa_rounds_completed: number;
  last_modified: string;
}

export interface CreateStateInput {
  topic: string;
  topicSlug: string;
  jurisdiction: 'CN' | 'US' | 'PCT';
  projectPath: string;
}

export function createInitialState(input: CreateStateInput): PatentState {
  const now = new Date().toISOString();
  return {
    project: {
      path: input.projectPath,
      topic: input.topic,
      topic_slug: input.topicSlug,
      created_at: now,
      jurisdiction: input.jurisdiction
    },
    current_stage: 'INIT',
    stages: {
      INIT: { status: 'pending' },
      RESEARCH: { status: 'pending' },
      BRAINSTORM_R1: { status: 'pending' },
      BRAINSTORM_R2: { status: 'pending' },
      DRAFT: { status: 'pending' },
      DIAGRAM_DRAFT: { status: 'pending' },
      QA_LOOP: { status: 'pending' },
      FINAL_REVIEW: { status: 'pending' },
      DIAGRAM_FINAL: { status: 'pending' },
      DONE: { status: 'pending' }
    },
    innovation_candidates: [],
    selected_innovation: null,
    qa_rounds_completed: 0,
    last_modified: now
  };
}

const VALID_JURISDICTIONS = ['CN', 'US', 'PCT'];
const VALID_STAGES = ['INIT', 'RESEARCH', 'BRAINSTORM_R1', 'BRAINSTORM_R2', 'DRAFT', 'DIAGRAM_DRAFT', 'QA_LOOP', 'FINAL_REVIEW', 'DIAGRAM_FINAL', 'DONE'];

export function validateState(state: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof state !== 'object' || state === null) {
    return { valid: false, errors: ['State must be an object'] };
  }

  const s = state as Record<string, unknown>;

  if (!s.project || typeof s.project !== 'object') {
    errors.push('Missing or invalid project field');
  } else {
    const p = s.project as Record<string, unknown>;
    if (!p.path || typeof p.path !== 'string') {
      errors.push('Missing or invalid project.path');
    }
    if (!p.topic || typeof p.topic !== 'string') {
      errors.push('Missing or invalid project.topic');
    }
    if (!VALID_JURISDICTIONS.includes(p.jurisdiction as string)) {
      errors.push(`Invalid jurisdiction: ${p.jurisdiction}`);
    }
  }

  if (!VALID_STAGES.includes(s.current_stage as string)) {
    errors.push(`Invalid current_stage: ${s.current_stage}`);
  }

  if (!s.stages || typeof s.stages !== 'object') {
    errors.push('Missing or invalid stages field');
  }

  if (!s.last_modified || typeof s.last_modified !== 'string') {
    errors.push('Missing or invalid last_modified');
  }

  return { valid: errors.length === 0, errors };
}
