// Type-only import: erased at runtime, so `state.js` (which imports the stage
// definitions from `workflow-stages.js`) does not form a runtime cycle with us.
import type { PatentState } from './state.js';
import {
  WorkflowStage,
  WORKFLOW_STAGE_ORDER,
  toWorkflowStage,
} from './workflow-stages.js';

// 阶段的唯一定义点已迁至 `workflow-stages.js`（REQ-039）。此处重新导出，
// 使既有调用点（`src/index.ts`、`src/adapters/**`、`tests/**`）无需改动。
export { WorkflowStage, WORKFLOW_STAGE_ORDER };
export type { WorkflowStageName } from './workflow-stages.js';

/**
 * 合法状态迁移表。
 *
 * `Record<WorkflowStage, …>` 提供**编译期**完备性约束：枚举新增成员而此处漏写
 * 键，`tsc` 会直接报错（REQ-039）。
 */
const VALID_TRANSITIONS: Record<WorkflowStage, WorkflowStage[]> = {
  [WorkflowStage.INIT]: [WorkflowStage.RESEARCH],
  [WorkflowStage.RESEARCH]: [WorkflowStage.BRAINSTORM_R1],
  [WorkflowStage.BRAINSTORM_R1]: [WorkflowStage.BRAINSTORM_R2, WorkflowStage.RESEARCH],
  [WorkflowStage.BRAINSTORM_R2]: [WorkflowStage.DRAFT],
  [WorkflowStage.DRAFT]: [WorkflowStage.DIAGRAM_DRAFT],
  [WorkflowStage.DIAGRAM_DRAFT]: [WorkflowStage.QA_LOOP],
  [WorkflowStage.QA_LOOP]: [WorkflowStage.FINAL_REVIEW, WorkflowStage.DRAFT],
  [WorkflowStage.FINAL_REVIEW]: [WorkflowStage.DIAGRAM_FINAL, WorkflowStage.QA_LOOP],
  [WorkflowStage.DIAGRAM_FINAL]: [WorkflowStage.DONE],
  [WorkflowStage.DONE]: []
};

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
    if (this.completed.has(target)) {
      this.completed.delete(target);
    }
  }

  isCompleted(stage: WorkflowStage): boolean {
    return this.completed.has(stage);
  }

  static fromState(state: PatentState): WorkflowMachine {
    const current = toWorkflowStage(state.current_stage);
    if (!current) {
      throw new Error(`Invalid current_stage: ${state.current_stage}`);
    }

    const machine = new WorkflowMachine();
    machine.current = current;
    for (const stage of WORKFLOW_STAGE_ORDER) {
      const stageState = state.stages[stage];
      if (stageState && stageState.status === 'completed') {
        machine.completed.add(stage);
      }
    }
    return machine;
  }

  toState(): { current_stage: WorkflowStage; stages: Record<string, { status: string }> } {
    const stages: Record<string, { status: string }> = {};
    for (const stage of WORKFLOW_STAGE_ORDER) {
      stages[stage] = {
        status: this.completed.has(stage) ? 'completed' : 'pending'
      };
    }
    return { current_stage: this.current, stages };
  }
}
