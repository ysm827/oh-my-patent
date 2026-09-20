/**
 * 工作流阶段的**唯一定义点**（REQ-039）。
 *
 * 本模块是叶子模块（不 import 任何本仓库文件），以便 `state.ts` 与
 * `workflow.ts` 都能引用它而不产生运行时环。
 *
 * 历史问题：`state.ts` 自己维护了一份 `VALID_STAGES` 字面量数组、
 * `current_stage` 又写了一份字面量联合类型、`workflow.ts` 再写一份
 * `ALL_STAGES` —— 三份清单必须手工同步，新增阶段时极易漏改。
 * 现在统一由 `WorkflowStage` 枚举派生。
 */

/**
 * 工作流阶段枚举。
 *
 * ⚠️ 成员**声明顺序即流程顺序** —— `WORKFLOW_STAGE_ORDER` 由
 * `Object.values()` 派生，调整顺序会改变生成的提示文本（REQ-012）。
 */
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

/**
 * 阶段名字面量联合，由枚举**派生**（模板字面量类型）。
 *
 * 与 `Jurisdiction`（REQ-017）同理：它既接受枚举成员，也接受等值字符串字面量，
 * 因此调用点可以继续写 `'INIT'`，不必引入零收益的 import。
 */
export type WorkflowStageName = `${WorkflowStage}`;

/**
 * 工作流阶段的标准顺序（单一事实来源）。
 *
 * 生成提示文本时**必须**引用这里，不要另写字面量：历史上适配器各自维护了一份
 * 8 阶段的字符串，与枚举漂移后一直没人发现（REQ-012）。
 */
export const WORKFLOW_STAGE_ORDER: readonly WorkflowStage[] = Object.values(WorkflowStage);

/**
 * 阶段名的字符串视图 —— 供 `unknown` 入参的运行时校验使用。
 */
export const WORKFLOW_STAGE_NAMES: readonly string[] = WORKFLOW_STAGE_ORDER;

/**
 * 运行时守卫：判断任意字符串是否为合法阶段名。
 *
 * 与 `WorkflowStageName` 一并构成「类型层 + 运行时」的同一事实来源。
 */
export function isValidStage(value: unknown): value is WorkflowStage {
  return typeof value === 'string' && WORKFLOW_STAGE_NAMES.includes(value);
}

/**
 * 把任意值收敛为 `WorkflowStage` 成员（失败返回 `undefined`）。
 *
 * 与 `isValidStage` 的差别：本函数返回**枚举成员本身**。字符串枚举的成员类型
 * 与等值字面量类型并不互相赋值，故从字面量联合（`WorkflowStageName`）转成枚举
 * 需要一次收敛，用它即可免去 `as` 断言。
 */
export function toWorkflowStage(value: unknown): WorkflowStage | undefined {
  return WORKFLOW_STAGE_ORDER.find((stage) => stage === value);
}
