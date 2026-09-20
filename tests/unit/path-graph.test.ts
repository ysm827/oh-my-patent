import { describe, test, expect } from 'vitest';
import { BrainstormPathGraph } from '../../src/core/path-graph';
import type { GraphEdge, GraphNode } from '../../src/core/path-graph';

/**
 * REQ-020: serialization round trips, parallel edges and endpoint validation.
 *
 * Before the fix: `edgeIndex` mapped `from->to` to a SINGLE edge id, so a
 * second edge between the same pair overwrote the first in the index (and
 * type-filtered traversals lost it); `addEdge` silently accepted dangling
 * endpoints; and `fromJSON` stamped every edge 'DERIVES_FROM', so a
 * fromJSON(toJSON(g)) round trip did not preserve edge types.
 */
describe('BrainstormPathGraph (REQ-020)', () => {
  const roundNode = (id: string, round: number): GraphNode => ({
    id,
    type: 'Round',
    label: `Round ${round}`,
    properties: { round, timestamp: '2026-09-15T10:00:00.000Z' },
  });

  const makeGraph = (): BrainstormPathGraph => {
    const graph = new BrainstormPathGraph();
    graph.addNode(roundNode('round-1', 1));
    graph.addNode(roundNode('round-2', 2));
    return graph;
  };

  const edge = (id: string, type: GraphEdge['type'], from: string, to: string): GraphEdge => ({
    id,
    type,
    from,
    to,
    properties: { description: '', changes: [] },
  });

  test('addEdge rejects unknown endpoints with a clear error', () => {
    const graph = makeGraph();
    expect(() => graph.addEdge(edge('e1', 'DERIVES_FROM', 'round-1', 'ghost'))).toThrow(
      /unknown target node "ghost"/,
    );
    expect(() => graph.addEdge(edge('e2', 'DERIVES_FROM', 'ghost', 'round-1'))).toThrow(
      /unknown source node "ghost"/,
    );
  });

  test('parallel edges between the same pair are both kept and both findable', () => {
    const graph = makeGraph();
    graph.addEdge(edge('e-derives', 'DERIVES_FROM', 'round-1', 'round-2'));
    graph.addEdge(edge('e-prev', 'PREV_ROUND', 'round-1', 'round-2'));

    expect(graph.getAllEdges()).toHaveLength(2);

    // Pre-fix, the second addEdge overwrote the index entry, so one of these
    // type-filtered lookups came back empty depending on insertion order.
    const derives = graph.getPredecessorsByType('round-2', 'DERIVES_FROM');
    const prev = graph.getPredecessorsByType('round-2', 'PREV_ROUND');
    expect(derives.map((n) => n.id)).toEqual(['round-1']);
    expect(prev.map((n) => n.id)).toEqual(['round-1']);

    // Removing one of the pair keeps the other findable.
    graph.removeEdge('e-prev');
    expect(graph.getPredecessorsByType('round-2', 'DERIVES_FROM').map((n) => n.id)).toEqual([
      'round-1',
    ]);
    expect(graph.getAllEdges()).toHaveLength(1);
  });

  test('fromJSON(toJSON(g)) preserves edge count, types and endpoints', () => {
    const graph = makeGraph();
    graph.addEdge(edge('e-derives', 'DERIVES_FROM', 'round-1', 'round-2'));
    graph.addEdge(edge('e-prev', 'PREV_ROUND', 'round-1', 'round-2'));

    const data = graph.toJSON();
    const restored = BrainstormPathGraph.fromJSON(data);

    const original = graph
      .getAllEdges()
      .map((e) => `${e.id}:${e.type}:${e.from}->${e.to}`)
      .sort();
    const roundTripped = restored
      .getAllEdges()
      .map((e) => `${e.id}:${e.type}:${e.from}->${e.to}`)
      .sort();
    expect(roundTripped).toEqual(original);
    expect(roundTripped).toHaveLength(2);
  });

  test('legacy edges without a type field default to DERIVES_FROM', () => {
    const restored = BrainstormPathGraph.fromJSON({
      id: 'path-x',
      projectId: 'p',
      topic: 't',
      createdAt: '2026-09-15T10:00:00.000Z',
      status: 'active',
      nodes: ['round-1', 'round-2'],
      edges: [
        {
          id: 'e-old',
          fromNodeId: 'round-1',
          toNodeId: 'round-2',
          transformation: { type: 'refine', description: '', changes: [] },
        },
      ],
      currentNodeId: 'round-2',
    });

    expect(restored.getAllEdges()[0]?.type).toBe('DERIVES_FROM');
  });
});
