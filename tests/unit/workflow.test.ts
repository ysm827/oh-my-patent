import { describe, test, expect } from 'vitest';
import { WorkflowMachine, WorkflowStage } from '../../src/core/workflow';

describe('Workflow State Machine', () => {
  test('starts at INIT stage', () => {
    const machine = new WorkflowMachine();
    expect(machine.currentStage).toBe(WorkflowStage.INIT);
  });

  test('transitions INIT → RESEARCH', () => {
    const machine = new WorkflowMachine();
    machine.transition(WorkflowStage.RESEARCH);
    expect(machine.currentStage).toBe(WorkflowStage.RESEARCH);
  });

  test('rejects invalid transition INIT → DRAFT', () => {
    const machine = new WorkflowMachine();
    expect(() => machine.transition(WorkflowStage.DRAFT)).toThrow();
  });

  test('validates transition path', () => {
    const machine = new WorkflowMachine();
    expect(machine.canTransition(WorkflowStage.RESEARCH)).toBe(true);
    expect(machine.canTransition(WorkflowStage.DRAFT)).toBe(false);
  });

  test('tracks completed stages', () => {
    const machine = new WorkflowMachine();
    machine.transition(WorkflowStage.RESEARCH);
    machine.transition(WorkflowStage.BRAINSTORM_R1);
    expect(machine.isCompleted(WorkflowStage.INIT)).toBe(true);
    expect(machine.isCompleted(WorkflowStage.RESEARCH)).toBe(true);
    expect(machine.isCompleted(WorkflowStage.BRAINSTORM_R1)).toBe(false);
  });

  test('supports branching paths', () => {
    const machine = new WorkflowMachine();
    machine.transition(WorkflowStage.RESEARCH);
    machine.transition(WorkflowStage.BRAINSTORM_R1);
    machine.transition(WorkflowStage.BRAINSTORM_R2);
    machine.transition(WorkflowStage.DRAFT);
    expect(machine.currentStage).toBe(WorkflowStage.DRAFT);
  });
});
