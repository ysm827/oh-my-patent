import { describe, test, expect } from 'vitest';
import {
  isValidBrainstormPath,
  isValidBrainstormNode,
  createInitialPath,
  createInitialNode,
  createInnovationSnapshot,
  createInnovationScore,
} from '../../src/core/brainstorm-path';
import type { BrainstormPath, BrainstormNode } from '../../src/core/brainstorm-path';

/**
 * REQ-021: the guards must reject malformed NESTED structures, not just the
 * top-level shells — and `round: NaN` / `round: Infinity` must fail.
 */
describe('brainstorm path type guards (REQ-021)', () => {
  const validNode = (): BrainstormNode => ({
    ...createInitialNode(1),
    innovations: [createInnovationSnapshot('INN-001', 't', 'p', ['s'], ['d'])],
    scores: [createInnovationScore('INN-001', 7, 7, 7, 7)],
  });

  const validPath = (): BrainstormPath => ({
    ...createInitialPath('proj', 'topic'),
    nodes: ['round-1'],
    edges: [
      {
        id: 'e1',
        fromNodeId: 'round-1',
        toNodeId: 'round-2',
        transformation: { type: 'refine', description: 'd', changes: [] },
      },
    ],
    currentNodeId: 'round-1',
  });

  test('well-formed fixtures pass (no false rejects)', () => {
    expect(isValidBrainstormNode(validNode())).toBe(true);
    expect(isValidBrainstormPath(validPath())).toBe(true);
  });

  test('round must be finite: NaN and Infinity are rejected', () => {
    expect(isValidBrainstormNode({ ...validNode(), round: NaN })).toBe(false);
    expect(isValidBrainstormNode({ ...validNode(), round: Infinity })).toBe(false);
  });

  test('a null decision is rejected (typeof null === "object")', () => {
    expect(isValidBrainstormNode({ ...validNode(), decision: null })).toBe(false);
  });

  test('a decision with an unknown action is rejected', () => {
    expect(
      isValidBrainstormNode({
        ...validNode(),
        decision: { action: 'SOMETHING_ELSE', reason: '', recommendations: [] },
      }),
    ).toBe(false);
  });

  test('innovation items missing status are rejected', () => {
    const node = validNode();
    (node.innovations[0] as Record<string, unknown>).status = undefined;
    expect(isValidBrainstormNode(node)).toBe(false);
  });

  test('score items with non-numeric fields are rejected', () => {
    const node = validNode();
    (node.scores[0] as Record<string, unknown>).novelty = 'high';
    expect(isValidBrainstormNode(node)).toBe(false);
  });

  test('missing edges array is rejected', () => {
    const path = validPath();
    delete (path as Record<string, unknown>).edges;
    expect(isValidBrainstormPath(path)).toBe(false);
  });

  test('edge items missing transformation are rejected', () => {
    const path = validPath();
    delete (path.edges[0] as Record<string, unknown>).transformation;
    expect(isValidBrainstormPath(path)).toBe(false);
  });

  test('path whose nodes contain non-string ids is rejected', () => {
    const path = validPath();
    (path.nodes as unknown[]) = [1, 2];
    expect(isValidBrainstormPath(path)).toBe(false);
  });
});
