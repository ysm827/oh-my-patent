# AGENTS.md

Project instructions for OpenAI Codex CLI — patent disclosure drafting workflow (专利交底书撰写工作流).

## Project Overview

This is a patent disclosure drafting workflow system that orchestrates
multi-agent collaboration to generate patent disclosure documents.
The system uses a core repository for workflow configuration and separate project
repositories for each patent topic.

## Commands

### Workflow Execution
- Start a patent workflow by describing your intent in natural language
- The orchestrator agent will route your request automatically
- Codex reads `AGENTS.md` as the primary instruction file
- Specialist prompts are generated in `.codex/agents/<agent-id>.md` for manual or wrapper-driven invocation
- `codex.json` is a machine-readable manifest for wrappers; do not assume every Codex CLI version supports `codex --agent`

### Slash Commands

- `/patent-new` - 新建专利项目
- `/patent-search` - 专利检索
- `/patent-draft` - 生成交底书
- `/patent-review` - 审核交底书
- `/patent-status` - 查看项目状态
- `/brainstorm-resume` - 查看头脑风暴路径、从节点恢复、分支探索、恢复已放弃创新点
- `/patent-diagram` - 生成、重渲染或查看专利附图

### Development Workflow
- Create new projects via the workflow (don't manually create project directories)
- Projects follow the naming pattern: `./projects/{NN}-{topic_slug}/` where NN is a 2-digit incrementing number
- Each project directory is an independent Git repository

## Architecture

### Repository Structure
- **Core repository** (`/patents`): Contains workflow configuration, agent definitions, templates - does not store project deliverables
- **Project repositories** (`./projects/{NN}-{topic_slug}/`): Each patent topic has its own Git repo containing MAIN.md, conversation.md, references/, figures/

### Multi-Agent System

Codex uses `AGENTS.md` as the primary project instruction file.
oh-my-patent also generates a `.codex/` prompt catalog and `codex.json` manifest
so wrappers or newer Codex builds can locate specialist prompts without losing
the portable workflow definition.

Codex version compatibility rule: do not rely on a portable native sub-agent
API being available. If the active Codex session supports delegation, use it.
If it does not, execute the specialist role in the current session using the
matching prompt from `.codex/agents/`, persist its output to `references/`,
and clearly label which specialist role produced the material.

**Orchestration**:
- `archimedes` - Archimedes - 专利交底书主流程编排

**Specialist Agents** (prompt files in `.codex/agents/`, manifest entries in `codex.json`):
- `patent-adversarial-examiner` - 对抗式审查员（专盯新颖性/创造性漏洞与最强反对意见）
- `patent-brainstorm-moderator` - 头脑风暴主持人
- `patent-disclosure-reviewer` - 交底书审核代理
- `patent-disclosure-writer` - 交底书撰写代理
- `patent-innovation-architect` - 创意激发代理
- `patent-landscape-analyst` - 专利检索代理（MCP 聚合）
- `patent-path-recorder` - 头脑风暴路径记录器
- `patent-product-compliance-analyst` - 密码机产品与合规场景专家（性能指标、运维审计、合规边界）
- `patent-security-engineer` - 密码工程与安全边界审阅（聚焦缓存/侧信道/密封/失效擦除）
- `patent-technical-responder` - 技术人员答复代理
- `patentability-evaluator` - 可专利性评估代理
- `patent-diagram-generator` - 读取交底书内容，生成 Mermaid/PlantUML 专利附图并渲染输出

### Agent Routing Rules

When acting as the archimedes orchestrator, follow these routing rules:

| User Intent | Route To |
|-------------|----------|
| New patent project | Create project dir + use `patent-landscape-analyst` prompt |
| Search prior art | Use `patent-landscape-analyst` prompt |
| Generate innovation points | Use `patent-innovation-architect` prompt |
| Evaluate patentability | Use `patentability-evaluator` prompt |
| Draft disclosure | Use `patent-disclosure-writer` prompt |
| Review disclosure | Use `patent-disclosure-reviewer` prompt |
| Security review | Use `patent-security-engineer` prompt |
| Compliance review | Use `patent-product-compliance-analyst` prompt |
| Continue workflow | Read `.patent/state.json` and route to current stage |

### Workflow State Machine

```
INIT → RESEARCH → BRAINSTORM_R1 → BRAINSTORM_R2 → DRAFT → QA_LOOP → FINAL_REVIEW → DIAGRAM → DONE
```

- QA_LOOP can transition back to DRAFT
- FINAL_REVIEW can transition back to QA_LOOP
- State is persisted in `<project>/.patent/state.json`

### Skills

- `prior-art-search` - Prior Art Search (`.codex/skills/prior-art-search/SKILL.md`)
- `evidence-card` - Evidence Card (`.codex/skills/evidence-card/SKILL.md`)
- `jurisdiction` - Jurisdiction Rules (`.codex/skills/jurisdiction/SKILL.md`)
- `disclosure-template` - Disclosure Template (`.codex/skills/disclosure-template/SKILL.md`)
- `quality-gate` - Quality Gate (`.codex/skills/quality-gate/SKILL.md`)
- `brainstorm-path` - Brainstorm Path (`.codex/skills/brainstorm-path/SKILL.md`)

## Writing Standards

When working with patent disclosure Markdown files:

- **Headings**: Use `#` for document title only, `##` for main sections, `###` for subsections
- **Paragraphs**: Leave blank lines between paragraphs, avoid merging multiple paragraphs
- **Formulas**: Use Word-compatible linear format: `$S_(load)$` not `$S_{\mathrm{load}}$`
- **Avoid**: `\operatorname`, `\mathrm`, `\left`, `\right`, `\!` in formulas
- **Figures**: Keep image tags and captions on separate lines
- **Section structure**: Follow the standard patent disclosure template (零 through 十一)
- **References**: Use `[R#]` notation with References section at end

## Agent Constraints

- **No simulation**: Agents must produce real outputs, not simulate what other agents would say
- **Output persistence**: All agent outputs must be saved to `references/` with standardized filenames
- **Workflow phases**: Strict sequence - brainstorm → draft → QA/argue loop → finalize
- **Exit conditions**: QA/argue loop requires 2 consecutive rounds with no new issues
- **File naming**: `references/brainstorm_round{r}_{agent-id}.md`, `references/argue_round{r}_{agent-id}.md`

### Path System

The system includes a decision path tracking mechanism (`.brainstorm/` directory in projects):
- Records brainstorming decisions for auditability and backtracking
- Supports branching to explore alternative innovation directions
- Enables session recovery from historical nodes
- Main path file: `.brainstorm/path.json`
- Node files: `.brainstorm/nodes/round-{n}.json`

### MCP Integration

Configured MCP servers (in `codex.json`):
- `google_scholar`
- `uspto_patent`
- `mcp_scholarly`
- `semantic_scholar`
- `mcp_server_office`
- `sequential_thinking`
- `context7`
- `eslint`

### Codex Generated Files

- `AGENTS.md`: primary Codex project instructions
- `codex.json`: machine-readable oh-my-patent manifest for adapters/wrappers
- `.codex/agents/*.md`: specialist role prompts
- `.codex/commands/*.md`: slash-command prompt definitions
- `.codex/skills/*/SKILL.md`: skill instructions available to Codex sessions

### Jurisdiction Configuration

- Default jurisdiction: **CN**
- Supported: CN (中国), US (United States), PCT (International)

## Commit Style

Use Conventional Commits:
- `feat: ...` for new features
- `docs: ...` for documentation changes
- `chore: ...` for maintenance tasks
- `init: ...` for initializations
