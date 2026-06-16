/**
 * BrainstormPathTUI - 交互式终端界面
 *
 * 使用 Ink (React for CLI) 构建的交互式头脑风暴路径可视化界面。
 * 支持键盘导航、节点切换、创新点详情查看。
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp, render } from 'ink';
import { loadPath, loadAllNodes } from '../core/path-persistence.js';
import {
  getPathOverview,
  getNodeDetail,
  getInnovationHistory,
} from '../commands/path-query.js';
import { listBranches } from '../commands/path-branch.js';
import type { PathOverview, NodeDetail, InnovationHistory } from '../commands/path-query.js';
import type { BrainstormPath, BrainstormNode } from '../core/brainstorm-path.js';
import { STATUS_ICONS, ACTION_ICONS } from '../commands/shared.js';

// ============================================================================
// 视图类型
// ============================================================================

type ViewMode = 'overview' | 'node' | 'innovation' | 'branches';

// ============================================================================
// 状态图标
// ============================================================================

const STATUS_ICON = STATUS_ICONS;
const ACTION_ICON = ACTION_ICONS;

// ============================================================================
// 子组件: Header
// ============================================================================

interface HeaderProps {
  topic: string;
  view: ViewMode;
  round: number;
  totalRounds: number;
}

const Header: React.FC<HeaderProps> = ({ topic, view, round, totalRounds }) => {
  const viewLabels: Record<ViewMode, string> = {
    overview: 'OVERVIEW',
    node: 'NODE DETAIL',
    innovation: 'INNOVATION',
    branches: 'BRANCHES',
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="cyan">{'╔═══════════════════════════════════════════════════════════╗'}</Text>
      </Box>
      <Box>
        <Text bold color="cyan">║ </Text>
        <Text bold color="white">Brainstorm Path TUI</Text>
        <Text color="gray"> | </Text>
        <Text color="green">{topic}</Text>
        <Text color="gray"> | </Text>
        <Text color="yellow">{viewLabels[view]}</Text>
        <Text color="cyan"> {'║'}</Text>
      </Box>
      <Box>
        <Text bold color="cyan">{'╚═══════════════════════════════════════════════════════════╝'}</Text>
      </Box>
      {view === 'node' && (
        <Box marginLeft={2}>
          <Text color="gray">{`Round ${round}/${totalRounds} | ← → navigate | Tab: overview | i: innovation | b: branches | q: quit`}</Text>
        </Box>
      )}
      {view === 'overview' && (
        <Box marginLeft={2}>
          <Text color="gray">Enter: node detail | ← →: switch round | i: innovation | b: branches | q: quit</Text>
        </Box>
      )}
      {view === 'innovation' && (
        <Box marginLeft={2}>
          <Text color="gray">↑ ↓: switch round in history | Esc: back | q: quit</Text>
        </Box>
      )}
      {view === 'branches' && (
        <Box marginLeft={2}>
          <Text color="gray">Esc: back | q: quit</Text>
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// 子组件: ScoreBar
// ============================================================================

interface ScoreBarProps {
  score: number;
  max?: number;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ score, max = 10 }) => {
  const filled = Math.round(score);
  const empty = max - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  let color: string;
  if (score >= 8) color = 'green';
  else if (score >= 6) color = 'yellow';
  else color = 'red';

  return (
    <Box>
      <Text color={color}>{bar}</Text>
      <Text> </Text>
      <Text bold color={color}>{score.toFixed(1)}</Text>
    </Box>
  );
};

// ============================================================================
// 子组件: OverviewView
// ============================================================================

interface OverviewViewProps {
  overview: PathOverview;
  nodes: BrainstormNode[];
  selectedIndex: number;
}

const OverviewView: React.FC<OverviewViewProps> = ({ overview, nodes, selectedIndex }) => {
  return (
    <Box flexDirection="column">
      {/* Stats */}
      <Box marginBottom={1}>
        <Box marginRight={3}>
          <Text color="gray">Status:</Text>
          <Text> </Text>
          <Text bold color="green">{STATUS_ICON[overview.status] ?? ''} {overview.status.toUpperCase()}</Text>
        </Box>
        <Box marginRight={3}>
          <Text color="gray">Rounds:</Text>
          <Text> </Text>
          <Text bold>{overview.totalRounds}</Text>
        </Box>
      </Box>

      {/* Score progression */}
      {overview.scoreProgression.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color="yellow">Score Progression</Text>
          {overview.scoreProgression.map((sp, i) => (
            <Box key={i}>
              <Text color="gray">{`  R${String(sp.round).padStart(2, ' ')} `}</Text>
              <ScoreBar score={sp.avgScore} />
              <Text color="gray">{` top: ${sp.topInnovationId}`}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Timeline */}
      <Box flexDirection="column">
        <Text bold color="yellow">Timeline</Text>
        {overview.innovationEvolution.map((evo, i) => {
          const node = nodes.find((n: BrainstormNode) => n.round === evo.round);
          const isSelected = i === selectedIndex;

          return (
            <Box key={i} flexDirection="column">
              <Box>
                <Text>{isSelected ? '▶' : ' '} </Text>
                <Text bold color={isSelected ? 'white' : 'gray'}>
                  {`Round ${evo.round}`}
                </Text>
                {i === overview.innovationEvolution.length - 1 && (
                  <Text color="green"> {'◀ END'}</Text>
                )}
              </Box>

              {/* Active innovations */}
              {evo.active.map((innId: string) => {
                const inn = node?.innovations.find((x) => x.id === innId);
                const sc = node?.scores.find((s) => s.innovationId === innId);
                if (!inn) return null;
                return (
                  <Box key={innId} marginLeft={3}>
                    <Text color="green">[OK]</Text>
                    <Text>{` ${innId}: ${inn.title}`}</Text>
                    {sc && <Text color="yellow">{` ★${sc.weightedScore.toFixed(1)}`}</Text>}
                  </Box>
                );
              })}

              {/* Merged innovations */}
              {evo.merged?.map((m: string) => {
                const [id, into] = m.split('→');
                const inn = node?.innovations.find((x) => x.id === id);
                if (!inn) return null;
                const sc = node?.scores.find((s) => s.innovationId === id);
                return (
                  <Box key={id} marginLeft={3}>
                    <Text color="magenta">[MG]</Text>
                    <Text>{` ${id}: ${inn.title} → ${into}`}</Text>
                    {sc && <Text color="yellow">{` ★${sc.weightedScore.toFixed(1)}`}</Text>}
                  </Box>
                );
              })}

              {/* Decision */}
              {node && (
                <Box marginLeft={3}>
                  <Text color="gray">
                    {`→ ${ACTION_ICON[node.decision.action] ?? ''} ${node.decision.action}`}
                  </Text>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ============================================================================
// 子组件: NodeView
// ============================================================================

interface NodeViewProps {
  detail: NodeDetail;
  roundIndex: number;
  totalRounds: number;
}

const NodeView: React.FC<NodeViewProps> = ({ detail, roundIndex, totalRounds }) => {
  return (
    <Box flexDirection="column">
      {/* Header info */}
      <Box marginBottom={1}>
        <Box marginRight={3}>
          <Text color="gray">Round:</Text>
          <Text bold>{` ${detail.round}/${totalRounds}`}</Text>
        </Box>
        <Box marginRight={3}>
          <Text color="gray">Date:</Text>
          <Text>{` ${new Date(detail.timestamp).toISOString().split('T')[0]}`}</Text>
        </Box>
        {detail.predecessorId && (
          <Box marginRight={3}>
            <Text color="gray">Prev:</Text>
            <Text>{` ${detail.predecessorId}`}</Text>
          </Box>
        )}
      </Box>

      {/* Agent Outputs */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="yellow">Agent Outputs</Text>
        {detail.agentOutputs.length === 0 ? (
          <Text color="gray">  (none)</Text>
        ) : (
          detail.agentOutputs.map((o, i) => (
            <Box key={i} marginLeft={2}>
              <Text color="cyan">{o.agentId}</Text>
              <Text color="gray">{` → ${o.outputFile}`}</Text>
            </Box>
          ))
        )}
      </Box>

      {/* Innovations */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="yellow">Innovations</Text>
        {detail.innovations.length === 0 ? (
          <Text color="gray">  (none)</Text>
        ) : (
          detail.innovations.map((inn, i) => {
            const sc = detail.scores.find((s) => s.innovationId === inn.id);
            const statusLabel = inn.status === 'merged' && inn.mergedInto
              ? `merged→${inn.mergedInto}`
              : inn.status;
            return (
              <Box key={i} marginLeft={2}>
                <Text color="green">{STATUS_ICON[inn.status] ?? ''}</Text>
                <Text bold>{` ${inn.id}`}</Text>
                <Text>{`: ${inn.title}`}</Text>
                <Text color="gray">{` [${statusLabel}]`}</Text>
                {sc && <Text color="yellow">{` ★${sc.weightedScore.toFixed(1)}`}</Text>}
                <Text color="blue"> [i=detail]</Text>
              </Box>
            );
          })
        )}
      </Box>

      {/* Decision */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="yellow">Decision</Text>
        <Box marginLeft={2}>
          <Text>{`${ACTION_ICON[detail.decision.action] ?? ''} ${detail.decision.action}`}</Text>
        </Box>
        <Box marginLeft={2}>
          <Text color="gray">{`Reason: ${detail.decision.reason}`}</Text>
        </Box>
        {detail.decision.recommendations.length > 0 && (
          <Box marginLeft={2} flexDirection="column">
            {detail.decision.recommendations.map((r: string, i: number) => (
              <Text key={i} color="gray">{`  • ${r}`}</Text>
            ))}
          </Box>
        )}
      </Box>

      {/* Score detail */}
      {detail.scores.length > 0 && (
        <Box flexDirection="column">
          <Text bold color="yellow">Score Details</Text>
          {detail.scores.map((sc, i) => (
            <Box key={i} marginLeft={2} flexDirection="column">
              <Text bold>{sc.innovationId}</Text>
              <Box marginLeft={2}>
                <Text color="gray">{'Novelty:     '}</Text><ScoreBar score={sc.novelty} />
              </Box>
              <Box marginLeft={2}>
                <Text color="gray">{'Creativity:  '}</Text><ScoreBar score={sc.creativity} />
              </Box>
              <Box marginLeft={2}>
                <Text color="gray">{'Practicality:'}</Text><ScoreBar score={sc.practicality} />
              </Box>
              <Box marginLeft={2}>
                <Text color="gray">{'BizValue:    '}</Text><ScoreBar score={sc.businessValue} />
              </Box>
              <Box marginLeft={2}>
                <Text bold>{'Weighted:    '}</Text><ScoreBar score={sc.weightedScore} />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// 子组件: InnovationView
// ============================================================================

interface InnovationViewProps {
  history: InnovationHistory;
  selectedRoundIndex: number;
}

const InnovationView: React.FC<InnovationViewProps> = ({ history, selectedRoundIndex }) => {
  const entry = history.evolution[selectedRoundIndex];
  if (!entry) return <Text color="red">No evolution entry</Text>;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="gray">Status:</Text>
        <Text>{` ${STATUS_ICON[history.currentStatus] ?? ''} ${history.currentStatus}`}</Text>
        {history.mergedInto && <Text color="magenta">{` → ${history.mergedInto}`}</Text>}
        <Text color="gray">{` | Round ${selectedRoundIndex + 1}/${history.evolution.length}`}</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="yellow">{`Round ${entry.round}`}</Text>
        <Box marginLeft={2}>
          <Text color="gray">Title: </Text><Text>{entry.title}</Text>
        </Box>
        <Box marginLeft={2}>
          <Text color="gray">Problem: </Text><Text>{entry.problem}</Text>
        </Box>
        <Box marginLeft={2} flexDirection="column">
          <Text color="gray">Core Solution:</Text>
          {entry.coreSolution.map((s: string, i: number) => (
            <Box key={i} marginLeft={4}><Text>{`• ${s}`}</Text></Box>
          ))}
        </Box>
        <Box marginLeft={2} flexDirection="column">
          <Text color="gray">Differences:</Text>
          {entry.differences.map((d: string, i: number) => (
            <Box key={i} marginLeft={4}><Text>{`• ${d}`}</Text></Box>
          ))}
        </Box>
        {entry.score && (
          <Box marginLeft={2} flexDirection="column">
            <Text color="gray">Scores:</Text>
            <Box marginLeft={4}>
              <Text color="gray">Novelty: </Text><ScoreBar score={entry.score.novelty} />
            </Box>
            <Box marginLeft={4}>
              <Text color="gray">Creativity: </Text><ScoreBar score={entry.score.creativity} />
            </Box>
            <Box marginLeft={4}>
              <Text color="gray">Practicality: </Text><ScoreBar score={entry.score.practicality} />
            </Box>
            <Box marginLeft={4}>
              <Text color="gray">BizValue: </Text><ScoreBar score={entry.score.businessValue} />
            </Box>
            <Box marginLeft={4}>
              <Text bold>Weighted: </Text><ScoreBar score={entry.score.weightedScore} />
            </Box>
          </Box>
        )}
        <Box marginLeft={2}>
          <Text color="gray">Status: </Text>
          <Text>{`${STATUS_ICON[entry.status] ?? ''} ${entry.status}`}</Text>
          {entry.mergedInto && <Text color="magenta">{` → ${entry.mergedInto}`}</Text>}
        </Box>
      </Box>
    </Box>
  );
};

// ============================================================================
// 子组件: BranchesView
// ============================================================================

interface BranchesViewProps {
  projectPath: string;
}

const BranchesView: React.FC<BranchesViewProps> = ({ projectPath }) => {
  const [branches, setBranches] = useState<Array<{ branchId: string; branchReason: string; branchPointNodeId: string; status: string }>>([]);

  useEffect(() => {
    listBranches(projectPath).then((bs) => {
      setBranches(bs.map((b) => ({
        branchId: b.branchId,
        branchReason: b.branchReason,
        branchPointNodeId: b.branchPointNodeId,
        status: b.status,
      })));
    });
  }, [projectPath]);

  return (
    <Box flexDirection="column">
      <Text bold color="yellow">Branches</Text>
      {branches.length === 0 ? (
        <Text color="gray">  No branches created.</Text>
      ) : (
        branches.map((b, i) => {
          const rm = b.branchPointNodeId.match(/^round-(\d+)$/);
          const r = rm ? rm[1] : b.branchPointNodeId;
          return (
            <Box key={i} marginLeft={2}>
              <Text color="green">{STATUS_ICON[b.status] ?? ''}</Text>
              <Text bold>{` ${b.branchId}`}</Text>
              <Text color="gray">{` | ${b.branchReason} (from R${r})`}</Text>
            </Box>
          );
        })
      )}
    </Box>
  );
};

// ============================================================================
// 主应用
// ============================================================================

interface AppProps {
  projectPath: string;
}

const App: React.FC<AppProps> = ({ projectPath }) => {
  const { exit } = useApp();

  // ── data state ──
  const [pathData, setPathData] = useState<BrainstormPath | null>(null);
  const [nodes, setNodes] = useState<BrainstormNode[]>([]);
  const [overview, setOverview] = useState<PathOverview | null>(null);
  const [nodeDetail, setNodeDetail] = useState<NodeDetail | null>(null);
  const [innovationHistory, setInnovationHistory] = useState<InnovationHistory | null>(null);

  // ── ui state ──
  const [view, setView] = useState<ViewMode>('overview');
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);
  const [selectedInnovationIndex, setSelectedInnovationIndex] = useState(0);
  const [selectedInnovationRoundIndex, setSelectedInnovationRoundIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── load initial data ──
  useEffect(() => {
    (async () => {
      try {
        const path = await loadPath(projectPath);
        if (!path) { setError('No brainstorm path data found.'); setLoading(false); return; }
        setPathData(path);

        const allNodes = await loadAllNodes(projectPath);
        setNodes(allNodes);

        const ov = await getPathOverview(projectPath);
        setOverview(ov);

        // default to last round
        if (ov && ov.innovationEvolution.length > 0) {
          setSelectedRoundIndex(ov.innovationEvolution.length - 1);
          const lastRoundId = ov.currentRound;
          const detail = await getNodeDetail(projectPath, lastRoundId);
          setNodeDetail(detail);
        }

        setLoading(false);
      } catch (err) {
        setError(String(err));
        setLoading(false);
      }
    })();
  }, [projectPath]);

  // ── load node detail when round changes ──
  const loadNodeForIndex = useCallback(async (index: number) => {
    if (!overview) return;
    const evo = overview.innovationEvolution[index];
    if (!evo) return;
    const detail = await getNodeDetail(projectPath, `round-${evo.round}`);
    setNodeDetail(detail);
  }, [overview, projectPath]);

  // ── load innovation history ──
  const loadInnovation = useCallback(async (innovationId: string) => {
    const hist = await getInnovationHistory(projectPath, innovationId);
    setInnovationHistory(hist);
    setSelectedInnovationRoundIndex(0);
  }, [projectPath]);

  // ── keyboard handling ──
  useInput(async (input, key) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (view === 'overview') {
      if (key.leftArrow || key.upArrow) {
        const next = Math.max(0, selectedRoundIndex - 1);
        setSelectedRoundIndex(next);
      } else if (key.rightArrow || key.downArrow) {
        const max = (overview?.innovationEvolution.length ?? 1) - 1;
        const next = Math.min(max, selectedRoundIndex + 1);
        setSelectedRoundIndex(next);
      } else if (key.return) {
        await loadNodeForIndex(selectedRoundIndex);
        setView('node');
      } else if (input === 'i' && overview) {
        const evo = overview.innovationEvolution[selectedRoundIndex];
        if (evo && evo.active.length > 0) {
          setSelectedInnovationIndex(0);
          await loadInnovation(evo.active[0]);
          setView('innovation');
        }
      } else if (input === 'b') {
        setView('branches');
      }
    } else if (view === 'node') {
      if (key.leftArrow || key.upArrow) {
        const next = Math.max(0, selectedRoundIndex - 1);
        setSelectedRoundIndex(next);
        await loadNodeForIndex(next);
      } else if (key.rightArrow || key.downArrow) {
        const max = (overview?.innovationEvolution.length ?? 1) - 1;
        const next = Math.min(max, selectedRoundIndex + 1);
        setSelectedRoundIndex(next);
        await loadNodeForIndex(next);
      } else if (input === 'i' && nodeDetail) {
        const inns = nodeDetail.innovations.filter((inn) => inn.status === 'active');
        if (inns.length > 0) {
          const nextIdx = (selectedInnovationIndex + 1) % inns.length;
          setSelectedInnovationIndex(nextIdx);
          await loadInnovation(inns[nextIdx].id);
          setView('innovation');
        }
      } else if (input === 'b') {
        setView('branches');
      } else if (key.escape || input === 'o' || key.tab) {
        setView('overview');
      }
    } else if (view === 'innovation') {
      if (key.upArrow && innovationHistory) {
        const next = Math.max(0, selectedInnovationRoundIndex - 1);
        setSelectedInnovationRoundIndex(next);
      } else if (key.downArrow && innovationHistory) {
        const max = innovationHistory.evolution.length - 1;
        const next = Math.min(max, selectedInnovationRoundIndex + 1);
        setSelectedInnovationRoundIndex(next);
      } else if (key.escape) {
        await loadNodeForIndex(selectedRoundIndex);
        setView('node');
      } else if (input === 'o' || key.tab) {
        setView('overview');
      } else if (input === 'b') {
        setView('branches');
      }
    } else if (view === 'branches') {
      if (key.escape || input === 'o' || key.tab) {
        setView('overview');
      }
    }
  });

  // ── render ──
  if (loading) {
    return <Text color="cyan">Loading brainstorm path data...</Text>;
  }

  if (error) {
    return <Text color="red">{`Error: ${error}`}</Text>;
  }

  if (!overview || !pathData) {
    return <Text color="red">No data available.</Text>;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header
        topic={pathData.topic}
        view={view}
        round={overview.innovationEvolution[selectedRoundIndex]?.round ?? 0}
        totalRounds={overview.totalRounds}
      />

      {view === 'overview' && overview && (
        <OverviewView
          overview={overview}
          nodes={nodes}
          selectedIndex={selectedRoundIndex}
        />
      )}

      {view === 'node' && nodeDetail && (
        <NodeView
          detail={nodeDetail}
          roundIndex={selectedRoundIndex}
          totalRounds={overview.totalRounds}
        />
      )}

      {view === 'innovation' && innovationHistory && (
        <InnovationView
          history={innovationHistory}
          selectedRoundIndex={selectedInnovationRoundIndex}
        />
      )}

      {view === 'branches' && (
        <BranchesView projectPath={projectPath} />
      )}
    </Box>
  );
};

// ============================================================================
// 入口
// ============================================================================

export async function startTUI(projectPath: string): Promise<void> {
  const { waitUntilExit } = render(<App projectPath={projectPath} />);
  await waitUntilExit();
}

export { App };
