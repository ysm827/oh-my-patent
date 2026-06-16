# Command: /brainstorm-resume

## Description
Resume a brainstorm session from a specific node, branch, or restore a previously discarded innovation. Enables flexible navigation through the brainstorm decision tree.

## Usage

### Basic Syntax
```
/brainstorm-resume <project-path> [options]
```

### Options
| Option | Description |
|--------|-------------|
| `--from-node <node-id>` | Resume from a specific round/node (e.g., `round-1`, `round-2`) |
| `--branch <branch-id>` | Continue on a specific branch (e.g., `branch-1`, `branch-2`) |
| `--restore <innovation-id>` | Restore a discarded innovation point (e.g., `INN-003`) |
| `--list-innovations` | List all innovation points with their status |
| `--list-branches` | List all available branches |
| `--show-path` | Display the complete decision path overview |

## Behavior

1. **Path Resolution**: Resolves the project's `.brainstorm/` directory to locate path data
2. **State Validation**: Validates the requested node/branch/innovation exists and is in a valid state
3. **Context Restoration**: Loads the full context from the specified point
4. **Agent Notification**: Notifies relevant agents about the resumed session

## Prerequisites
- Project must have `.brainstorm/path.json` file
- Project must be in `BRAINSTORM` or `DRAFT` stage
- Requested node/branch/innovation must exist

## Examples

### Example 1: Resume from Round 2
```
/brainstorm-resume projects/01-quantum-audit-migration --from-node round-2
```
Output:
```
Resuming from Round 2...
Loaded context: 5 innovation points, 3 main storylines
Previous decisions:
  - Selected INN-001 as primary storyline
  - Rejected INN-003 (insufficient novelty)
Ready for Round 3 brainstorm.
```

### Example 2: Show Path Overview
```
/brainstorm-resume projects/01-quantum-audit-migration --show-path
```
Output:
```
Brainstorm Path Overview for: quantum-audit-migration

Timeline:
  Round 1 (2025-04-03)
    ├── INN-001: 算力负载感知算法 [ACCEPTED]
    ├── INN-002: 密钥分片存储机制 [ACCEPTED]
    └── INN-003: 审计日志压缩 [REJECTED - lacks novelty]
    
  Round 2 (2025-04-04)
    ├── INN-004: 动态迁移决策树 [ACCEPTED]
    └── INN-005: 多签审计锚点 [BRANCHED → branch-1]
    
Branches:
  branch-1: 探索多签审计锚点的硬件实现方案
    └── Created from: round-2/INN-005

Current Status: Round 2 completed, ready for Round 3
```

### Example 3: Create Branch from Round 1
```
/brainstorm-resume projects/01-quantum-audit-migration --branch new-branch-1 --from-node round-1
```
Note: For creating new branches, use `/brainstorm-branch` command instead.

### Example 4: Restore Discarded Innovation INN-003
```
/brainstorm-resume projects/01-quantum-audit-migration --restore INN-003
```
Output:
```
Restoring INN-003: 审计日志压缩
Previous rejection reason: lacks novelty

To restore this innovation, you can:
1. Add new differentiation elements (e.g., compression ratio guarantees)
2. Combine with existing innovation points
3. Create a new branch for exploration

Do you want to:
  - [A] Add to current round with modifications
  - [B] Create a new branch for exploration
  - [C] Cancel restoration
```

### Example 5: List All Innovations
```
/brainstorm-resume projects/01-quantum-audit-migration --list-innovations
```
Output:
```
Innovation Points for: quantum-audit-migration

ID       | Name                        | Status    | Round   | Score
---------|-----------------------------|-----------|---------|------
INN-001  | 算力负载感知算法             | ACCEPTED  | round-1 | 4.2
INN-002  | 密钥分片存储机制             | ACCEPTED  | round-1 | 4.0
INN-003  | 审计日志压缩                 | REJECTED  | round-1 | 2.1
INN-004  | 动态迁移决策树               | ACCEPTED  | round-2 | 4.5
INN-005  | 多签审计锚点                 | BRANCHED  | round-2 | 3.8

Total: 5 innovations (3 accepted, 1 rejected, 1 branched)
```

### Example 6: List All Branches
```
/brainstorm-resume projects/01-quantum-audit-migration --list-branches
```
Output:
```
Branches for: quantum-audit-migration

Branch ID    | Source Node  | Innovation  | Status     | Description
-------------|--------------|-------------|------------|------------------
branch-1     | round-2      | INN-005     | ACTIVE     | 硬件实现方案探索
branch-2     | round-1      | INN-003     | ABANDONED  | 压缩方案备选路径

Active branches: 1
Abandoned branches: 1
```

## Error Handling

### Node Not Found
```
Error: Node 'round-5' not found in path.

Available nodes:
  - round-1
  - round-2

Use one of the available nodes or start a new round.
```

### Branch Not Found
```
Error: Branch 'branch-99' does not exist.

Available branches:
  - branch-1
  - branch-2

Use --list-branches to see all available branches.
```

### Innovation Status Invalid
```
Error: Cannot restore INN-001 (status: ACCEPTED).

Only innovations with status REJECTED or ABANDONED can be restored.
Use --list-innovations to see restorable innovations.
```

### Project Not in Valid Stage
```
Error: Project is in FINAL_REVIEW stage.

brainstorm-resume requires project to be in BRAINSTORM or DRAFT stage.
Current stage: FINAL_REVIEW
```

### Path File Missing
```
Error: No brainstorm path found for this project.

The project may not have started brainstorming yet.
Use /patent-new to initialize the project first.
```

## Related Commands
- `/patent-new` - Initialize a new patent project
- `/patent-status` - Show current project status
- `/brainstorm-branch` - Create a new branch from a decision point
- `/brainstorm-abandon` - Mark an innovation as abandoned

## API Integration

This command leverages the following Path APIs:
- `getPathOverview(projectPath)` - Get path overview
- `getNodeDetail(projectPath, nodeId)` - Get node detail
- `createBranchFromNode(projectPath, nodeId, reason)` - Create branch (via `/brainstorm-branch`)
- `restoreInnovation(projectPath, nodeId, innovationId)` - Restore innovation
- `listAllInnovations(projectPath)` - List all innovations
- `listBranches(projectPath)` - List all branches
