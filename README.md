# oh-my-patent

[![npm version](https://img.shields.io/npm/v/oh-my-patent.svg)](https://www.npmjs.com/package/oh-my-patent)
[![npm downloads](https://img.shields.io/npm/dm/oh-my-patent.svg)](https://www.npmjs.com/package/oh-my-patent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-87%20passing-brightgreen.svg)](https://github.com/zengbods/oh-my-patent)

> Your idea → a full patent disclosure document, without you herding 11 AI agents into a task queue.

## For AI Assistants

If you're an AI helping a user install and use oh-my-patent, just run:

```bash
npm install -g oh-my-patent && oh-my-patent adapt setup --workspace-dir .
```

Then tell the user they can use `/archimedes` in their editor to start a patent project.

---

## For Humans

Copy-paste this to your AI agent:

```
Install oh-my-patent:
npm install -g oh-my-patent && oh-my-patent adapt setup --workspace-dir .

Then I can use /archimedes in my editor to start a patent project.
```

Or just let your AI read this README and figure it out.

---

## One-Liner

Install. Type `/archimedes`. Describe what you want. The rest is handled by 11 patent-specialized AI agents.

```bash
npm install -g oh-my-patent
oh-my-patent adapt setup --workspace-dir .
```

Then:

```text
/archimedes
> Create a patent project about homomorphic encryption in privacy-preserving computing.
```

It will search, brainstorm, assess, draft, review, and generate patent figures on its own.
Every decision is recorded — you can roll back to any round, fork to explore alternatives, or revive a discarded innovation.

---

## 🎬 Quick Demo

### Before oh-my-patent
![Manual Patent Workflow](https://via.placeholder.com/800x400/2d3748/ffffff?text=Manual+workflow%3A+Switch+between+10+tools%2C+lose+context%2C+manually+merge+outputs)

### After oh-my-patent
![Automated Patent Workflow](https://via.placeholder.com/800x400/48bb78/ffffff?text=oh-my-patent%3A+One+command%2C+11+agents%2C+auditable+path%2C+auto-figures)

> **Note**: GIF demonstrations will be added in v0.1.1. Screenshots show the conceptual workflow difference.

---

## Your Pain vs. What This Does

| Your Pain | In Other Tools | In oh-my-patent |
|---|---|---|
| You have to prompt 10 different AIs, then consolidate everything yourself | You cut up the work, paste chat logs across windows, manually merge | **Archimedes**, the primary orchestrator, routes everything to 11 specialist agents. Outputs are auto-saved to `references/`, context passes between rounds automatically |
| After 3 rounds of brainstorming, you scroll up and the rejected gems are gone | Chat history scrolls away, and you can't find that one great idea from round 2 | **.brainstorm/ decision-path tracking** persists every round's scores, innovations, and pass/reject decisions as an auditable DAG. Roll back, fork, or revive at will |
| Patent figures are a cycle of Visio → screenshot → paste into Word | You draw by hand, export, format, lose the source | **Mermaid/PlantUML figure generation** extracts the architecture from MAIN.md, renders to SVG+PNG, and **auto-updates** the figure references in MAIN.md |
| Every new teammate who uses Claude Code or Codex needs a different, hand-written config | Claude Code settings, Codex settings, separate and manual for each project | **`oh-my-patent adapt setup`** — one command generates configs for **both** Claude Code (`.claude/` + CLAUDE.md) and Codex (`.codex/` + codex.json). Uninstall is also one command, and it **only** removes what we generated |
| Halfway through, your machine crashes or the conversation breaks | Scrambling through screenshots, starting over from zero | **Workflow state machine**. All stages are written to `state.json`, and the decision tree is in `path.json`. Resume from the exact point of failure |
| After 6 review rounds, you have no idea what "done" looks like | A mess of loose documents | **Quantitative threshold model** auto-decides if brainstorming is mature enough. The QA loop has a clear exit: 2 consecutive rounds with no new issues |

## The Full Feature Set (For When You Want It)

The table above handles 90% of real use cases. Here's everything, for when you need to come back to check:

|  | Feature | What it means in one sentence |
|---|---|---|
| 🧠 | **Brainstorm decision-path tracking** | `.brainstorm/` records every round's scores, innovations, and pass/reject decisions. Roll back to any node, fork to explore alternatives, or revive discarded ideas |
| 🤖 | **End-to-end 11-agent pipeline** | Search → ideation → patentability → draft → review → rebuttal → diagrams. The full patent lifecycle, with zero hand-holding between stages |
| ⚡ | **`/archimedes` one-liner entry** | Regardless of what you want, start with Archimedes. He reads your state, routes to specialists, waits for output, and moves to the next stage |
| 🔗 | **Zero-config cross-tool adapters** | `oh-my-patent adapt setup` generates configs for both Claude Code and Codex in one shot |
| 🛡️ | **Safe uninstall** | Exact-file cleanup — we only delete files we auto-generated. No `readdir + unlink` traversing your workspace |
| 📊 | **Auto figure rendering** | Parses MAIN.md for technical architecture, renders Mermaid/PlantUML to SVG+PNG, and auto-rewrites references |
| 🎯 | **Scoring thresholds & QA loops** | Quantitative model decides if a brainstorming round is ripe. Up to 6 review-rebuttal loops, exiting on 2 consecutive clean rounds |
| 💻 | **Interactive terminal blueprint** | Ink+React TUI for locally browsing the decision path, node details, and branch overviews with zero internet dependency |
| 🔄 | **Resumable workflow** | `INIT → RESEARCH → BRAINSTORM → DRAFT → QA_LOOP → FINAL_REVIEW → DIAGRAM → DONE`. Crashes or session breaks are non-destructive; resume from `state.json` |

## Installation

### Step 1: Install the CLI globally

```bash
npm install -g oh-my-patent
```

This installs the `oh-my-patent` command globally on your system.

### Step 2: Generate editor configurations

Navigate to your project directory and run:

```bash
cd your-patent-projects
oh-my-patent adapt setup --workspace-dir .
```

This generates:
- **Claude Code**: `.claude/agents/`, `.claude/commands/`, `CLAUDE.md`
- **Codex**: `.codex/agents/`, `.codex/skills/`, `AGENTS.md`

After this, you can use `/archimedes` and other commands in your editor.

**Options**:
```bash
# Generate configs for specific tool only
oh-my-patent adapt setup --tool claude-code --workspace-dir .
oh-my-patent adapt setup --tool codex --workspace-dir .

# Other commands
oh-my-patent adapt install     # alias for setup
oh-my-patent adapt uninstall   # remove generated configs
oh-my-patent adapt generate    # only writes to ./plugins/<tool>/, does not touch workspace
```

### For AI Assistants

If you're an AI assistant helping a user install oh-my-patent, use this command:

```bash
npm install -g oh-my-patent && cd /path/to/user/project && oh-my-patent adapt setup --workspace-dir .
```

Replace `/path/to/user/project` with the actual project directory path.

### Local development

```bash
git clone https://github.com/zengbods/oh-my-patent
cd oh-my-patent
npm install
npm run build
```

Use `node dist/cli.js` or `npx -p . oh-my-patent` after building.

---

## Full Usage

```
oh-my-patent <domain> <subcommand> [options]
```

### Brainstorm Path (`path`): track, branch, evaluate

| Subcommand | What it does |
|------------|--------------|
| `path init <project>` | Initialize `.brainstorm/` and `state.json` |
| `path record <project> --round <N> --data <json\|@file>` | Record round N with full scores, decisions, and innovation snapshots |
| `path overview <project>` | Path summary: from start to finish, where you are now, whether the project is done |
| `path node <project> <round-N>` | Details of a specific round: who said what, innovation scores, final decision |
| `path innovation(s) <project> [ID]` | Full history of one innovation — when it was proposed, how it was rated, where it ended up |
| `path branch <project> --from-node <id> --reason <text>` | **Fork** from any historical node to explore an alternative path with a different reason |
| `path branches <project>` | List all branches |
| `path restore <project> --node <id> --innovation <id>` | **Revive** a previously abandoned innovation and bring it back into the discussion |
| `path threshold <project> --round <N>` | Evaluate whether the round's scores pass the threshold, with a recommendation (iterate or proceed) |
| `path visualize <project> [--mode overview\|node\|innovation\|branch\|dashboard] --target <id>` | Terminal box-drawing visualization |
| `path markdown <project> [--mode overview\|node\|innovation\|branch] --target <id>` | Export a Markdown report |

### Patent Diagrams (`diagram`): extract, render, rewrite

| Subcommand | What it does |
|------------|--------------|
| `diagram render <project> --specs <json\|@file> --phase draft\|final` | Batch render into `figures/` (SVG+PNG), and auto-update MAIN.md figure references |
| `diagram status <project>` | Get the list of rendered figures (figureNumber, phase, file paths) |
| `diagram rerender <project> --figure <ID> --source <mmd\|@file> --engine mermaid\|plantuml` | Update single figure (use after editing Mermaid/PlantUML source) |

### Adapters (`adapt`): one command, all editors

| Subcommand | What it does |
|------------|--------------|
| `adapt setup [--tool claude-code\|codex] [--workspace-dir .]` | Recommended entry. Installs editor configs, then shows the exact `uninstall` command |
| `adapt install` | Behavior identical to `setup` |
| `adapt uninstall [--tool <name>] [--workspace-dir .]` | **Exact-file removal only**. We do not touch your custom files |
| `adapt generate` | Writes to `plugins/<tool>/` only, does not write to the workspace |

### Interactive TUI (`tui`)

```bash
oh-my-patent tui [project-path]
```

Launches an Ink+React terminal UI. Navigate the decision path, view scores, switch branches, and revive innovations — all locally, no internet needed.

---

## The Workflow

```
User proposes a topic
       ↓
 [INIT]  Generate `projects/{NN}-{topic_slug}/`
         Initialize .patent/state.json + .brainstorm/path.json
       ↓
 [RESEARCH] Patent search
            → references/landscape.md (generated by landscape-analyst)
       ↓
 [BRAINSTORM_R1] Round 1
            Head-to-head: innovation-architect generates candidates + adversarial-examiner attacks them
            Scores are recorded, innovation snapshots saved to .brainstorm/nodes/round-1.json
       ↓
 [BRAINSTORM_R2] Round 2
            Deep assessment by security-engineer, compliance-analyst, and evaluator
       ↓ (threshold passed / 2 rounds done)
 [DRAFT]  Generate initial disclosure
            → MAIN.md (generated by patent-disclosure-writer)
       ↓
 [QA_LOOP] Review-rebuttal loop
            Reviewer raises issues → technical-responder writes revisions
            ≤ 6 rounds, exiting on 2 consecutive rounds with no new issues
       ↓
 [FINAL_REVIEW] Final pass, can loop back to QA_LOOP
       ↓
 [DIAGRAM] Automatically render patent figures
            → figures/ (SVG + PNG, with automatic references rewritten in MAIN.md)
       ↓
 [DONE]   Quality gate: quality-gate check → finished

           If the agent crashes mid-sentence: read state.json → resume from the exact stage
           If you regret a round: `path branch --from-node round-{N}` → explore an alternative
           If a long-forgotten innovation was actually good: `path restore` → bring it back
```

## Architecture

The system is split into four layers:

| Layer | What it governs | Key files |
|-------|-----------------|-----------|
| **Orchestration** | Agent/skill/command definitions. Defined once, consumed everywhere | `plugin.jsonc`, `opencode.jsonc`, `.opencode/skills/` |
| **Engine** | Path tracking, state machine, figure rendering, threshold logic | `src/core/` |
| **Command** | Unified CLI layer wrapping the engine's capabilities | `src/cli.ts`, `src/commands/` |
| **Adapter** | Converts orchestration definitions into Claude Code / Codex -ready configs | `src/adapters/claude/`, `src/adapters/codex/` |

Data flow between the layers:

```
  plugin.jsonc (orchestration layer definition)
           ↓
    [Adapters] generate automatically
           ↓
  .claude/ (Claude Code)    <—— one file, consumed all tools
  .codex/ (Codex)           <——
  AGENTS.md / CLAUDE.md
  codex.json
           ↓
  AI in your editor invokes 11 specialist agents
           ↓
  Output → .brainstorm/ decision-path records
  Output → state.json workflow state machine
  Output → references/ with standardized filenames
  Output → MAIN.md + figures/

  CLI commands = automated operations on .brainstorm/ + .patent/ + references/
  TUI = visualized browsing of .brainstorm/
```

## Directory Structure

```
oh-my-patent/              # Core repo: configs and engine; no project deliverables
├── src/
│   ├── cli.ts             # CLI entry point
│   ├── core/
│   │   ├── brainstorm-path.ts    # Decision-path data model + scoring thresholds
│   │   ├── path-persistence.ts # Atomic writes + rollback
│   │   ├── path-graph.ts       # Graph structure + forking algorithms
│   │   ├── diagram-renderer.ts # Mermaid/PlantUML → SVG/PNG
│   │   └── threshold-config.ts # Quantitative threshold model
│   ├── commands/          # path init/record/overview/branch/restore...
│   ├── adapters/          # Zero-config cross-tool adapters
│   │   ├── claude/        # → .claude/ + CLAUDE.md
│   │   └── codex/         # → .codex/ + AGENTS.md + codex.json
│   └── tui/               # Ink+React interactive UI
├── plugin.jsonc
├── opencode.jsonc
└── dist/ (compiled output)

projects/{NN}-{topic_slug}/   # One Git repo per patent
├── .brainstorm/
│   ├── path.json             # Metadata + edges + current node + final decision
│   ├── nodes/
│   │   └── round-{n}.json    # Round detail: scores, innovations, decisions, timestamps
│   ├── snapshots/
│   │   └── round-{n}-innovations.json  # Innovation history snapshots
│   └── branches/
│       └── {branchId}/       # Branch steps — independent node copies
├── .patent/
│   └── state.json            # Workflow state machine: at DRAFT? QA round 3?
├── references/
│   ├── landscape.md          # Search results
│   ├── brainstorm_round1_archimedes.md
│   ├── argue_round2_adversarial-examiner.md
│   └── ...                   # Every agent output follows a strict naming convention
├── figures/
│   ├── 001-system-overview.png
│   ├── 001-system-overview.svg
│   └── figures-manifest.json # Version management
├── MAIN.md                   # Final disclosure (auto-updated by diagram inserter)
└── conversation.md           # Chronological conversation log
```

## Script Quickref

```bash
npm run build  # Compile TypeScript → dist/
npm test       # Run the vitest test suite
npm run lint   # tsc --noEmit type checking
```

---

## Acknowledgments

Special thanks to:

- **[LINUX DO Community](https://linux.do/)** 
- All contributors who helped improve this project
- The open-source community for the amazing tools and libraries that made this possible

---

## License

MIT
