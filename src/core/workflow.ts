import { PatentState } from './state.js';

export enum WorkflowStage {
  INIT = 'INIT',
  RESEARCH = 'RESEARCH',
  BRAINSTORM_R1 = 'BRAINSTORM_R1',
  BRAINSTORM_R2 = 'BRAINSTORM_R2',
  DRAFT = 'DRAFT',
  DIAGRAM_DRAFT = 'DIAGRAM_DRAFT',
  QA_LOOP = 'QA_LOOP',
  FINAL_REVIEW = 'FINAL_REVIEW',
  DIAGRAM_FINAL = 'DIAGRAM_FINAL',
  DONE = 'DONE'
}

const ALL_STAGES: WorkflowStage[] = [
  WorkflowStage.INIT,
  WorkflowStage.RESEARCH,
  WorkflowStage.BRAINSTORM_R1,
  WorkflowStage.BRAINSTORM_R2,
  WorkflowStage.DRAFT,
  WorkflowStage.DIAGRAM_DRAFT,
  WorkflowStage.QA_LOOP,
  WorkflowStage.FINAL_REVIEW,
  WorkflowStage.DIAGRAM_FINAL,
  WorkflowStage.DONE
];

const VALID_TRANSITIONS: Record<WorkflowStage, WorkflowStage[]> = {
  [WorkflowStage.INIT]: [WorkflowStage.RESEARCH],
  [WorkflowStage.RESEARCH]: [WorkflowStage.BRAINSTORM_R1],
  [WorkflowStage.BRAINSTORM_R1]: [WorkflowStage.BRAINSTORM_R2],
  [WorkflowStage.BRAINSTORM_R2]: [WorkflowStage.DRAFT],
  [WorkflowStage.DRAFT]: [WorkflowStage.DIAGRAM_DRAFT],
  [WorkflowStage.DIAGRAM_DRAFT]: [WorkflowStage.QA_LOOP],
  [WorkflowStage.QA_LOOP]: [WorkflowStage.FINAL_REVIEW, WorkflowStage.DRAFT],
  [WorkflowStage.FINAL_REVIEW]: [WorkflowStage.DIAGRAM_FINAL, WorkflowStage.QA_LOOP],
  [WorkflowStage.DIAGRAM_FINAL]: [WorkflowStage.DONE],
  [WorkflowStage.DONE]: []
};

function isValidStage(value: string): value is WorkflowStage {
  return ALL_STAGES.includes(value as WorkflowStage);
}

export class WorkflowMachine {
  private current: WorkflowStage = WorkflowStage.INIT;
  private completed: Set<WorkflowStage> = new Set();

  get currentStage(): WorkflowStage {
    return this.current;
  }

  canTransition(target: WorkflowStage): boolean {
    return VALID_TRANSITIONS[this.current].includes(target);
  }

  transition(target: WorkflowStage): void {
    if (!this.canTransition(target)) {
      throw new Error(
        `Invalid transition from ${this.current} to ${target}`
      );
    }
    this.completed.add(this.current);
    this.current = target;
  }

  isCompleted(stage: WorkflowStage): boolean {
    return this.completed.has(stage);
  }

  static fromState(state: PatentState): WorkflowMachine {
    if (!isValidStage(state.current_stage)) {
      throw new Error(`Invalid current_stage: ${state.current_stage}`);
    }

    const machine = new WorkflowMachine();
    machine.current = state.current_stage;
    for (const stage of ALL_STAGES) {
      const stageState = state.stages[stage];
      if (stageState && stageState.status === 'completed') {
        machine.completed.add(stage);
      }
    }
    return machine;
  }

  toState(): { current_stage: WorkflowStage; stages: Record<string, { status: string }> } {
    const stages: Record<string, { status: string }> = {};
    for (const stage of ALL_STAGES) {
      stages[stage] = {
        status: this.completed.has(stage) ? 'completed' : 'pending'
      };
    }
    return { current_stage: this.current, stages };
  }
}
