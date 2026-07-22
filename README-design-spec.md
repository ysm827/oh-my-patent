# oh-my-patent README 视觉重设计规格

## 一、设计方向：复古工程 / ACM 论文风

把开发者工具文档包装成一本“技术期刊”的封面与目录页，强调：
- **正式感**：专利本身就是严肃技术文档，视觉应匹配这种“学术权威性”。
- **可读性**：信息密度高但不压迫，留白 generous，层级清晰。
- **怀旧感**：像 1980s ACM proceedings / 老式工程手册，但保留现代 SaaS 落地页的信息结构。

## 二、受众与目标

- **受众**：AI 辅助开发者、独立发明者、技术团队里负责专利的人。
- **目标**：看一眼就知道“这是一个能把点子变成专利交底书的 CLI 工具”，并且能立刻复制安装命令开始用。

## 三、色彩系统

| Token | 用途 | Hex |
|-------|------|-----|
| `--paper` | 主背景、卡片底色 | `#F7F1E3` |
| `--paper-warm` | 次背景、强调区块 | `#F0E8D6` |
| `--ink` | 主文字、标题 | `#2B2016` |
| `--ink-muted` | 副文字、说明 | `#5C4A3D` |
| `--accent` | 主强调（CTA、链接、图注） | `#8B4513` 马鞍棕 |
| `--accent-warm` | 次强调（徽章、hover 状态） | `#A0522D` |
| `--code-bg` | 代码块背景 | `#EAE2CF` |
| `--code-border` | 代码块边框 | `#C4B8A5` |
| `--rule` | 分隔线 | `#C4B8A5` |
| `--highlight` | 高亮标记（阈值数字、强调词） | `#B8860B` 暗金 |

## 四、字体系统

| 层级 | 字体 | 字号 | 字重 | 备注 |
|------|------|------|------|------|
| 刊名 / 主标题 | `Tiempos Headline` / `Playfair Display` | 72px | 700 | 衬线大标题，居中 |
| 章节标题 | `Tiempos Text` / `Lora` | 40px | 700 | 衬线 |
| 小标题 | `Tiempos Text` / `Lora` | 24px | 600 | 衬线 |
| 正文 | `Source Serif Pro` / `Crimson Text` | 18px | 400 | 舒适阅读 |
| 代码 / 路径 | `SF Mono` / `JetBrains Mono` | 15px | 500 | 等宽 |
| 徽章 / 标签 | `Inter` | 13px | 600 | 全大写，letter-spacing 1.5px |

## 五、页面结构（共 7 个 Sections）

### 0. Header（刊头）
- 顶部一条细横线（`--rule`）。
- 横线上方左侧：小字 `VOL. 01 • 2026` + `PROJECT DOCUMENT`。
- 横线上方右侧：GitHub 徽章链接（npm / license / TypeScript 严格）。
- 横线下方居中：大标题 `oh-my-patent`，副标题为斜体衬线：*“Your idea → a full patent disclosure document.”*

### 1. Hero / 开篇语
- 中心一行超大字：
  > **“把技术点子，自动写成专利交底书。”**
- 其下一段短文：
  > 11 个专利专用 AI 智能体，一个 CLI 编排器。你只需说 `/archimedes`，它负责搜索、头脑风暴、可专利性评估、撰写、审查、生成附图。每步决策都被记录，可随时回退、分叉、复活旧想法。
- 一个代码块样式的安装卡片：
  ```bash
  npm install -g oh-my-patent
  oh-my-patent adapt setup --workspace-dir .
  ```
  卡片左侧加一条 `--accent` 竖条，像引用块或旧式终端窗口。
- 右侧或下方放一个“期刊插图”占位：抽象齿轮/卷轴/钢笔的线稿，表示“专利”与“机械精密”。

### 2. 痛点对比（Problem / Solution）
- 标题：`## 为什么专利写作总是这么痛苦？`
- 用 5 组左右对比的卡片：
  - 左侧：旧方式（浅灰文字、删除线效果）
  - 右侧：oh-my-patent 方式（粗体、带 `--accent` 前置小标）
- 5 组内容取 README 原表：10 个 AI 来回切 / 灵感丢失 / 画图手动 / 配置重复 / 机器崩溃 / 没有终点。

### 3. 核心特性 Bento 网格
- 标题：`## 它的核心能力`
- 8 张卡片，2×4 或 3×3 网格（根据宽度）：
  1. 🧠 头脑风暴决策路径追踪
  2. 🤖 11 智能体端到端流水线
  3. ⚡ `/archimedes` 一句话启动
  4. 🔗 零配置跨工具适配器
  5. 🛡️ 安全卸载（只删生成的文件）
  6. 📊 自动附图渲染（Mermaid/PlantUML）
  7. 🎯 量化阈值与 QA 循环
  8. 🔄 可恢复工作流状态机
- 每张卡片：小图标、衬线标题、一句正文、浅米色背景、细边框。

### 4. 工作流时间线
- 标题：`## 从想法到交底书：10 个阶段`
- 用竖向时间线，每个节点：
  - 圆圈编号（1-10）
  - 阶段名（如 `INIT`、`RESEARCH`、`BRAINSTORM_R1`）
  - 一句说明
  - 产出物（如 `projects/{NN}-{topic}/`、`references/landscape.md`）
- 关键分支用虚线箭头回到上游：
  - `QA_LOOP → DRAFT`（问题未解决）
  - `FINAL_REVIEW → QA_LOOP`（需修订）
  - 阈值未过 → `BRAINSTORM_R1`（强制迭代）

### 5. 11 Agent 网格
- 标题：`## 11 位专业智能体`
- 用 3×4 或 4×3 卡片网格，每张卡片：
  - 等宽 agent 名（如 `archimedes`）
  - 角色一句话
  - 调用阶段（小字，斜体）
- 可分组着色：
  - 编排：`archimedes`
  - 检索：`patent-landscape-analyst`
  - 头脑风暴：`innovation-architect`、`adversarial-examiner`、`brainstorm-moderator`、`path-recorder`
  - 评估：`security-engineer`、`compliance-analyst`、`patentability-evaluator`
  - 撰写/审查：`disclosure-writer`、`disclosure-reviewer`、`technical-responder`
  - 附图：`diagram-generator`

### 6. 安装与卸载（快速参考）
- 标题：`## 安装与卸载`
- 左侧：安装步骤，三段命令，带序号 ① ② ③。
- 右侧：卸载说明，强调“只删除我们生成的文件，不动你自定义的内容”。
- 底部一个 `TIP` 引用块：
  > 如果你不确定是否保留数据，先 `git status` 看一下。

### 7. Footer（刊尾）
- 顶部一条粗横线。
- 居中：项目名 + 一行小字：
  > `MIT Licensed • Crafted by zengbods • Acknowledgments: LINUX DO Community`
- 最底部一个装饰性小图标：老式钢笔尖线稿。

## 六、布局与网格

- 画布宽度：**1440px**，主内容区宽度 **960px**（居中），两侧大留白。
- Section 间距：160px 上下（Hero 与下一 section 可更紧凑 120px）。
- 卡片内边距：24px-32px。
- 网格 gutter：24px。
- 所有元素严格左对齐或居中对齐，避免混用。

## 七、装饰元素

- 细水平线：各 section 之间用 1px `--rule` 分隔。
- 小数字/罗马数字：用 `Ⅰ、Ⅱ、Ⅲ…` 标注章节，强化期刊感。
- 引用块：左侧 4px `--accent` 竖线，背景 `--paper-warm`。
- 代码块：等宽字体、浅背景、圆角 2px（保持复古，不过度圆角）。
- 页眉/页脚：可加入“页码”装饰，如 `— 1 —`。

## 八、可落地的下一步

1. 待 Ardot 适配器恢复后，按本规格上画布：先创建主页面（1440px 宽，纸色背景），再逐 section 用 `batch_edit` 搭建。
2. 或直接按本规格改写 `README.md`，把文字内容与视觉层级直接对应，即可在 GitHub 上呈现。
