# oh-my-patent

[![npm version](https://img.shields.io/npm/v/oh-my-patent.svg)](https://www.npmjs.com/package/oh-my-patent)
[![npm downloads](https://img.shields.io/npm/dm/oh-my-patent.svg)](https://www.npmjs.com/package/oh-my-patent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![English](https://img.shields.io/badge/English-Switch-blue.svg)](./README.md)

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/brand/png/logo-on-dark.png">
  <img src="./assets/brand/png/logo-primary.png" width="720"
       alt="oh-my-patent — Archimedes（阿基米德）举起专利文档，惊呼 WOW!">
</picture>
</p>

**遇见 Archimedes（阿基米德），让灵光一现成为专利交底书。**

面向 **Claude Code、Codex、OpenCode** 的 AI 专利插件。
由 Archimedes 编排专业智能体，协同完成检索、构思、撰写、审查与附图生成，
并保留可追溯、可分叉的决策路径。

## 快速开始

在你的专利工作区运行以下命令。Setup 会写入编辑器配置；
用于已有工作区之前，请先查看[安装行为](./docs/usage.md#安装)。

```bash
npm install -g oh-my-patent
oh-my-patent adapt setup --workspace-dir .
```

在 AI 编程工具中打开这个工作区，加载生成的集成，然后输入：

```text
/archimedes
> 基于同态加密在隐私计算中的应用，新建一个专利项目。
```

使用 `--tool claude-code`、`--tool codex` 或 `--tool opencode` 可以只配置一个平台。
省略 `--tool` 时会配置全部三个平台。入口不可用时，请查看[平台说明](./docs/usage.md#平台说明)。

<details>
<summary>给协助安装的 AI 助手</summary>

确认用户的专利工作区，阅读上面的安装行为说明，然后运行：

```bash
npm install -g oh-my-patent
oh-my-patent adapt setup --workspace-dir .
oh-my-patent check --workspace-dir .
```

接着帮助用户加载集成，并通过 `/archimedes` 开始专利项目。

</details>

## 能做什么

| 能力 | 带来的价值 |
|---|---|
| 协调专业智能体 | 由主编排器组织检索、构思、可专利性评估、撰写、审查与技术答复 |
| 追溯决策过程 | 在 `.brainstorm/` 中保存轮次、评分、创新点快照与理由；从已记录节点分叉或恢复创新点 |
| 继续已有工作 | 从 `.patent/state.json` 读取阶段状态，结合 `references/` 中的智能体产出继续项目 |
| 生成专利附图 | 将 Mermaid 或 PlantUML 源码渲染为 SVG、PNG，并向 `MAIN.md` 插入附图引用 |
| 查看进度 | 提供 CLI 查询、Markdown 报告、终端界面和环境检查 |

交底书、支撑材料和决策历史保存在同一个项目目录中。
附图渲染引擎和检索服务需要各自的运行环境，详见[使用指南](./docs/usage.md)。

## 从构想到交底书

| 步骤 | 工作流阶段 |
|---|---|
| 准备与检索 | `INIT` → `RESEARCH` |
| 构思与评估 | `BRAINSTORM_R1` → `BRAINSTORM_R2` |
| 撰写与初稿附图 | `DRAFT` → `DIAGRAM_DRAFT` |
| 审查与修订 | `QA_LOOP` → `FINAL_REVIEW` |
| 更新附图并完成 | `DIAGRAM_FINAL` → `DONE` |

审查过程中可以回到前序阶段。[工作流说明](./docs/workflow-diagram.md)
列出允许的转换，并分别解释评分决策与阶段推进。

## 团队如何协作

| 模式 | 用途 |
|---|---|
| 主编排 | Archimedes 协调专业智能体，在各阶段之间传递项目上下文 |
| 对抗式头脑风暴 | 候选创新点先接受审查员视角的质疑，再进行筛选 |
| 并行评估 | 安全、合规和可专利性专家分别评估不同维度 |
| 审查与答复 | 审查者提出问题，技术答复者给出文档修改建议 |
| 决策记录 | 路径记录员保存每轮材料，支持比较、分叉与恢复 |

[智能体参考](./docs/agents.md) 列出已注册的 14 个智能体、6 项技能、9 个命令及其职责。
实际调度使用所选宿主提供的能力。

## 文档导航

| 接下来阅读 | 内容 |
|---|---|
| [使用指南与 CLI](./docs/usage.md) | 安装、平台差异、全部 CLI 命令域与卸载行为 |
| [工作流](./docs/workflow-diagram.md) | 十个阶段、审查回路与阈值行为 |
| [智能体与协作](./docs/agents.md) | 注册 ID、技能、命令和协作模式 |
| [架构与开发](./docs/architecture.md) | 四层架构、仓库目录、项目文件与开发命令 |
| [文档中心](./docs/README.md) | 中英文指南和设计参考 |
| [品牌规范](./assets/brand/README.md) | Archimedes 图形与使用规则 |

欢迎参与贡献，请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)，
或[提交问题](https://github.com/illusionaireal/oh-my-patent/issues)。
采用 [MIT 许可证](./LICENSE)。
