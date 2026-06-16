# oh-my-patent

[![npm version](https://img.shields.io/npm/v/oh-my-patent.svg)](https://www.npmjs.com/package/oh-my-patent)
[![npm downloads](https://img.shields.io/npm/dm/oh-my-patent.svg)](https://www.npmjs.com/package/oh-my-patent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-87%20passing-brightgreen.svg)](https://github.com/zengbods/oh-my-patent)

> 你的创意 → 完整的专利交底书，不需要你组织 11 个 AI 的智能体排队干活。

## 给 AI 助手看的

如果你是 AI，在帮用户安装和使用 oh-my-patent，直接运行：

```bash
npm install -g oh-my-patent && oh-my-patent adapt setup --workspace-dir .
```

然后告诉用户可以在编辑器里使用 `/archimedes` 开始专利项目。

---

## 给人类看的

复制这段话给你的 AI 助手：

```
安装 oh-my-patent：
npm install -g oh-my-patent && oh-my-patent adapt setup --workspace-dir .

然后我就可以在编辑器里用 /archimedes 开始专利项目了。
```

或者直接让 AI 读这个 README，它会搞定的。

---

## 一句话

安装。写作 `/archimedes`，说你要什么。剩下的交给 11 个专利专用 AI 智能体。

```bash
npm install -g oh-my-patent
oh-my-patent adapt setup --workspace-dir .
```

然后：

```text
/archimedes
> 基于同态加密在隐私计算中的应用，新建一个专利项目。
```

它会自己检索、头脑风暴、评估可专利性、撰写、审查、生成附图。
每一步的决策都被记录下来——你能回退到任意一轮、分叉探索替代方案、复活已放弃的创新点。

---

## 🎬 快速演示

### oh-my-patent 之前
![手动专利工作流](https://via.placeholder.com/800x400/2d3748/ffffff?text=手动工作流：在10个工具间切换，丢失上下文，手动合并输出)

### oh-my-patent 之后
![自动化专利工作流](https://via.placeholder.com/800x400/48bb78/ffffff?text=oh-my-patent：一条命令，11个智能体，可审计路径，自动附图)

> **注意**: GIF 动画演示将在 v0.1.1 版本中添加。截图展示了工作流差异的概念。

---

## 你遇到的痛点 vs 这里怎么解决

| 你的痛苦 | 别的工具怎么做 | oh-my-patent 怎么做 |
|---|---|---|
| 要问 10 个 AI 不同的提示词，再人工整理输出 | 你需要自己切分任务、粘贴对话、手动归并 | **Archimedes 主编排器**自动路由到 11 个专业智能体，每轮产出自动写入 `references/`，上下文在各轮间自动传递 |
| 多轮头脑风暴翻完页就失忆了 | 对话历史丢失，放弃的创新点再也找不到 | **.brainstorm/ 决策路径系统**把每轮的评分、创新点、淘汰/通过决策持久化成有向无环图，支持回退、分叉、恢复 |
| 写专利附图要画 Visio/PPT 再贴图 | 手动作图、另存为图片再插入 Word | **Mermaid/PlantUML 自动渲染**从交底书提取技术架构，输出 SVG+PNG 并自动回写 `MAIN.md` |
| 帮同事安装 Claude Code 或 Codex 后，都给他写不同的配置 | Claude Code 一套，Codex 另一套，手抄 | **一条命令自动适配** Claude Code（.claude/ + CLAUDE.md）和 Codex（.codex/ + codex.json），卸载也是一条命令，且只删自己生成的文件 |
| 写了一半机器崩了/对话断了 | 从 jpg 里翻截图，从零重来 | **工作流状态机**。所有阶段写入 `state.json` + 决策树写入 `path.json`，断点即续 |
| 审查 6 轮后不知道自己到哪一关了 | 混乱的文档拼凑 | **量化阈值模型**自动判断头脑风暴是否成熟，QA 循环有明确的退出条件（连续 2 轮无新问题） |

## 还有很多，但你不需要先读

上表提到的功能已经够你跑完 90% 的用例。以下是完整的亮点怕你以后回来查：

### 全部亮点

| 图标 | 名称 | 一句话解释 |
|-----:|:------|:------|
| 🧠 | **头脑风暴决策路径追踪** | `.brainstorm/` 里自动保存每轮的评分、创新点、淘汰/通过决策。能回退到任意节点、分叉探索替代方向、复活已放弃创新点 |
| 🤖 | **11 智能体端到端流水线** | 检索 → 创意激发 → 可专利性评估 → 撰写 → 审查 → 答辩 → 附图，覆盖交底书全生命周期 |
| ⚡ | **`/archimedes` 一句话启动** | 不管什么命令，先找 Archimedes。他判断阶段、分配任务、传递上下文、等待产出、推进下一关 |
| 🔗 | **零配置跨工具适配器** | `oh-my-patent adapt setup` 一条命令给 Claude Code 和 Codex 同时注册配置 |
| 🛡️ | **安全卸载** | 精确文件级清理——只删自动生成的文件，绝不 `readdir + unlink` 遍历你工作区 |
| 📊 | **自动附图渲染** | 解析 MAIN.md 中的技术架构描述，Mermaid/PlantUML → SVG/PNG，自动回写 |
| 🎯 | **评分阈值与 QA 循环** | 量化阈值模型自动判断头脑风暴够不够深入；审查阶段最多 6 轮 QA 循环，直到连续 2 轮无新问题 |
| 💻 | **交互式终端蓝草图** | 基于 Ink+React 的 TUI，本地可视化浏览决策路径、节点详情、分支概览 |
| 🔄 | **可恢复工作流** | `INIT → RESEARCH → BRAINSTORM → DRAFT → QA_LOOP → FINAL_REVIEW → DIAGRAM → DONE`，机器崩溃也能从 `state.json` 接上 |

## 安装步骤

### 第1步：全局安装CLI工具

```bash
npm install -g oh-my-patent
```

这会在系统中全局安装 `oh-my-patent` 命令。

### 第2步：生成编辑器配置

进入你的项目目录并运行：

```bash
cd your-patent-projects
oh-my-patent adapt setup --workspace-dir .
```

这会生成：
- **Claude Code**: `.claude/agents/`, `.claude/commands/`, `CLAUDE.md`
- **Codex**: `.codex/agents/`, `.codex/skills/`, `AGENTS.md`

完成后，你就可以在编辑器中使用 `/archimedes` 等命令了。

**其他选项**：
```bash
# 只为特定工具生成配置
oh-my-patent adapt setup --tool claude-code --workspace-dir .
oh-my-patent adapt setup --tool codex --workspace-dir .

# 其他命令
oh-my-patent adapt install     # setup的别名
oh-my-patent adapt uninstall   # 删除生成的配置
oh-my-patent adapt generate    # 仅写入./plugins/<tool>/，不修改工作区
```

### 给AI助手的安装指令

如果你是AI助手，在帮助用户安装oh-my-patent时，使用此命令：

```bash
npm install -g oh-my-patent && cd /path/to/user/project && oh-my-patent adapt setup --workspace-dir .
```

将 `/path/to/user/project` 替换为实际的项目目录路径。

### 本地开发

```bash
# 克隆项目
git clone https://github.com/zengbods/oh-my-patent
cd oh-my-patent
npm install
npm run build
```

构建后使用 `node dist/cli.js` 或 `npx -p . oh-my-patent`。

---

## 完整用法

```
oh-my-patent <域> <子命令> [选项]
```

### 头脑风暴路径（`path`）：追踪、分叉、评估

| 子命令 | 用途 |
|--------|------|
| `path init <项目>` | 初始化 `.brainstorm/` 目录结构和 `state.json` |
| `path record <项目> --round <N> --data <json\|@文件>` | 记录第 N 轮完整数据（评分、决策、创新点快照） |
| `path overview <项目>` | 路径概览：从哪到哪、当前在哪、是否完成 |
| `path node <项目> <round-N>` | 查看某轮详情：谁说了什么、创新点评分、最终决策 |
| `path innovation(s) <项目> [ID]` | 一个创新点的全部历史（哪轮提出、哪轮评估、后来去哪了） |
| `path branch <项目> --from-node <id> --reason <原因>` | **分叉**——从任意历史节点，用不同理由跑替代方案 |
| `path branches <项目>` | 列出所有分支 |
| `path restore <项目> --node <id> --innovation <id>` | **复活**——把一个已放弃的创新点重新带回讨论 |
| `path threshold <项目> --round <N>` | 该轮评分是否通过阈值，给出建议（继续迭代 / 进入撰写） |
| `path visualize <项目> [--mode overview\|node\|innovation\|branch\|dashboard] --target <id>` | 终端 box-drawing 可视化 |
| `path markdown  <项目> [--mode overview\|node\|innovation\|branch] --target <id>` | 导出 Markdown 报告 |

### 专利附图（`diagram`）：自动提取、渲染、回写

| 子命令 | 用途 |
|--------|------|
| `diagram render <项目> --specs <json\|@文件> --phase draft\|final` | 批量渲染，输出 SVG+PNG，自动更新 MAIN.md 的图表引用 |
| `diagram status <项目>` | 查看已渲染图表清单（含 figureNumber、phase、文件路径） |
| `diagram rerender <项目> --figure <ID> --source <mmd\|@文件> --engine mermaid\|plantuml` | 更新单图（修改 Mermaid/PlantUML 源码后使用） |

### 适配器（`adapt`）：一条命令适配所有编辑器

| 子命令 | 用途 |
|--------|------|
| `adapt setup [--tool claude-code\|codex] [--workspace-dir .]` | 推荐入口。安装编辑器配置，带卸载提示 |
| `adapt install` | 与 `setup` 行为一致 |
| `adapt uninstall [--tool <name>] [--workspace-dir .]` | **只删自动生成的文件**。绝不碰你的自定义文件 |
| `adapt generate` | 只生成到 `plugins/<tool>/`，不写入工作区 |

### 交互式 TUI（`tui`）

```bash
oh-my-patent tui [项目路径]
```

启动 Ink+React 终端界面，键盘浏览决策路径、查看评分、切换分支、恢复创新点。

---

## 工作流

```
用户提出选题
       ↓
 [INIT]  生成 `projects/{NN}-{topic_slug}/`
         初始化 .patent/state.json + .brainstorm/path.json
       ↓
 [RESEARCH] 专利检索
            → references/landscape.md（由 landscape-analyst 产出）
       ↓
 [BRAINSTORM_R1] 第 1 轮
            多头对战：innovation-architect 生成创意 + adversarial-examiner 砸漏洞
            评分 ↔ 创新点快照 → .brainstorm/nodes/round-1.json
       ↓
 [BRAINSTORM_R2] 第 2 轮
            深度评估：security-engineer + compliance-analyst + evaluator
       ↓ (threshold 评估通过 / 2 轮)
 [DRAFT]  生成交底书初稿
            → MAIN.md（由 patent-disclosure-writer 产出）
       ↓
 [QA_LOOP] 审查-答辩循环
            reviewer 提问题 → technical-responder 写修订
            ≤ 6 轮，连续 2 轮无新 issue 则退出
       ↓
 [FINAL_REVIEW] 最终审查，决定通过或退回 QA_LOOP
       ↓
 [DIAGRAM] 自动渲染专利附图
            → figures/（SVG + PNG + 回写 MAIN.md）
       ↓
 [DONE]   质量闸门：quality-gate 检查 → 完成

           任意阶段崩溃后：读取 state.json 可精确定位断点
           我不满意某轮结果：path branch --from-node round-{N} 开新分支
           很久以前的创新点其实不错：path restore 复活它
```

## 架构

这个系统分为四层：

| 层 | 按照什么规则运转 | 关键文件 |
|---|---|---|
| **编排层** | 智能体/技能/命令的端口定义，一次定义，到处跑 | `plugin.jsonc`、`opencode.jsonc`、`.opencode/skills/` |
| **引擎层** | 路径追踪、状态机、图表渲染、阈值评估 | `src/core/` |
| **命令层** | 把引擎能力封装为统一的 CLI 命令 | `src/cli.ts`、`src/commands/` |
| **适配层** | 把编排层的定义自动转成 Claude Code / Codex 需要的格式 | `src/adapters/claude/`, `src/adapters/codex/` |

三层之间的数据流：

```
  plugin.jsonc（编排层定义）
           ↓
    [适配器] 自动生成
           ↓
  .claude/ (Claude Code)    <——一个文件，多处消费
  .codex/ (Codex)           <——
  AGENTS.md / CLAUDE.md
  codex.json
           ↓
  编辑器中的 AI 调用 11 个专业智能体
           ↓
  产出 → .brainstorm/ 决策路径记录
  产出 → state.json 工作流状态机
  产出 → references/ 标准命名文件
  产出 → MAIN.md + figures/

  CLI 命令 = 对 .brainstorm/ + .patent/ + references/ 的自动化操作
  TUI = 对 .brainstorm/ 的可视化浏览
```

## 目录结构

```
oh-my-patent/              # 核心仓库：配置与引擎，不存项目交付物
├── src/
│   ├── cli.ts             # CLI 入口
│   ├── core/
│   │   ├── brainstorm-path.ts    # 决策路径数据模型 + 分数阈值
│   │   ├── path-persistence.ts # 原子写入 + 回滚
│   │   ├── path-graph.ts       # 图结构 + 分叉算法
│   │   ├── diagram-renderer.ts # Mermaid/PlantUML → SVG/PNG
│   │   └── threshold-config.ts # 量化阈值模型
│   ├── commands/          # path init/record/overview/branch/restore...
│   ├── adapters/          # 零配置适配器
│   │   ├── claude/        # → .claude/ + CLAUDE.md
│   │   └── codex/         # → .codex/ + AGENTS.md + codex.json
│   └── tui/               # Ink+React 交互界面
├── plugin.jsonc
├── opencode.jsonc
└── dist/ (编译产物)

projects/{NN}-{topic_slug}/   # 每个专利 = 独立 Git 仓库
├── .brainstorm/
│   ├── path.json             # 元数据 + 边 + 当前节点 + 最终决策
│   ├── nodes/
│   │   └── round-{n}.json    # 评分、创新点、决策、时间戳
│   ├── snapshots/
│   │   └── round-{n}-innovations.json  # 创新点历史快照
│   └── branches/
│       └── {branchId}/       # 分支独立节点副本
├── .patent/
│   └── state.json            # 工作流阶段机：到 DRAFT 了？第 3 轮 QA？
├── references/
│   ├── landscape.md          # 检索结果
│   ├── brainstorm_round1_archimedes.md
│   ├── argue_round2_adversarial-examiner.md
│   └── ...                   # 所有产出都遵循命名规范
├── figures/
│   ├── 001-system-overview.png
│   ├── 001-system-overview.svg
│   └── figures-manifest.json # 版本管理
├── MAIN.md                   # 最终交底书（随时被 diagram 回写）
└── conversation.md           # 编年体对话记录
```

## 脚本速查

```bash
npm run build  # 编译 TypeScript → dist/
npm test       # 运行 vitest 测试
npm run lint   # tsc --noEmit 类型检查
```

---

## 致谢

特别感谢：

- **[LINUX DO 社区](https://linux.do/)** - 在开发过程中提供了宝贵的反馈和支持
- 所有帮助改进此项目的贡献者
- 开源社区提供的出色工具和库，使这个项目成为可能

---

## 许可证

MIT
