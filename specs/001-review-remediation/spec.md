# 规格 001 · 审查发现问题的系统性修复

| 字段          | 值                                                                 |
| ----------- | ----------------------------------------------------------------- |
| **状态**      | ✅ **已确认（Ratified）** — 2026-09-15 人工确认；9 条决策按推荐方案执行 |
| **规格版本**    | 1.0.8（已冻结） |
| **创建日期**    | 2026-09-15                                                        |
| **目标仓库**    | GitHub `illusionaireal/oh-my-patent`（基线版本 v0.3.0）               |
| **当前 HEAD** | `4ddc279 docs(specs): record the PDCA-6 and PDCA-7 commit hashes`（PDCA-8 修订的基线） |
| **治理依据**    | [`CONSTITUTION.md`](../../CONSTITUTION.md) **v1.2.0**（本仓库适配版；PDCA-0 再适配 → v1.1.0，见 REQ-048 / DEC-9；PDCA-8 就规格落位再修订 → v1.2.0，见 REQ-047） |
| **输入来源**    | 见 §1.2 四份审查报告                                                     |
| **后续产物**    | `plan.md`（技术方案）、`tasks.md`（PDCA 任务清单）— 同目录，已产出 |

---

## 0. 文档定位

这是本仓库**第一次真实运行 spec 流程**。此前的 `docs/specs/**` 是 v0.1.0 的**事后补写快照**（自述状态「✅ 已发布 v0.1.0」），不参与任何构建或校验；`.specify/` 是**装了未跑**（无任何 `specs/###-*/spec.md` 产物）。

本规格遵循 `CONSTITUTION.md` 的四条硬约束：

- **原则 II（Evidence-Backed）**：每一条「现象」均附可复现的取证命令或实测结论，不接受推测。
- **原则 III（Human-Gated）**：本规格**必须经人工确认**后才进入执行；执行中变更范围需回到本文件修订版本号。
- **原则 IV（Security by Default）**：本次修复本身不得引入新的凭据落盘、本机路径写入或产物不可复现。
- **原则 V（Deterministic Naming and Reproducibility）**：生成产物必须跨重跑稳定复现；变更须留迁移说明。§3.1 的 REQ-001 / REQ-013 / REQ-014 直接以此为依据（原稿漏引，本版补入）。

> ⚠️ **本文件自身的书写约定**（为让 §4 GAC-3 与 REQ-014 的验收 grep 可通过；**PDCA-2 后全仓库已无例外，实测 0 处**）：
>
> - 本规格文档**不记录任何本机绝对路径**。出现上游父工作区时统一以 `<upstream-workspace>` 占位，
>   本机用户目录以 `<user-home>` 占位，本机工作副本路径**不记录**（因机器而异，不构成规范性标识）。
> - 「目标仓库」以 GitHub 仓库名 `illusionaireal/oh-my-patent` 为**规范标识**（见文件头字段表）。
> - GAC-3 约束的是**工作树**，不是 git 历史。`plugins/` 产物中已写入历史的 5 条本机路径，
>   本规格**不承诺清除**（不做历史改写）；如需彻底抹除，应另立规格并评估改写历史的风险。
>   PDCA-1（DEC-1）已将 `plugins/` 移出版本控制，故这些路径**已不在工作树中**，但其
>   **git 历史仍在**——两者不是同一件事，验收时不要混为一谈。

---

## 1. 背景与问题陈述

### 1.1 背景

仓库于 2026-09-14~15 经历了一轮完整审查：232 个受版本控制文件全量通读、逐条取证。审查发现的问题集中在三条断裂带上：

1. **产物治理断裂**：`plugins/` 是**已提交的生成产物**，但输入源（`opencode.jsonc`、`.opencode/`）**从未入库**，产物自 `86d0eb3`（2026-06-16，v0.1.0）后再未重跑 —— 历经 0.2.1 / 0.3.0 三次发版。
2. **文档—现实断裂**：`docs/specs/**`、`docs/specs/README.md`、`CONTRIBUTING.md`、`README*` 中存在对不存在能力的承诺（CI 检查、覆盖率门禁、原子写入、decision DAG）。
3. **提示—代码断裂**：`src/skills/**/SKILL.md`、`src/agents/*.md` 中的示例代码与数据结构，与 `src/` 下的真实实现不一致，会误导 AI 代理产出错误调用。

### 1.2 输入来源（问题清单的权威出处）

| 报告              | 位置                                                    | 内容                           | 是否入库                   |
| --------------- | ----------------------------------------------------- | ---------------------------- | ---------------------- |
| 主审查报告           | `.audit-reports/code-review-2026-09-14.md`            | 232 文件全量通读，48 + 9 = **57 项** | ❌ 被 `.gitignore:32` 忽略 |
| 复审附录            | `.audit-reports/review-addendum-2026-09-15.md`        | 5 项外部反馈逐条实测裁决 + N1–N6        | ❌ 同上                   |
| CONTRIBUTING 审计 | `.audit-reports/contributing-audit-2026-09-15.md`     | 22 项不一致（已修 22，根因项待处理）        | ❌ 同上                   |
| spec 评估         | `.audit-reports/spec-coding-assessment-2026-09-15.md` | spec coding 判定 + 6 条建议       | ❌ 同上                   |

> **可追溯性说明**：上述四份报告的原文不在版本控制内（按 `.gitignore:32` 有意如此 —— 它们是过程产物）。本规格以**自包含**方式重述每一条纳入范围的问题，执行者无需访问这四份文件。报告原文仅作为取证溯源。

### 1.3 问题陈述（一句话）

> 仓库的核心功能（CLI、适配器、状态机、路径系统）经实测是健康的 —— `npx tsc` 0 错误、`npm test` 132/132 通过、运行时依赖仅 `ink` + `react`。**但它的"对外可见面"（生成产物、文档、提示词、CI 门禁）与真实实现之间存在系统性偏离，且这些偏离是同一个反模式（输入源不入库 + 产物入库 + 文档不随代码演进）的多种表现。**

### 1.4 目标

| #   | 目标                            | 可度量判据                                      |
| --- | ----------------------------- | ------------------------------------------ |
| G-1 | 消除会**导致运行失败或静默错误**的缺陷         | §4 P0 全部 REQ 通过验收                          |
| G-2 | 消除**文档/提示与实现不一致**导致的误导        | §4 P1 中文档类 REQ 通过验收                        |
| G-3 | 让生成产物**可复现、可验证、可防漂移**         | 全新克隆上重跑生成器，输出与门禁一致                         |
| G-4 | 把真实存在的工程能力**如实写入文档**，不新增假承诺   | 每条"CI 强制"声明须能在 `.github/workflows/` 找到对应实现 |
| G-5 | 交付一套可复用的修复方法论（PDCA 记录 + 经验沉淀） | §7 框架落地，沉淀文归档                              |

### 1.5 非目标（明确不做）

- ❌ 不做架构重写。O1–O8 架构级观察（两套渲染层、三处 JSONC 解析、阶段列表多处硬编码等）**仅在其中产生功能性缺陷时才纳入**，纯重构不纳入本次。
- ❌ 不改变产品的对外契约：`plugin.jsonc` 的 agent/command/skill **id 与数量不变**，CLI 子命令不变。
- ❌ 不引入新的运行时依赖。
- ❌ 不触碰上游工作区 `<upstream-workspace>`（悬空 gitlink、无远端备份等）—— 那属于另一仓库范围。
- ❌ 不重写 `docs/specs/**` 的 v0.1.0 快照内容（仅加历史声明，见 REQ-033）。

---

## 2. 范围界定

### 2.1 纳入范围

共 **52 条修复需求（REQ）**，分为三个优先级：

| 优先级            | 数量 | 编号区间          | 定义                             | 完成要求                     |
| -------------- | -- | ------------- | ------------------------------ | ------------------------ |
| **P0 阻断类**     | 17 | REQ-001 ~ 014、049、050、052 | 会导致命令失败、运行时崩溃、静默错误、安全泄露或产物不可复现 | 本次必须全部完成                 |
| **P1 一致性与健壮性** | 22 | REQ-015 ~ 035、051 | 文档/提示与实现不一致、边界未处理、跨平台缺陷        | 本次必须全部完成                 |
| **P2 技术债与优化** | 13 | REQ-036 ~ 048 | 可维护性、性能、风格、防复发加固 | 本次完成；若在 DEC 中被判定延后，须记录理由 |

### 2.2 排除范围

| 排除项                                               | 理由                                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| O1 合并两套渲染层（`render.ts` / `path-visualization.ts`） | 纯重构，无功能性缺陷驱动；风险大于收益                                                          |
| O7 引入统一日志抽象 / O8 错误类型体系                           | 架构级，超出"修复"范畴，应另立规格                                                           |
| D16 把 4 份根级阶段性文档移入 `docs/archive/`                | 涉及仓库顶层结构变动，需单独决策；本次仅在文档中标注其性质                                                |
| D22 `docs/images/` 中英混排命名                         | 重命名会破坏外部引用链接，收益低                                                             |
| `<upstream-workspace>` 工作区的一切问题（悬空 gitlink、无远端）             | 跨仓库范围                                                                        |
| `plugins/` **git 历史**中已存在的本机路径（提交层面） | 清除需改写历史，风险与收益不成比例；本次仅清理**工作树**，并在 §0 中明确该边界 |
| `npm audit` 7 项 dev 链漏洞的**根治**                    | 依赖上游 vitest/vite 链；本次仅执行 `npm audit fix` 并在文档中声明「dev-only，消费者零风险」（见 REQ-045） |

### 2.3 前置已完成项（避免重复劳动）

以下问题**已在提交 `08280ad` / `2aacbaf`（2026-09-15）中修复**，本次不重复：

| 已修项                                                         | 提交        |
| ----------------------------------------------------------- | --------- |
| 新建 `CONSTITUTION.md`（仓库级宪章，6 处适配）                           | `08280ad` |
| `README.md:377` 的测试数 `123` → `132`                          | `08280ad` |
| `CONTRIBUTING.md` 22 项对齐（发布流程、虚假 CI 声明、法域指引、`plugins/` 章节等） | `2aacbaf` |
| `AGENTS.md` 安全条款增加 Principle IV 交叉引用                        | `08280ad` |

> ⚠️ **注意**：`CONTRIBUTING.md` 中的 22 项虽已修，但其中**两项的根因仍在代码/CI 层**，故保留为本规格的 REQ：
>
> - H2「PR 不跑自动化检查」→ 根因是 CI 无 `pull_request` 触发器 → **REQ-046**
> - H4「`plugins/` 重跑是破坏性的」→ 根因是产物不可复现 + 无 `--prune` → **REQ-013 / REQ-014**

### 2.4 决策记录（已确认 2026-09-15）

2026-09-15 **已确认**：以下 9 条决策全部按**推荐方案**执行。若某条在对应 PDCA 循环启动前需要变更，须回到本文件修订版本号后再执行（C-7）。

| ID        | 决策点                                                                        | 推荐方案                                                                                                                        | 备选                                                                | 影响                                |
| --------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| **DEC-1** | `plugins/` 生成产物的去留                                                         | **A. 移出版本控制**：`git rm -r --cached plugins/` + `.gitignore` 加 `plugins/`；若需展示生成结果，改由 CI 在**占位符配置**下生成到 `examples/generated/` | B. 保留 `plugins/` 但占位符化路径 + CI 漂移门禁；C. 彻底删除                        | 🔴 高 — 决定 REQ-013 / REQ-014 的实现方式 |
| **DEC-2** | `tsconfig.json` 的 `moduleResolution`                                       | **改为 `NodeNext`**（与源码显式 `.js` 导入语义一致，且 `tsc` 会真正校验导入可解析）。**执行时须先实测**：若引入编译错误则保留 `bundler` 并在规格中记录原因                         | 保持 `bundler`，仅加注释说明                                               | 🟡 中                              |
| **DEC-3** | `router.ts` 返回 `EP`/`JP` 与 `VALID_JURISDICTIONS` 互斥                        | **A. 收敛**：`extractJurisdiction()` 只返回受支持集合；对 EP/JP 明确降级为 `PCT` 或返回「暂不支持」提示                                                  | B. 扩展：把 EP/JP 加入 `VALID_JURISDICTIONS` 并补齐 `jurisdiction.ts` 规则数据 | 🟠 中高 — B 成本显著更高                  |
| **DEC-4** | CI 是否新增 `pull_request` 触发器                                                 | **新增**。这是 H2 的根因修复，且能让 `CONTRIBUTING.md` 的「PR 会跑检查」从**虚假声明变为真实**                                                            | 不新增，维持"本地自测"模式                                                    | 🟠 中高                             |
| **DEC-5** | 项目特定代理提示（`patent-security-engineer` / `patent-product-compliance-analyst`） | **加泛化章节**：在提示内新增「适用范围与泛化指引」，声明领域假设，避免非 HSM 选题跑题。不重写                                                                         | 重写为通用提示                                                           | 🟡 中                              |
| **DEC-6** | 版本号单一来源                                                                    | **`package.json` 为唯一来源**；`plugin.jsonc` 的 `version` 由 loader 从 `package.json` 读（或由脚本同步）；生成物随之一致                             | 保持三处手写 + CI 漂移检查                                                  | 🟡 中                              |
| **DEC-7** | 本规格文档是否入库                                                                  | **入库**（`specs/` 未被 `.gitignore` 忽略，实测 `git status` 显示 `?? specs/`）。理由：规格是治理产物，符合「规则随代码走」                                    | 放入被忽略的 `.audit-reports/`（作为过程文档）                                  | 🟡 中                              |
| **DEC-8** | 规格文档的规范落位与相关文档对齐 | **A. 确立根级 `specs/` 为规格唯一规范位置**（`specs/###-{slug}/`，与 Spec Kit 约定一致），并按 REQ-047 同步 `CONTRIBUTING.md` / `docs/README.md` / `CONSTITUTION.md`；旧 `docs/specs/**` 保留原位并标注为 v0.1.0 历史快照 | B. 以 `docs/specs/` 为规范位置，根级 `specs/` 迁入其下 | 🟡 中 — 决定 REQ-047 的实现方式 |
| **DEC-9** | `CONSTITUTION.md` 的适用域与元数据再适配 | **A. 引入适用域标注 + 元数据修正**：①区分「本仓库内部布局」与「产品运行时契约」；②补 `Adopted: 2026-09-15`、修正 `Last Amended`、按自身策略升版（**执行时判定为 MINOR → 1.1.0**：往原则 IV 的管辖集合里加入本机路径属 Governance 定义的「实质扩权」，非 PATCH 级澄清）；③把 local paths 正式写入原则 IV 正文（对齐 `AGENTS.md:37`）；④在本规格 §0 补引原则 V。执行位置单列为 **PDCA-0（治理先行）** | B. 只改元数据日期、不动适用域（低风险，但留下"条款指向不存在的目录"的错位）；C. 废弃本仓库宪章、改为引用上游 `.specify/memory/constitution.md`（引入跨仓库依赖，不推荐） | 🟠 中高 — 宪章是本次全部 REQ 的治理依据，且被 §0 与 4 处文档引用 |



---

## 3. 需求规格

**字段定义**：每条 REQ 含【现象】【根因】【修复目标】【影响范围】【验收标准】【关联 ID】。

---


### 3.1 P0 阻断类（16 条）

---

#### REQ-001｜建立 MCP 定义的单一事实来源

- **现象**：`package.json` 的 `files[]` 第 4 项声明 `opencode.jsonc`，但根目录**无此文件**（实测 `ls opencode.jsonc` → No such file）。它是 `src/adapters/loader.ts` 中 `loadMCPServers()` 读取 MCP 定义的**唯一来源**，读不到即 `return []`。
- **根因**：输入源从未入库。真实来源是作者本机 `<upstream-workspace>\opencode.jsonc`（2162 B），内含 5 处 `<upstream-workspace>\.mcp\servers\...` 硬编码路径。`loader.ts` 的 `loadMCPServers()` 用 `existsSync` 判断，缺失时静默返回空数组。
- **修复目标**：在仓库内建立**可提交、可复现、零本机路径**的 MCP 定义源。
- **影响范围**：`package.json` `files[]`；`src/adapters/loader.ts`；新增 `opencode.jsonc.example`；`README.zh-CN.md`（2 处引用）；`docs/RETRIEVAL_SPEC.md`（1 处引用）；三个适配器的 MCP 生成结果。
- **验收标准**：
  1. 存在 `opencode.jsonc.example`，含 8 个 server 条目。
  2. `grep -c -E '[A-Za-z]:[\\/]' opencode.jsonc.example` 结果**为 0**（无任何盘符字面量）。
  3. `loader.ts` 在 `opencode.jsonc` 缺失时回退读取 `.example`，行为有测试覆盖。
  4. 全新克隆上 `node dist/cli.js adapt generate --output <临时目录>` 后，`.claude/settings.json` 的 `mcpServers` **为 8 项**（当前实测为 `{}`，0 项）。
  5. `npm pack --dry-run` 清单含 `opencode.jsonc.example`，不含 `opencode.jsonc`。
- **关联 ID**：A1、2.4、G6（输入源部分）；治理依据：`CONSTITUTION.md` 原则 V
- **优先级**：P0

---

#### REQ-002｜补齐可复现所需的代理定义输入源

- **现象**：`src/adapters/loader.ts` 的 `loadAgents()` 以 `resolve(pluginDir, '..', '.opencode', 'agent')` 为代理定义的**权威来源**（优先于 `plugin.jsonc`），但该路径在本仓库**不存在**（实测）。`readdirSync` 会抛异常。
- **根因**：`.opencode/agent/`（作者本机 12 个 `.md`）同样从未入库；与 REQ-001 同一反模式。
- **修复目标**：要么让权威来源在仓库内存在，要么显式降级为 `plugin.jsonc` 并记录该降级。
- **影响范围**：`src/adapters/loader.ts` `loadAgents()`；可能的 `src/agents/*.md`（作为回退源）。
- **验收标准**：
  1. 在**全新克隆**（无 `.opencode/`）上执行 `adapt generate` **不抛异常**，且产出的 agent 数量 = `plugin.jsonc` 声明的 14 个。
  2. `loadAgents()` 的目录缺失分支有显式处理（`existsSync` 或 try/catch）与注释说明，并有测试覆盖该分支。
  3. 决定「是否入库 `.opencode/agent/`」并在此记录结论（若选择不入库，则 `plugin.jsonc` + `src/agents/*.md` 必须被明确声明为权威源）。
- **关联 ID**：A9、2.4（第 3 点）
- **优先级**：P0

---

#### REQ-003｜修复 `rerender()` 的恒真判定与丢失的失败信息

- **现象**：`src/core/diagram-renderer.ts` 的 `rerender()` 回写 manifest 时构造：`success: e.figureId === figureId ? true : true` —— **三元表达式两个分支都是 `true`**。后果：重渲染后**所有历史条目都被标记为成功**，`diagram status` 显示"全部成功"，掩盖真实失败；且回写结构丢弃了 `error` 信息。
- **根因**：期望语义应是「只更新本次重渲染的条目为 `result.success`，其余保持原值」，被误写为无意义重言式。
- **修复目标**：重渲染只更新目标条目，其余条目保留原有 `success` / `error`；`ManifestEntry` 需持久化 `success` 与 `error` 字段。
- **影响范围**：`src/core/diagram-renderer.ts`（`rerender`、`writeManifest`、`readManifest`）；`src/core/diagram-types.ts`（`ManifestEntry`）；`tests/unit/diagram-renderer.test.ts`。
- **验收标准**：
  1. 构造含 2 图的 manifest，其中图 A `success:false, error:'boom'`、图 B `success:true`；仅对图 B 重渲染后：A 仍为 `success:false, error:'boom'`，B 按其真实结果更新。
  2. 新增单测断言上述 round-trip，且该测试在修复前**必然失败**（回归保护）。
  3. `ManifestEntry` 类型含 `success: boolean` 与 `error?: string`，并在写盘/读盘两侧完整保留。
- **关联 ID**：R2、T3
- **优先级**：P0

---

#### REQ-004｜修复 ESM 模块中的 `require()`

- **现象**：`src/core/diagram-renderer.ts` 的 `encodePlantUML()` 内调用 `require('zlib')` —— 这是**全仓库唯一的 `require`**。项目 `"type": "module"` 且由 Node 原生运行（`bin: dist/cli.js`，无打包器），ESM 作用域内 `require` 不存在。
- **根因**：从 CJS 习惯迁移到 ESM 时未替换。
- **修复目标**：改为顶层 ESM 导入。
- **影响范围**：`src/core/diagram-renderer.ts`。
- **验收标准**：
  1. `grep -rn "require(" src/ --include=*.ts | grep -v "^.*://"` 结果**为空**。
  2. `renderPlantUML()` 有单测覆盖并实际执行到 `encodePlantUML()` 路径（当前测试可能未触达该分支）。
  3. `npx tsc` 0 错误。
- **关联 ID**：R1
- **优先级**：P0

---

#### REQ-005｜修复 `landscape-schema` 的静默空值

- **现象**：`src/core/landscape-schema.ts` 中 `citationCount`、`authors`、`applicant`、`ipcCodes` **在类型中声明但从未被 `parseLandscape()` 解析**。实测影响：`statistics.totalCitations` 恒为 `0`；下游引用这些字段的分析得到空值且**不报错**。
- **根因**：类型先于解析实现定义，解析函数未跟进。
- **修复目标**：二选一并保持自洽 ——（A）补齐解析逻辑；（B）从类型中删除字段。**推荐 A**，并补测试断言。
- **影响范围**：`src/core/landscape-schema.ts`；`tests/unit/core/landscape-schema.test.ts`。
- **验收标准**：
  1. 给定含引用数的样本输入，`parsed.entries[0].citationCount` 为正确数值，`statistics.totalCitations` ≠ 0。
  2. 新增测试断言 `citationCount` / `authors` / `applicant` / `ipcCodes`（当前测试**恰好绕过了这四个字段**）。
  3. 若选择方案 B，则四处字段从类型中移除且所有引用点已清理，`npx tsc` 0 错误。
- **关联 ID**：R9、R10、T2
- **优先级**：P0

---

#### REQ-006｜修复 Codex 适配器的路径计算不一致（卸载残留）

- **现象**：`src/adapters/codex/index.ts` 的 `generate()` 在 command 与某个 agent 同 id 时用 `${command.id}-command`（`archimedes` 命中）；而 `getGeneratedFilePaths()` 始终用 `command.id`。两者不一致。
- **根因**：同一业务规则在两处独立实现，产生分叉。
- **修复目标**：提取单一方法（如 `commandSkillId(def, command)`），两处共用。
- **影响范围**：`src/adapters/codex/index.ts`；`tests/unit/codex-adapter.test.ts`。
- **验收标准**：
  1. `generate()` 产出的 command skill 路径集合，与 `getGeneratedFilePaths()` 返回的路径集合**完全相等**（有测试断言集合相等，而非逐项包含）。
  2. 新增测试：对 `archimedes` 这类 id 冲突场景，断言两函数结果一致。
- **关联 ID**：A1(codex)、N5
- **优先级**：P0

---

#### REQ-007｜修复 `--output` 时多适配器互相覆盖

- **现象**：`src/cli.ts` 的 `adaptGenerate()` 中 `const targetDir = outputDir || resolve(pluginDir, 'plugins', name)` —— 一旦传 `--output`，三个适配器**都写进同一目录**，根级文件（`AGENTS.md`、`CLAUDE.md`、`codex.json`）互相覆盖。实测：三个适配器均打印 `"output":"<tmp>/omp-gen-test"`（原输出为盘符字面量，按 §0 书写约定脱敏），产出合并为一棵树。
- **根因**：`--output` 分支缺少按工具名分子目录的逻辑。
- **修复目标**：`targetDir = outputDir ? join(outputDir, name) : resolve(pluginDir, 'plugins', name)`。
- **影响范围**：`src/cli.ts`；`tests/integration/cli-commands.test.ts`。
- **验收标准**：
  1. `adapt generate --output <dir>` 后，`<dir>` 下出现**三个独立子目录**（`claude-code/`、`codex/`、`opencode/`），各自含本工具产物，无跨工具文件混入。
  2. 新增集成测试断言该目录结构。
- **关联 ID**：N1、G8
- **优先级**：P0

---

#### REQ-008｜修复 `adapt install` 的默认安装位置

- **现象**：`adapt install` / `adapt setup` 的默认 `workspaceDir = resolve(pluginDir, '..')`。全局 `npm i -g` 后 `getPluginDir()` 返回包所在目录（`.../node_modules/oh-my-patent`），默认工作区变成 `.../node_modules` —— **文件会写进 `node_modules`**。README 靠"总是显式传 `--workspace-dir .`"绕过。
- **根因**：默认值取自包安装位置，而非用户当前工作目录。另 `getPluginDir()` 的注释称 "Published npm tarball → cwd is the package root"，与实际实现（基于 `import.meta.url`）不符。
- **修复目标**：默认改为 `process.cwd()`；同步修正 `getPluginDir()` 的错误注释。
- **影响范围**：`src/cli.ts`（`adaptInstall`、`getDefaultWorkspaceDir`、`getPluginDir`）。
- **验收标准**：
  1. 在任意目录执行 `oh-my-patent adapt install`（不带 `--workspace-dir`），文件写入**当前工作目录**而非 `node_modules`。
  2. `getPluginDir()` 的注释与实际实现一致。
  3. 有测试覆盖默认值解析。
- **关联 ID**：N2
- **优先级**：P0

---

#### REQ-009｜消除 MCP API Key 明文落盘

- **现象**：`src/core/init-checker.ts` 的 `writeMcpConfig()` 把 MCP API Key（如智慧芽 `apikey=sk-xxx`）**明文写入** `codex.json` 与 `.claude/settings.json`。这两个文件位于工作区根目录，**通常会被提交到 Git**。CLI 仅在**打印时**掩码 —— 磁盘上是明文。
- **根因**：掩码只作用于终端输出，未作用于持久化；且未调用方角度提示风险。
- **修复目标**：三层防护 ——（1）写入后 `chmod 0o600`；（2）打印显著警告；（3）把这两个文件加入初始化时生成的 `.gitignore` 模板。若成本允许，支持 `${ENV_VAR}` 环境变量引用形式。
- **影响范围**：`src/core/init-checker.ts`；`src/cli.ts`（打印处）；`README*` 与 `src/agents/patent-init-sentinel.md`（文档警告）；`tests/unit/init-checker.test.ts`。
- **验收标准**：
  1. `writeMcpConfig()` 写入后对目标文件执行权限收紧（非 Windows 上 `stat` 显示 `0o600`）。
  2. 写盘路径上输出明确的明文警告文案（含"确保该文件已被 gitignore"）。
  3. `patent-init-sentinel.md` 与 README 含对应警告段落。
  4. 若实现环境变量引用，则 `"apikey": "${PATSNAP_MCP_KEY}"` 形式被正确写出，且未设置该变量时给出可读提示（而非静默失效）。
- **关联 ID**：S1、R47
- **优先级**：P0

---

#### REQ-010｜修复 `install-post-commit` 脚本的失效引用

- **现象**：`scripts/hooks/install-post-commit.sh`（第 83–89 行）与 `.ps1`（第 95–101 行）都引用 `scripts/hooks/post-commit.js`，但该文件**在整个仓库不存在**（`git ls-files` 与文件系统双重确认）。两者都会在复制前检查源文件并 `exit 1` → **安装脚本 100% 失败**。`.ps1` 另引用 `install-parent-hook.ps1`、`scripts/sync-oh-my-patent.ps1`，**同样不存在**。
- **根因**：脚本从父工作区移植时未携带依赖文件；或 `post-commit.js` 被 `.gitignore` 的 `*.js` 规则（第 3 行）静默排除（该规则会忽略任何 `.js`，包括 `scripts/` 下的）。
- **修复目标**：**二选一**并保持两个脚本一致 ——（A）真正实现 `post-commit.js`；（B）删除这两个安装脚本及文档引用。**推荐 B**（该 hook 的自动提交/同步语义与 `CONSTITUTION.md` 原则 III「Human-Gated」冲突，且无用户需求证据）。**PDCA-2 已选定并执行 B** —— `scripts/` 整目录移除，全仓库无残留引用。
- **影响范围**：`scripts/hooks/install-post-commit.sh`、`.ps1`；可能的 `scripts/hooks/post-commit.js`；任何文档中的引用。
- **验收标准**：
  1. 若选 A：两个安装脚本在干净环境执行**成功退出 0**，且 `post-commit.js` 被 git 跟踪（需确认不受 `*.js` 规则影响，或规则收窄）。
  2. 若选 B：`scripts/` 目录被移除，全仓库无指向这两个脚本的文档引用。
  3. 无论哪条路径，`.ps1` 中对不存在文件的引用被一并清理。
- **关联 ID**：C1、C2、A5
- **优先级**：P0

---

#### REQ-011｜重写 `jurisdiction` SKILL.md 的失效示例

- **现象**：`src/skills/jurisdiction/SKILL.md` 的示例代码**全部无法运行**：① 导入路径与真实文件层级不符；② `cnRules.timeline.minMonths` —— 实际是 `defaultTimeline: number`，**无 `timeline` 对象**；③ `cnRules.claimFormat.separator` —— `claimFormat` 由独立函数 `getClaimFormat()` 返回，且字段名是 `independentClaimTemplate`；④ `isValidJurisdiction()`、`getClaimTemplate()` **两个函数根本不存在**。
- **根因**：SKILL.md 与 `jurisdiction.ts` 各自独立演进；SKILL.md 写的是设想的 API。
- **修复目标**：以 `jurisdiction.ts` 的**实际导出**为准重写全部示例，并修正时间线数值不一致（SKILL.md 写 US "18-48 months"，`.ts` 是 `24-48`；PCT 写 "16-30"，`.ts` 是 `12-30`）。
- **影响范围**：`src/skills/jurisdiction/SKILL.md`；如有必要，`src/skills/jurisdiction.ts`。
- **验收标准**：
  1. SKILL.md 中每个示例引用的符号（函数名、字段名、路径）均能在 `jurisdiction.ts` 中找到对应导出（逐个人工核对并在 PR 中列出映射）。
  2. 时间线数值与 `.ts` 中的常量**逐项一致**。
  3. 若可执行，示例代码片段能被 `node --input-type=module -e` 实际跑通（至少导入与调用不抛错）。
- **关联 ID**：D2、D3
- **优先级**：P0

---

#### REQ-012｜修正提示文件中的工作流阶段列表

- **现象**：多处提示/生成文本中的工作流状态机**遗漏 `DIAGRAM_DRAFT` / `DIAGRAM_FINAL`**：`src/commands/archimedes.md` 的输出示例、`src/adapters/codex/index.ts` 的 `generateAgentsMd()`、`src/adapters/claude/index.ts` 的 `generateClaudeMd()`。真实状态机是 **10 阶段**（含 2 个 DIAGRAM 阶段），提示中是 8 阶段。
- **根因**：`DIAGRAM_DRAFT`/`DIAGRAM_FINAL` 于 2026-06 加入状态机（`task_plan.md` Phase 4），但提示文本未同步。
- **修复目标**：所有阶段列表与 `src/core/workflow.ts` 的 `WorkflowStage` 枚举**完全一致**。
- **影响范围**：`src/commands/archimedes.md`；`src/adapters/codex/index.ts`；`src/adapters/claude/index.ts`；相关测试。
- **验收标准**：
  1. 全仓库中出现的阶段序列字符串，与 `WorkflowStage` 枚举逐项比对一致（新增一个测试或脚本做机械校验）。
  2. `archimedes.md` / 生成的 `AGENTS.md` / `CLAUDE.md` 三处均含全部 10 阶段。
- **关联 ID**：D1、A14、A18、O4
- **优先级**：P0

---

#### REQ-013｜让生成产物可复现（核心根因）

- **现象**：`plugins/` 是**已提交的生成产物**，但输入源从未入库；全新克隆上重跑生成器，`.claude/settings.json` 产出 `{"mcpServers": {}}` —— **比现状更差**（实测）。`generate()` **只写不删**；`adapt uninstall` 的删除清单按当前 `def.agents` 反推，导致 5 个历史遗留文件**不被任何命令清除**。
- **根因**：产物入库 + 输入源不入库 + 生成器无 prune 能力。这三者构成完整反模式。
- **修复目标**：让「全新克隆 → 重跑生成器 → 得到与仓库一致且正确的产物」这条链路成立；并让"不再产出的文件"能被自动清理。
- **影响范围**：`src/adapters/codex/index.ts`、`src/adapters/claude/index.ts`、`src/adapters/opencode/index.ts`（返回完整产物清单）；`src/cli.ts`（`adaptInstall` 增加 `--prune`）；`plugins/` 的处置（依赖 **DEC-1**）。
- **验收标准**：
  1. 在**不含任何生成产物的干净受控树**（`git worktree` 或从 index 导出）上执行 `npm run build && node dist/cli.js adapt generate --output <tmp>`，三个适配器的产物必须完整且可移植：`.claude/settings.json` 与 `codex.json` 的 `mcpServers` 各 **8 项**、agent 各 **14 个**、`.claude/commands` **9 个**，且产物内**零本机绝对路径**。（原措辞为「与仓库中逐字节一致；或与 CI 生成物一致」—— 按 DEC-1 产物已移出版本控制，仓库侧已无可比对对象，CI 也不产出该产物，该表述不可判定，故改为上述可执行判据。）
  2. `adapt install --prune` 能删除目标目录中**不再由当前定义产出**的文件（用 5 个遗留 agent 做验证：执行后目录内 agent 数 = 14）。
  3. 上述行为有集成测试覆盖。
- **关联 ID**：G1、G2、N5、P1、P2；治理依据：`CONSTITUTION.md` 原则 V
- **优先级**：P0

---

#### REQ-014｜清除产物中的本机绝对路径

- **现象**：**3 个文件、各 8 个 MCP server、其中 5 个**写死 `<upstream-workspace>\.mcp\servers\...`：`plugins/claude-code/.claude/settings.json`、`plugins/codex/codex.json`、`plugins/codex/plugins/oh-my-patent/codex.json`（后两份**字节级相同**）。受影响：`google_scholar`、`uspto_patent`、`mcp_scholarly`、`semantic_scholar`、`mcp_server_office`；另 3 个（`sequential_thinking`、`context7`、`eslint`）用 `npx`，可移植。
- **实测清单**（2026-09-15，HEAD `2aacbaf`，命令见验收标准 1；**按匹配处数**统计，非行数）：

  | 文件                                                     | 处数 | 性质                              |
  | ------------------------------------------------------ | -- | ------------------------------- |
  | `plugins/claude-code/.claude/settings.json`            | 5  | JSON 产物（路径为**双反斜杠**转义）           |
  | `plugins/codex/codex.json`                             | 7  | JSON 产物（其中 2 处在内嵌的 archimedes 提示里） |
  | `plugins/codex/plugins/oh-my-patent/codex.json`        | 7  | 与上一份**字节级相同**                    |
  | `plugins/claude-code/.claude/agents/archimedes.md`     | 2  | 生成副本                            |
  | `plugins/codex/.codex/agents/archimedes.md`            | 2  | 生成副本                            |
  | `plugins/codex/plugins/oh-my-patent/skills/archimedes/SKILL.md` | 2 | 生成副本                     |
  | `src/agents/archimedes.md`                             | 2  | **源头**（必须先改，否则重跑生成器又会复制回去）        |
  | ~~`scripts/hooks/install-post-commit.ps1`~~（PDCA-2 已删除） | 1  | 已随 REQ-010 方案 B 移除，**不再构成例外** |
  | **合计**                                                 | **28** | 8 个文件；**PDCA-2 后 28 处全部清零**（27 处改写 + 1 处随文件删除） |
- **根因**：产物是作者本机环境的快照（`<upstream-workspace>\opencode.jsonc` → `loader.ts` → `generateSettings()` → 落盘入库）。**未泄露凭据**（`env` 值全为空串），泄露的是目录结构与 MCP 部署方式。
- **修复目标**：仓库内**零本机路径**。
- **影响范围**：①**源头**：`src/agents/archimedes.md`（D10 —— 提示正文写死上游工作区路径，`adapt generate` 会把它复制进 3 份生成副本，**必须先改源头**，否则改完产物下次重跑又会回来）；②产物：`plugins/claude-code/.claude/agents/archimedes.md`、`plugins/codex/.codex/agents/archimedes.md`、`plugins/codex/plugins/oh-my-patent/skills/archimedes/SKILL.md`，以及写死 `.mcp\servers\` 路径的 `plugins/claude-code/.claude/settings.json`、`plugins/codex/codex.json`、`plugins/codex/plugins/oh-my-patent/codex.json`；③`plugins/` 的处置（**DEC-1**）；与 REQ-001 联动。
- **验收标准**：
  1. `git grep -nE '[A-Za-z]:\\{1,2}[\\/]?(patents|Users)'` 结果**为空（0 处）** —— 原登记的 1 处占位符已随 REQ-010 选择方案 B 删除 `scripts/` 而不复存在，**GAC-3 至此无任何例外**。三条口径要求：
     - **必须用 `git grep`**（只统计受版本控制的文件），不得写成 `grep -rn .` —— 后者会把本机被忽略目录（`.audit-reports/`、`.workbuddy/`、`.test-*`）一并计入，产生**永远无法满足**的假要求。本规格文档自身也在受控范围内，**无例外**。
     - **反斜杠必须写成 `\\{1,2}`（1~2 个）**。JSON 产物中的路径是**双反斜杠转义**，只写单个 `\` 会漏掉全部 3 个 JSON 产物 —— 实测：单反斜杠口径仅命中 9 处，`\\{1,2}` 口径命中 28 处。这是本规格第二次自检的教训，验收时不得退化为单反斜杠写法。
     - 计数用 `git grep -oE ... | wc -l`（按**处数**），不要用 `git grep -c`（按**行数**）—— `codex.json` 的 7 处分布在 6 行上，两者结果不同。
  2. **本条已无任何例外**：原唯一登记的例外（`scripts/hooks/install-post-commit.ps1` 的 `.EXAMPLE` 占位符）随 REQ-010 选择方案 B 删除 `scripts/` 而消失。2026-09-16 实测 0 处命中。
     - 注意：本规格此处**刻意不写出盘符字面量**（以「盘符」二字代指）。若写成字面量，本文件会被自己的验收命令命中，使「0 处」不成立 —— 这属于 GAC-3「零本机路径」口径下的自证约束。
  3. 若按 DEC-1 移出 `plugins/`，则本条随 REQ-014 一并达成。
- **关联 ID**：G6、2.1、D10；治理依据：`CONSTITUTION.md` 原则 IV + 原则 V
- **优先级**：P0

---

#### REQ-049｜修复字段标签被粗体包裹导致的静默默认值

- **现象**（PDCA-2 执行期间实测发现，REQ-005 未覆盖）：`src/core/landscape-schema.ts` 中 `type` 与 `source` **看似已实现解析、实际从不匹配** —— 正则写作 `类型[：:]` / `来源[：:]`，要求标签后紧跟冒号，而模板与真实文档写作 `- **文献类型**: 论文`，标签与冒号之间夹着 `**`。后果比 REQ-005 更隐蔽：`type` **静默落回默认值 `'patent'`**（论文 / 标准被误判为专利），`source` **静默落回空串**，二者均不报错。修复前实测（`.audit-reports/_probe_landscape.mjs`）：对「文献类型: 论文」的条目，`type=patent`、`source=""`。
- **根因**：与 REQ-005 是**两个独立缺陷落在同一函数**里 —— REQ-005 是「类型先于解析实现」，本条是「解析已实现、但正则与文档的实际书写格式脱节」，且都表现为**静默空值而非报错**。
- **修复目标**：字段标签的正则**容忍 Markdown 粗体包裹**（标签与冒号之间允许 `\**\s*`），使 `类型` / `来源` / `申请人` / `作者` / `IPC` / `引用数` 六类标签在该书写格式下均可解析。
- **影响范围**：`src/core/landscape-schema.ts`（`parseLandscape`）；`tests/unit/core/landscape-schema.test.ts`。
- **验收标准**：
  1. 对形如 `- **文献类型**: 论文` 的条目，`parsed.entries[i].type === 'paper'`（**不得**回落为 `'patent'`）。
  2. 对形如 `- **来源**: X` 的条目，`parsed.entries[i].source === 'X'`（**不得**为空串）。
  3. 新增测试断言上述两项；该测试在修复前**必然失败**。
  4. `npx tsc` 0 错误。
- **关联 ID**：R9、R10（与 REQ-005 同源）
- **优先级**：P0

---

#### REQ-050｜修复生成产物被回读为输入导致的定义退化与卸载残留

- **现象**（PDCA-3 执行期间实测发现）：`loadAgents()` 以 `<workspaceDir>/.opencode/agent/*.md` 为代理定义的**权威来源**（REQ-002 的结论），而 opencode 适配器生成的 agent 文件**恰好写入同一目录**。于是 `adapt install` 之后的下一次 `loadPortableDef()` 会把自己的产物当作输入读回，且「生成器输出」与「解析器能力」**不构成不动点**。探针 `.audit-reports/_probe_generate_fixpoint.mjs` 在干净临时工作区实测：
  1. `generate(load(generate(def)))` 与 `generate(def)` 相比，**29 个产物中 14 个字节不同**；
  2. `description` 每轮被**再包一层引号**（`"X"` → `"\"X\""`，+2 字符），且随安装圈数**无界增长**；
  3. **全部权限丢失**：生成的前置元数据用 `permission: { edit, bash, task, skill }`，而 `parseYamlFrontmatter()` 只解析 `tools:` 段 → 回读后 `write` / `edit` / `bash` / `mcp` **全为 `false`**（`archimedes` 四项权限全丢）。
  4. 直接后果：对一个刚 `adapt install` 过的工作区执行 `adapt uninstall --tool opencode`，实测报 `removed 23, skipped 14` —— **14 个 agent 文件全部残留**（`uninstall` 以「磁盘内容 === `fileContent()`」判等，而两者已不相等）。
  5. **跨适配器污染**：`permissions.write` 同时驱动 claude-code 与 codex 的产物（`src/adapters/claude/index.ts:137-146`、`src/adapters/codex/index.ts:714-726`）。在同一工作区先 `adapt install --tool opencode`、再生成 claude-code 产物，**25 个文件里 15 个不同**：`archimedes` 与 `patent-landscape-analyst` 的 `tools` 由 `"*"` 退化成工具清单（丢失 MCP 能力）。
- **根因**：两条独立缺陷叠加 ——（a）`parseYamlFrontmatter()` **不能解析适配器实际写出的格式**：既不剥离 YAML 引号，也不认识 OpenCode 原生的 `permission:` 段（而该段正是本仓库声称支持的「完整 OpenCode 权限面」）；（b）`loadAgents()` 不区分「用户手写的覆盖定义」与「本工具自己生成的产物」，把后者也当成权威输入。
- **修复目标**：①`parseYamlFrontmatter()` 支持生成器实际写出的格式（剥离 YAML 引号、解析 `permission:` 段）；②生成产物携带**可识别的生成指纹**，`loadAgents()` 遇到带指纹的文件**不作为覆盖源**（手写文件无指纹，覆盖语义不变）；③顺手让 opencode 产物也能被 `--prune` 识别（见 REQ-051）。
- **影响范围**：`src/adapters/loader.ts`（`parseYamlFrontmatter`、`loadAgents`）；新增 `src/adapters/generated-marker.ts`；`src/adapters/opencode/index.ts`；`src/adapters/prune.ts`；新增测试。
- **验收标准**：
  1. `generate(load(generate(def)))` 与 `generate(def)` 逐文件**字节相同**（不动点），且两次 `loadPortableDef()` 得到的 agent 元数据（`description` / `role` / 四项权限）完全一致；有测试断言，且该测试在修复前**必然失败**。
  2. 干净工作区上 `adapt install --tool opencode` 紧接 `adapt uninstall --tool opencode`，`skipped` **为 0**，`.opencode/` 无残留。
  3. 手写的（无指纹）`.opencode/agent/*.md` 仍具备覆盖语义 —— 既有 `should preserve existing OpenCode files during install` 行为不回退。
  4. `permission: { edit: allow }` 形式的 OpenCode 原生前置元数据被解析为 `permissions.edit === true`。
  5. `npx tsc` 0 错误。
- **关联 ID**：A9（REQ-002 的延伸）、2.4、R2、O3
- **优先级**：P0

---


### 3.2 P1 一致性与健壮性（22 条）

---

#### REQ-015｜统一 JSONC 解析实现

- **现象**：同一功能**三处独立实现**：`src/adapters/loader.ts` 的 `parseJsonc()`、`src/core/init-checker.ts` 的 `stripJsonComments()`、`tests/e2e/plugin-load.test.ts` 的 `stripJsonComments()`。三者对字符串内 `//`（如 URL）的处理可能不一致。
- **根因**：无公共模块，各处各写一份。
- **修复目标**：提取到 `src/core/jsonc.ts`，三处共用；测试改从公共模块导入。
- **影响范围**：`src/adapters/loader.ts`、`src/core/init-checker.ts`、新增 `src/core/jsonc.ts`、`tests/e2e/plugin-load.test.ts`。
- **验收标准**：全仓库仅剩 1 处 JSONC 解析实现；含 URL（`https` 协议）的输入解析结果正确，且有单测；`npx tsc` 0 错误。
- **关联 ID**：A11、S3、T6、O3
- **优先级**：P1

---

#### REQ-016｜统一原子写入策略

- **现象**：`src/core/path-persistence.ts` 的所有写操作（`savePath`/`saveNode`/`saveInnovationSnapshot`）使用**直接 `fs.writeFile`**（非原子）；而 `src/core/state-manager.ts` 实现的是「写临时文件 → `unlinkSync` 目标 → `renameSync`」。两套策略不一致。且 `state-manager` 的写法在 **Windows 上 `rename` 非原子替换**，先 `unlink` 造成目标短暂不存在的窗口 —— 崩溃即丢文件。另外 README 声称 `path-persistence.ts` 提供 "Atomic writes + rollback"，与实现不符。
- **根因**：两模块分别实现；`state-manager` 的 Windows 语义未验证。
- **修复目标**：提取公共 `atomicWriteJson(path, data)`（Windows 上避免 `unlink` 窗口），两模块共用；修正 README 表述。
- **影响范围**：`src/core/path-persistence.ts`、`src/core/state-manager.ts`、新增 `src/core/atomic-write.ts`（或置于 `src/core/fs-utils.ts`）、`README.md`。
- **验收标准**：
  1. 全仓库仅 1 处原子写实现。
  2. 写入过程中断（模拟）不会产生截断的 JSON（有测试）。
  3. Windows 路径：不出现"目标文件已删除但新文件未就位"的窗口（代码层面不再有 `unlink` 后再 `rename` 的顺序）。
  4. README 中关于 `path-persistence.ts` 的描述与实现一致。
- **关联 ID**：R19、R20、R21、R22、O2
- **优先级**：P1

---

#### REQ-017｜对齐法域支持范围（`router` ↔ `state` ↔ `plugin.jsonc` ↔ 文档）

- **现象**：`src/core/router.ts` 的 `extractJurisdiction()` 可返回 `'EP'` 和 `'JP'`，但 `src/core/state.ts` 的 `VALID_JURISDICTIONS` 仅含 `['CN','US','PCT']`，`plugin.jsonc` 的 `config.jurisdiction.enum` 同为三值。用户说"检索欧洲专利"会得到 `EP`，随后被 `validateState()` 判为非法或 `getJurisdictionRules()` 抛错。另有 `src/skills/prior-art-search/SKILL.md` 声明选项为 `CN, US, EP, JP, PCT`，同样不一致。
- **根因**：四份"法域清单"各自定义，无单一来源。
- **修复目标**：见 **DEC-3**（推荐收敛）。修复后四处清单一致，且系统边界行为（不支持的法域如何响应）有明确定义。
- **影响范围**：`src/core/router.ts`、`src/core/state.ts`、`plugin.jsonc`、`src/skills/prior-art-search/SKILL.md`、相关测试。
- **验收标准**：
  1. 法域取值集合在全仓库只有一处定义（或由一处派生）。
  2. 对 `EP`/`JP` 输入，系统给出**确定且一致**的响应（either 支持 or 明确提示不支持），不出现"路由返回 A、校验拒绝 A"。
  3. 有测试覆盖 `EP`/`JP` 的输入路径。
- **关联 ID**：R23、D5、H3
- **优先级**：P1

---

#### REQ-018｜修正 `formatDate` 的时区错误

- **现象**：`src/commands/shared.ts` 的 `formatDate()` 使用 `toISOString()` —— **恒为 UTC**。GMT+8 用户在 08:00 前或 16:00 后生成的时间戳会显示**错误日期**（差 1 天）。TUI（`app.tsx` 的 `NodeView`）另有一处直接 `toISOString().split('T')[0]`，同源。`path-visualization.ts` 的 `formatDateLocal()` 是此问题的局部补救。
- **根因**：用 `toISOString()` 做本地展示格式化。
- **修复目标**：按本地时区格式化；消除 `formatDateLocal` 这类重复补救实现。
- **影响范围**：`src/commands/shared.ts`、`src/commands/path-visualization.ts`、`src/tui/app.tsx`。
- **验收标准**：
  1. 对 `2026-09-15T00:30:00+08:00` 这类时间戳，输出日期为**本地日期**（与 `Date` 本地字段一致），有单测。
  2. 全仓库仅 1 处日期格式化实现。
- **关联 ID**：R34、R44、R52
- **优先级**：P1

---

#### REQ-019｜统一 `path-overview` 的轮数计算

- **现象**：`src/commands/path-query.ts` 的 `getPathOverview()` 用 `totalRounds: pathData.nodes.length`，而 `src/core/path-graph.ts` 的 `getPathOverviewFromGraph()` 用 `roundNodes.length`。当节点含非 `round-*` 条目时，**两个 API 返回不同总轮数**。
- **根因**：同一指标两处实现，取数口径不同。
- **修复目标**：统一口径，并让两个 API 的关系明确（合并或明确分工）。
- **影响范围**：`src/commands/path-query.ts`、`src/core/path-graph.ts`。
- **验收标准**：同一份数据下两个 API 返回的总轮数**相等**，有测试断言。
- **关联 ID**：R36、R37
- **优先级**：P1

---

#### REQ-020｜修复 `path-graph` 的序列化丢失与平行边覆盖

- **现象**：`toJSON()` **静默丢弃所有非 `DERIVES_FROM` 类型的边**，破坏 round-trip 一致性；`edgeIndex` 以 `from->to` 为键，**平行边互相覆盖**；`addEdge()` 未校验节点存在，允许悬挂边。
- **根因**：序列化实现只覆盖了主边类型；索引键设计未考虑多重边。
- **修复目标**：`toJSON`/`fromJSON` 无损往返；索引键纳入边类型或独立边 ID；`addEdge` 校验端点存在。
- **影响范围**：`src/core/path-graph.ts`、测试。
- **验收标准**：
  1. 含多种边类型的图，`fromJSON(toJSON(g))` 与 `g` 等价（边数、类型、端点全部一致），有测试。
  2. 同一对节点间的两条不同边类型能被同时保留与检索。
  3. `addEdge` 对不存在的端点抛明确错误（而非静默接受）。
- **关联 ID**：R13、R14、R15、T10
- **优先级**：P1

---

#### REQ-021｜加固 `brainstorm-path` 的类型守卫

- **现象**：`isValidBrainstormPath()` / `isValidBrainstormNode()` 只校验浅层字段，**不校验嵌套结构**（`edges`/`innovations`/`scores`）；`round` 用 `typeof === 'number'` 校验，`NaN`/`Infinity` 均通过。
- **根因**：守卫实现只做了顶层检查。
- **修复目标**：补嵌套校验；`round` 追加 `Number.isFinite()`。
- **影响范围**：`src/core/brainstorm-path.ts`、测试。
- **验收标准**：`{ round: NaN }`、缺 `edges` 数组、`innovations` 形状错误等输入均被守卫判为非法，有单测覆盖。
- **关联 ID**：R16、R17
- **优先级**：P1

---

#### REQ-022｜补齐 `validateState` 的关键字段校验

- **现象**：`src/core/state.ts` 的 `validateState()` 未校验 `project.topic_slug`、`qa_rounds_completed`、`innovation_candidates`。其中 `qa_rounds_completed` 直接参与"连续 2 轮无问题"的退出判定，可被负值等污染，导致 QA 循环提前退出。
- **根因**：校验清单未覆盖全部关键字段。
- **修复目标**：补校验（含数值范围与类型）。
- **影响范围**：`src/core/state.ts`、`tests/unit/state.test.ts`。
- **验收标准**：`qa_rounds_completed: -1` 被拒绝；`topic_slug` 非空字符串校验生效；有单测。
- **关联 ID**：R25
- **优先级**：P1

---

#### REQ-023｜修复 `validator` 的路径拼接

- **现象**：`src/core/validator.ts` 用 `${projectPath}/${artifact}` 字符串拼接，**未用 `path.join()`**。Windows 上 `projectPath` 可能是 `projects\01-x`，拼接产生混合分隔符 `projects\01-x/MAIN.md`，导致路径相等判断失败。
- **根因**：硬编码 `/`。
- **修复目标**：改用 `path.join()`。
- **影响范围**：`src/core/validator.ts`、测试。
- **验收标准**：Windows 风格输入路径下，产物路径判断正确，有测试使用 `path.sep` 相关断言。
- **关联 ID**：R29
- **优先级**：P1

---

#### REQ-024｜修复 `threshold-config` 的硬编码权重

- **现象**：`generateImprovementSuggestions()` **硬编码权重 0.3/0.3/0.2/0.2**，未使用传入的 `config.weights`；而同文件的 `calculateWeightedScore()` 正确使用配置。用户自定义权重时，改进建议基于**错误权重**给出。
- **根因**：建议生成函数未接配置。
- **修复目标**：使用 `config.weights`。
- **影响范围**：`src/core/threshold-config.ts`、测试。
- **验收标准**：传入非默认权重时，建议排序与之匹配，有单测。
- **关联 ID**：R11
- **优先级**：P1

---

#### REQ-025｜修复 `diagram-inserter` 的别名与副作用

- **现象**：`updateFigureReferences()` **只是 `insertFigureReferences` 的别名**（方法名暗示"替换"，实为"插入"）；内部对传入 `specs` 调用 `.sort()` —— **原地修改调用方数组**。
- **根因**：两个语义被合并实现；排序未做拷贝。
- **修复目标**：明确语义（实现真正的"更新"或重命名并更新调用方）；`.sort()` 改为 `[...specs].sort()`。
- **影响范围**：`src/core/diagram-inserter.ts`、调用方、`tests/unit/diagram-inserter.test.ts`。
- **验收标准**：调用后原数组顺序不变（有测试）；`updateFigureReferences` 的命名与行为一致，或提供真正的替换语义。
- **关联 ID**：R6、R7、R8
- **优先级**：P1

---

#### REQ-026｜修复 `path-branch` 的快照缺失与 `path-restore` 的原因丢失

- **现象**：`src/commands/path-branch.ts` 的 `createBranchFromNode()` 复制节点但**未复制对应 snapshots**，分支上下文不完整；`src/commands/path-restore.ts` 的 `archiveInnovation()` 接收 `reason` 但**仅放入返回消息，未持久化**，重启即丢。
- **根因**：分支复制范围不完整；归档只做了部分持久化。
- **修复目标**：分支创建时一并复制关联快照；归档原因写入节点数据（`archiveReason` + `archivedAt`）。
- **影响范围**：`src/commands/path-branch.ts`、`src/commands/path-restore.ts`、测试。
- **验收标准**：分支目录含对应快照且可被 `loadInnovationSnapshot` 读取；归档后重载节点数据仍能读到原因。
- **关联 ID**：R38、R39
- **优先级**：P1

---

#### REQ-027｜修复 `adaptGenerate` 的重复加载与 `diagramRerender` 的引擎误用

- **现象**：`src/cli.ts` 的 `adaptGenerate()` 把 `loadPortableDef(...)` 放在 **per-target 循环体内**（重复读盘 + 扩大多 target 不一致窗口）；`diagramRerender()` 把 engine **默认硬编码为 `mermaid`**，对 PlantUML 图不传 `--engine` 时**用错引擎渲染**。
- **根因**：循环结构位置不当；默认值未从 manifest 读取。
- **修复目标**：`loadPortableDef` 提到循环外；`diagramRerender` 从 `figures-manifest.json` 读回原始 engine。
- **影响范围**：`src/cli.ts`、`tests/integration/cli-commands.test.ts`。
- **验收标准**：多 target 生成只解析一次定义（可用 spy/计数断言）；对 PlantUML 图 `rerender` 不传 engine 时仍用 PlantUML，有测试。
- **关联 ID**：R45、R46、T10
- **优先级**：P1

---

#### REQ-028｜修复 TUI 的异步错误处理

- **现象**：`src/tui/app.tsx` 的 `useInput` 回调被声明为 **`async`**，但 Ink 不等待其返回的 Promise → rejection 成为**未处理的 Promise 拒绝**，可能导致进程崩溃；`BranchesView` 的 `listBranches().then(...)` **无 `.catch()`**，索引损坏时界面静默空白；`ScoreBar` 在超范围值下 `'░'.repeat(negative)` 抛 `RangeError`。
- **根因**：异步逻辑放在同步回调中；缺错误分支；缺边界保护。
- **修复目标**：改为同步调度 + `try/catch` 或 `useEffect` 响应；补 `.catch()`；`repeat` 前做 `Math.max(0, ...)`。
- **影响范围**：`src/tui/app.tsx`。
- **验收标准**：模拟 `loadNodeForIndex` 抛错时，界面显示错误而非崩溃；`ScoreBar` 传入 `12` 或 `-1` 不抛异常。
- **关联 ID**：R51、R53、R56
- **优先级**：P1

---

#### REQ-029｜修复 `archiveInnovation` 之外的渲染层重复与边界（合并项）

- **现象**：`src/commands/render.ts` 的 `section()` 分隔线长度**写死**，中文标题长时**溢出边框**；`renderOverview()` 的 sparkline 未处理 `score > 10` 或负值。
- **根因**：宽度与取值未做自适应/钳制。
- **修复目标**：分隔线按内容宽度自适应；sparkline 取值钳制。
- **影响范围**：`src/commands/render.ts`、`tests/unit/render.test.ts`。
- **验收标准**：长中文标题下边框不溢出（有测试断言输出行宽）；超范围分数不抛异常。
- **关联 ID**：R42、R43、R54
- **优先级**：P1

---

#### REQ-030｜统一代理提示的 frontmatter 风格并修正权限放大

- **现象**：`src/adapters/claude/index.ts` 的 `buildAgentFrontmatter()` 用 `name: <agent.id>` —— Claude Code 的 agent frontmatter 约定以**文件名**确定 agent 名，`name` 非标准；当 agent 有 `bash` 或 `mcp` 权限时 `tools` 被设为 `"*"`（**权限放大**）；`src/agents/*.md` 中 13 个用 HTML 注释风格、1 个用 YAML，**两种并存**；`tests/unit/claude-adapter.test.ts` 把可疑约定**固化成了契约**。
- **根因**：frontmatter 约定未与目标工具文档核实；权限映射用了全量兜底。
- **修复目标**：核实并采用 Claude Code 的官方约定；`tools` 按 `permissions` **精确列举**而非 `"*"`；统一 prompt 文件的 frontmatter 风格（或明确两种均受支持并统一到主风格）。
- **影响范围**：`src/adapters/claude/index.ts`、`src/adapters/types.ts`、`src/agents/*.md`、`tests/unit/claude-adapter.test.ts`、`tests/unit/skill-frontmatter.test.ts`。
- **验收标准**：
  1. `tools` 字段与 `permissions` 有确定映射，且不含无条件 `"*"`。
  2. frontmatter 风格在全仓库统一（或有一处集中说明）。
  3. 若修正 `name:` 约定，`claude-adapter.test.ts` 的断言同步更新（不保留旧契约）。
- **关联 ID**：A16、A17、A21、D13、T1
- **优先级**：P1

---

#### REQ-031｜修正适配器生成文本与配置的失实项

- **现象**：`src/adapters/codex/index.ts` 的 `generateCodexJson()` 硬编码 `model: 'o4-mini'`、`provider: 'openai'`、`approvalMode: 'suggest'`、`sandbox: false`（安全默认值倒退）；`src/adapters/loader.ts` 的 `PLUGIN_TO_OPENCODE_MAP` 是**空对象**仅有注释；`ToolAdapter.uninstall()` 的内联返回类型在三个适配器中**重复声明三次**；`uninstall()` 额外清理非标准的 `~/.claude-best/`。
- **根因**：遗留重构残留 + 硬编码默认值。
- **修复目标**：`sandbox: false` 改为更保守默认；硬编码模型/provider 改为可配置或标注为示例；空 MAP 移除或实现；提取 `UninstallResult` 接口；`~/.claude-best/` 的清理加注释说明来源或移除。
- **影响范围**：`src/adapters/codex/index.ts`、`src/adapters/loader.ts`、`src/adapters/types.ts`、`src/adapters/claude/index.ts`。
- **验收标准**：`sandbox` 默认不再为 `false`；`UninstallResult` 类型唯一定义；空 MAP 已被移除或实现（无"仅注释"的空对象）。
- **关联 ID**：A8、A10、A13、A19
- **优先级**：P1

---

#### REQ-032｜修复文档中的失实声明

- **现象**：
  - `docs/specs/README.md`（约 215 行）声称「每次 PR 合并前…CI 流程中应包含文档检查」—— **CI 中无此检查**。
  - `README.md` 称 `.brainstorm/` 是 "decision DAG"、`path-persistence.ts` 提供 "Atomic writes + rollback" —— 均与实现不符。
  - `README.md` 给出 `S = 0.3·S_sec + 0.3·S_comp + 0.4·S_pat`，与代码的 `0.3/0.3/0.2/0.2` 是**两套不同模型**，易被误读为同一回事。
  - `README.md` 称 "Up to 6 QA rounds"，但代码中**无对应常量**，来源不明。
- **根因**：文档写于设计意图阶段，实现后未回填。
- **修复目标**：逐条改为与实现一致；对无法验证的数字，**删除而非保留**（遵循 `CONSTITUTION.md` 原则 II）。
- **影响范围**：`docs/specs/README.md`、`README.md`、`README.zh-CN.md`。
- **验收标准**：
  1. 全仓库中每条"CI 强制/包含"类声明，均能在 `.github/workflows/` 找到对应实现（逐条核对并在 PR 中列出）。
  2. "Atomic writes + rollback" 表述与 REQ-016 的最终实现一致。
  3. 权重模型表述与 `threshold-config.ts` 一致，或明确区分两套模型。
  4. "6 QA rounds" 若无来源则删除。
- **关联 ID**：R20、D17、D18、D19、H2、L1
- **优先级**：P1

---

#### REQ-033｜给 `docs/specs/` 加历史声明

- **现象**：`docs/specs/**`（PRD / TECHNICAL-DESIGN / API-DESIGN / PROGRESS-OUTPUT-ENHANCEMENT）自述状态为「✅ 已实现 / ✅ 已发布 v0.1.0」，内容**冻结在 v0.1.0（2026-06-17）**。当前系统的三大块在其中**零命中**：OpenCode 适配器（0.3.0）、`patent-init-sentinel`、`DIAGRAM_DRAFT/FINAL` 阶段、智慧芽 MCP。读者会误以为它就是当前规格。
- **根因**：文档缺乏生命周期标注。
- **修复目标**：在 `docs/specs/README.md` 顶部加历史声明，明确「本目录对应 v0.1.0，后续版本变更未回填；最新实现以 `src/` 与 `plugin.jsonc` 为准」。
- **影响范围**：`docs/specs/README.md`（顶部）。
- **验收标准**：声明存在且明确指向权威来源；`docs/README.md` 的索引同步标注。
- **关联 ID**：spec 评估报告 §六（建议 1）、D23
- **优先级**：P1

---

#### REQ-034｜统一对外文案与数量口径

- **现象**：对外描述存在 **5 个版本**（GitHub About / `package.json` / Codex 清单 / `README.md` tagline / `README.zh-CN.md` 开篇），彼此不构成翻译关系；智能体数量**三处口径不一**：README 写 **11**（`README.md:35` "Eleven agents"、`README.zh-CN.md` 6 处），`README.zh-CN.md:378` 标题写「11 个智能体一览」但表格实际列 **13 行**，`plugin.jsonc` 实际声明 **14** 个；`README.zh-CN.md` 开篇有 `achimedes` 拼写错误与 `，。` 双标点；GitHub 描述有标点空格错误；徽章为 `tests-123 passing`，实测 **132**。
- **根因**：文案多处独立维护，无母本。
- **修复目标**：定一句母本，三处引用同一句（中英各一份）；数量统一为「14 个智能体」（或「13 专业 + 1 编排」并全局一致）；修掉三处硬伤；徽章 `123` → `132`。
- **影响范围**：`README.md`（含徽章）、`README.zh-CN.md`（含徽章与 7 处数量）、`package.json` `description`、`plugins/codex/**/plugin.json` `description`；GitHub About（需在仓库设置中修改，属人工操作）。
- **验收标准**：
  1. `grep -rn "Eleven agents\|11 个" README*.md` 无残留（或全部替换为新口径）。
  2. 两处徽章均显示 132。
  3. `achimedes`、`，。` 已修正。
  4. 三处 `description` 内容一致（或明确各自适用场景）。
  5. GitHub About 的修改在 PR 描述中标注为**待人工执行**。
- **关联 ID**：N3、D15、2.5
- **优先级**：P1

---

#### REQ-035｜统一技能与提示的领域约束声明

- **现象**：`src/agents/patent-security-engineer.md` 与 `patent-product-compliance-analyst.md` 是**高度项目特定**的提示（专讲"国密密码机/HSM/SM2 预计算池"），却被列为通用工作流代理 —— 对非 HSM 选题会给出跑题输出；`src/agents/patent-path-recorder.md` 描述的数据结构与真实 `path.json` schema 不一致（`BranchMeta.pathFile` 不存在、分支文件形态描述不符、`refine/merge/split/pivot` 在 `TransformationType` 中无对应枚举）；`archimedes.md` 与 `README.md` 对 R1 代理组成描述不同；`archimedes.md` 的"禁止模拟子代理"与"强制调用"在不支持原生子代理的编辑器下冲突且**无降级路径**。
- **根因**：提示文件与实现/文档各自演进。
- **修复目标**：见 **DEC-5**（推荐加"适用范围与泛化指引"）；修正 `path-recorder` 的 schema 描述使其与实现一致；统一 R1 代理组成描述；把 `AGENTS.md` 中的降级方案写入 `archimedes.md`。
- **影响范围**：`src/agents/*.md`（4 个文件）、`README.md`。
- **验收标准**：
  1. `patent-path-recorder.md` 中描述的数据结构与 `brainstorm-path.ts` / `path-branch.ts` 的实际类型逐项一致。
  2. R1 代理组成在 `archimedes.md` 与 `README.md` 中一致。
  3. `archimedes.md` 含针对无原生子代理环境的降级说明。
  4. 项目特定的两个提示含明确的适用范围声明。
- **关联 ID**：D6、D7、D8、D9、D11、D14
- **优先级**：P1

---

#### REQ-051｜补齐生成指纹，使 `--prune` 对三个适配器一致生效

- **现象**（PDCA-3 实测发现）：REQ-013 的 prune 以「文件是否带生成指纹」判定能否删除（`src/adapters/prune.ts` 的 `GENERATED_MARKERS` / `isGeneratedFile()`），但**三个适配器里只有 codex 真的写了指纹**。实测 `grep -n "'<!--" src/adapters/{claude,codex,opencode}/index.ts`：codex **3 处**（`<!-- Generated for Codex by oh-my-patent. -->`）；claude **仅 agent 文件**命中既有指纹表的 `<!-- Agent: ` 条目，其 **command 文件无任何指纹**；opencode **全部产物零指纹**。后果：`adapt install --prune` 对 opencode 的 `.opencode/**` 与 claude 的 `.claude/commands/**` **永远无法清理遗留产物** —— 而这正是 REQ-013 要解决的问题本身。
- **根因**：指纹是**各适配器各自手写**的、非强制的；而 REQ-013 的集成测试是**自己往夹具里写指纹**（`tests/integration/prune.test.ts:45` 手工写入 `<!-- Agent: … -->`）来验证 prune 的，因此从未覆盖「适配器是否真的写了指纹」这一环 —— 测的是夹具，不是实现。
- **修复目标**：指纹收敛为单一常量，由公共函数统一注入；每个适配器写出的**每一个受管 Markdown 产物**都带指纹。`--prune` 的既有保守语义（无指纹即保留，保护用户自建文件）不变。
- **影响范围**：新增 `src/adapters/generated-marker.ts`；`src/adapters/{claude,codex,opencode}/index.ts`；`src/adapters/prune.ts`；`tests/integration/prune.test.ts`。
- **验收标准**：
  1. 对三个适配器分别调用 `generate()`，其 `getManagedDirectories()` 覆盖的**所有产物**均满足 `isGeneratedFile(content) === true`；有测试断言。
  2. 新增测试**不自行写入指纹**：遗留文件由**上一版定义的 `generate()` 真实产出**作夹具（杜绝「测夹具而不是测实现」），并在修复前**必然失败**。
  3. `adapt install --prune` 对 opencode 与 claude-code 均能删除不再产出的产物；无指纹文件仍被保留（原 3 条 prune 测试保持通过）。
  4. `npx tsc` 0 错误。
- **关联 ID**：REQ-013（prune 的补全）、H4
- **优先级**：P1

---

### 3.3 P2 技术债与优化（13 条）

| REQ         | 现象                                                                                                                                                                    | 修复目标                                                                   | 验收标准                                                          | 关联 ID             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------- |
| **REQ-036** | `package.json` 缺 `prepublishOnly` 钩子；`bin` 指向 `dist/cli.js`，而 `dist/` 被 `.gitignore` 排除 —— 忘记 `npm run build` 就发布会发出**不可运行的包**                                        | 增加 `prepublishOnly: "npm run lint && npm run build && npm test"`       | 脚本存在；本地 `npm publish --dry-run` 会触发该钩子                        | A2                |
| **REQ-037** | `package.json` 缺 `engines` 字段，而代码与 `init-checker.ts` 都要求 Node ≥ 18                                                                                                    | 增加 `"engines": { "node": ">=18" }`                                     | 字段存在；`npm install` 在不满足时不静默通过                                 | A3、S7             |
| **REQ-038** | `tsconfig.json` 的 `moduleResolution: "bundler"` 与源码显式 `.js` 导入语义冲突（当前因 `tsc` 不校验扩展名而"能跑"，属脆弱配置）                                                                       | 见 **DEC-2**：改 `NodeNext`（须先实测）                                         | 改后 `npx tsc` 与 `npm test` 均通过；若回退则记录原因                        | A4                |
| **REQ-039** | `validateState` / `VALID_STAGES` / `WorkflowStage` 构成**双重事实来源**，新增阶段需改多处；`VALID_TRANSITIONS` 无编译期约束                                                                   | 从单一常量派生各表示                                                             | 阶段清单在全仓库只有一处定义                                                | R26、R28、O4        |
| **REQ-040** | `path-branch.ts` 与 `path-persistence.ts` 各自定义路径常量（`BRANCHES_DIR`/`INDEX_FILE` vs `BRAINSTORM_DIR`/`NODES_DIR`/`SNAPSHOTS_DIR`）                                        | 集中到单一常量模块                                                              | 常量集中定义，无重复                                                    | R40、O5            |
| **REQ-041** | 路径常量/`totalRounds` 之外的 `createInitialPath()` 用 `path-${Date.now()}`，同毫秒内创建两条路径会 **ID 冲突**                                                                             | 追加随机后缀或改用 `crypto.randomUUID()`                                        | 连续两次创建不冲突（有测试）                                                | R18               |
| **REQ-042** | `renderAll()` 串行执行、`renderMermaid()` 串行调用 `mmdc` 两次；`renderPlantUML()` 未校验响应体（HTTP 200 也可能是含语法错误的错误图）                                                                 | 合并/并发生成；校验 Content-Type 或尺寸下限                                          | PlantUML 错误响应被识别为失败而非写入 `figures/`；有测试                        | R3、R4、R5          |
| **REQ-043** | `DEFAULT_RENDERER_CONFIG` 硬编码公共 `plantuml.com` —— 企业内网不可用，且会把**技术方案源码发送到第三方**（专利内容敏感）                                                                                 | 支持环境变量覆盖 + 文档提示私有部署                                                    | 环境变量可覆盖 URL；README 有安全提示                                      | R33               |
| **REQ-044** | 测试侧问题：`npm test` 依赖 `dist/` 已构建（否则 `cli-commands.test.ts` 直接抛错）；临时目录建在仓库根 `.test-cli-temp`（崩溃时残留）；`state-persistence.test.ts` 在源码树内建目录                                | 加 `pretest` 串联 build；临时目录改用 `os.tmpdir()`；测试目录移出源码树                    | 干净克隆上 `npm test` 直接通过；崩溃不残留仓库内目录                              | T4、T5、T7          |
| **REQ-045** | CI 加固：`publish-npm` 用长期 `secrets.NPM_TOKEN`（无 OIDC/provenance）；`environment: PRE` 名实不符；`build` 与 `publish-npm` 重复 `npm ci`+`build`；Actions 未固定 SHA；无 `permissions:` 块 | 见 **DEC-4**；补 `permissions`、固定 SHA、消除重复构建；声明 `npm audit` 的 dev-only 结论 | workflow 含 `permissions` 块；Actions 固定到 SHA；文档声明 dev-only 漏洞结论 | S3、S4、S5、S6、S8、N4 |
| **REQ-046** | 全仓库仅一个 workflow，触发条件只有 `release: [created]` + `workflow_dispatch` —— **无 `pull_request` / `push`**。这使 `CONTRIBUTING.md` 与 `docs/specs/README.md` 中"PR 会跑检查"成为虚假声明 | 见 **DEC-4**：新增 `on: pull_request`（含 build / lint / test）；若新增产物门禁则同时覆盖漂移检查 | PR 上能看到 CI 运行记录；`CONTRIBUTING.md` 的表述与之一致 | H2 |
| **REQ-047** | 根级 `specs/` 与既有文档不一致：`CONTRIBUTING.md` 结构树仍写作 `docs/ └── specs/  # Product specs`，且无「先出规格」的贡献流程；`docs/README.md` 索引无 `specs/` 条目；`CONSTITUTION.md` 全文未规定规格落位 | 见 **DEC-8**：确立根级 `specs/` 为规格唯一规范位置，同步上述三处文档；`docs/specs/**`（v0.1.0 事后快照）标注为历史快照。**PDCA-8 已执行**：三处文档全部改指根级 `specs/`（`CONTRIBUTING.md` 结构树 + 新增 `## Spec-First Changes` 贡献流程；`docs/README.md` 索引；`CONSTITUTION.md` Operational Constraints），`docs/specs/**` 五个文件**逐个**加顶部历史快照标注。就规格落位新增的规范约束使 `CONSTITUTION.md` 按自身策略升 **MINOR → 1.2.0** | 三处文档均指向根级 `specs/`；`docs/specs/**` 顶部有「历史快照」标注；表述仍受 C-1 约束（不声称 CI 强制）。⚠️ **REQ-048 验收① 的 `Last Amended` 字面值由 `2026-09-15` 变为 `2026-09-20`**（PDCA-8 新增修订的必然结果）：其判据（尾行含 `Adopted` 与 `Last Amended`、版本按自身策略升 MINOR、Governance 区留三要素修订记录）**仍全部成立** | 本次修订（规格自检）；PDCA-8 执行 |
| **REQ-048** | `CONSTITUTION.md` 是从上游父工作区平移过来的宪章（仅 6 处适配），留下三类错位：①**适用域错位** —— 原则 I 第 1 句「orchestration assets MUST stay in the repository root」、原则 II 的 `references/`、以及整节 Delivery and Review Workflow，描述的是**产品运行时契约**（本仓库生成的 `plugins/**/AGENTS.md` 教用户去建的目录），而本仓库根下**既无 `projects/` 也无 `references/`**（实测 `ls -d projects references` 均不存在），本仓库的编排资产实际在 `src/agents/`、`src/commands/`、`src/adapters/`、`plugin.jsonc`；②**元数据不准** —— 尾行 `Version: 1.0.0 | Ratified: 2026-03-17 | Last Amended: 2026-03-17`，而仓库级适配发生在 2026-09-15（含重写原则 I、新增合规免责句），按其自身版本策略（PATCH=澄清 / MINOR=实质扩权）至少应升 PATCH 并记 `Last Amended: 2026-09-15`，现文本会让人以为它 3 月即对本仓库生效；③**管辖范围不一致** —— `AGENTS.md:37` 称原则 IV 是 “governing rule on secrets **and local paths**”，而原则 IV 正文未提本机路径一个字 | 见 **DEC-9**：引入**适用域标注**（本仓库内部布局 / 产品运行时契约），修正版本与日期，把 local paths 正式写入原则 IV 正文使与 `AGENTS.md` 一致，并在本规格 §0 补引原则 **V**（`Deterministic Naming and Reproducibility` —— 它是 `plugins/` 治理最硬的依据，原 §0 只引了 II/III/IV） | ①尾行含 `Adopted: 2026-09-15` 与 `Last Amended: 2026-09-15`，版本按自身策略升 **MINOR → 1.1.0**，且 Governance 区留有含「理由 / 影响文件 / 兼容性说明」三要素的 Amendment record；②每条 MUST 条款标注适用域，文档不再暗示 `projects/`、`references/` 位于本仓库根（实测二者不存在）；③原则 IV 正文含本机路径约束，与 `AGENTS.md:37` 双向 grep 一致；④不存在把 `CONSTITUTION.md` 标为 **v1.0.0** 作为本仓库**当前管辖版本**的声明（历史出处 / 变更记录 / 验收记录自身不计）。核对方式：`git grep -n 'v1\.0\.0' -- '*.md' ':(exclude)specs/'` 并**逐条归类**；2026-09-15 实测 4 处、全部为历史出处或无关文档自身的示例，0 处为管辖声明。⚠️ **本条禁止写成「命中计数为 0」** —— 规格目录内的验收记录每提及一次该字符串就自增一处命中，计数式判定必然因自指而失败（REQ-014 验收标准 2 同源）；⑤不新增任何 CI 强制声明（受 C-1 约束） | 本次修订（宪法自检，2026-09-15） |
| **REQ-052** | `diagram-renderer.ts` 的 `encode64()` **位序写反**：把 PlantUML 的「3 字节高位优先切成 4 个 6bit」写成了 base64 **解码**方向的位运算（`b1 = data[i] & 0x3f` 等）。产出的路径段语法合法、长度也对，但服务端**无法解码**，于是静默返回自己的 `Welcome to PlantUML!` 占位图 —— HTTP 200、`Content-Type: image/svg+xml`、尺寸正常，**任何状态码/内容类型校验都发现不了**。后果：每一张 PlantUML 图都是占位图，`figures-manifest.json` 却记 `success: true`。REQ-004 的用例只断言了 URL 形状（`/^[0-9A-Za-z\-_]+$/`）与「PNG 与 SVG 用同一编码」，故该缺陷自 REQ-004 起一直未被发现 | 按官方实现重写为 `append3bytes(b1,b2,b3)`（3 字节 → 4 个 6bit，高位优先）；导出 `encode64()` / `encodePlantUML()` 供测试直接钉住位序；补原语向量、「解回原文」往返、以及一条**对 `www.plantuml.com` 实测通过**的路径段常量 | ①`encode64(Buffer.from('Man')) === 'JM5k'`（标准 base64 `TWFu` 经同一 6bit 位移表映射）；②`encode64` 输出可解码并 inflate 回原文；③`encodePlantUML('@startuml\nBob -> Alice : hello\n@enduml')` 等于实测常量 `SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9vt98pKifpSq10000`；④2026-09-20 实测：该常量在服务端返回 `x-plantuml-diagram-description: (2 participants)`、宽 119、SVG 内含 `Alice`；而**修复前的位序**在同一服务端返回 `(0 entities)`、789×310 的 `Welcome to PlantUML!` 占位图 | R3、R4、R5；本次 PDCA-7 执行中发现（REQ-042 收尾校验时实测） |

> **REQ-044 的实测依据（2026-09-15 修订；原归因已被推翻）**
>
> ⚠️ **本节曾记录「仓库树内递归删除 5183 ms vs `os.tmpdir()` 8 ms（约 650×）」，该归因经复核为错误，已作废。** 真相是：本机环境通过 `NODE_OPTIONS` 向所有 node 进程注入 `node-safe-delete-shim.cjs`，其 `shouldBypassSafeDelete()` 对**系统临时目录**直接放行（跳过守卫），而其他位置走回收站并调用 `checkBulkDeleteGuard()` —— 守卫**按工具调用累计计数、阈值 50**，超限即抛 `SAFE_DELETE_BULK_CONFIRM_REQUIRED`。故 5183 ms 是**守卫自身的耗时**，8 ms 是**豁免路径**，与文件系统无关。
>
> **关闭守卫后的真实删除成本**（`NODE_OPTIONS=` 清空注入；探针 `.audit-reports/_probe_fs_cost.mjs`，30 文件 × 2 轮）：
>
> | 操作                   | `os.tmpdir()`               | 仓库树内（`tests/fixtures`）      |
> | -------------------- | --------------------------- | ---------------------------- |
> | `writeFileSync`      | 652 / 678 ms（21.7 / 22.6 ms/文件） | 668 / 662 ms（22.3 / 22.1 ms/文件） |
> | `readFileSync`       | 6 / 5 ms                    | 6 / 5 ms                     |
> | `unlinkSync`         | 1706 / 1346 ms（56.9 / 44.9 ms/文件） | 1404 / 1363 ms（46.8 / 45.4 ms/文件） |
> | `rmSync(recursive)`  | 414 / 356 ms                | 375 / 331 ms                 |
>
> **结论（修订版）**：删除成本在本机是**均匀的 45–57 ms/文件**，两处目录**基本相同**。因此「改用 `os.tmpdir()`」**不能**带来速度收益，原依据不成立。
>
> **本条因此需要重新定义**（⏳ 待人工决定，**尚未改动 REQ-044 的目标**，见 `tasks.md` §3 PDCA-1 · Act）。已知的两个真实现象是：①凡「写入 + 删除数十个文件」的用例都会撞上 vitest 默认预算（用例 5 s / 钩子 10 s）；②仓库内临时目录（`.test-cli-temp`、`tests/fixtures/test-projects`）会被工具链扫到，且在这些位置执行删除会命中注入环境的批量守卫。

---

## 4. 全局验收标准（GAC）

无论各 REQ 的局部标准如何，全部修复完成后必须同时满足：

| #      | 验收项   | 判据                                                             | 验证方式       |
| ------ | ----- | -------------------------------------------------------------- | ---------- |
| GAC-1  | 编译健康  | `npx tsc` **0 错误**                                             | 实跑         |
| GAC-2  | 测试健康  | `npm test` **全绿**，且用例数 **≥ 132**（不许减少既有覆盖）                                                       | 本机**不可判定**：默认配置 6 项失败（4 项由注入环境的批量删除守卫抛出、2 项超时）→ 关闭守卫 1 项失败 → 关闭守卫 + 放宽超时 **141 / 141 通过**；头号失败已用 HEAD 基线工作树证明为既有问题（详见 tasks.md §3 PDCA-1 · Check） | ⚠️ 环境受限 |
| GAC-3  | 零本机路径 | 受版本控制文件中无**真实本机绝对路径**（`git grep` 口径，模式允许 1~2 个反斜杠——详见 REQ-014 验收标准 1；**PDCA-2 后已无任何例外，实测 0 处**）   | `git grep` |
| GAC-4  | 零明文凭据 | 无 API Key 明文落盘路径；写盘处有权限收紧与警告                                   | 人工核对 + 测试  |
| GAC-5  | 产物可复现 | 全新克隆 → `npm ci && npm run build && adapt generate` → 产物与门禁基线一致 | 实跑比对       |
| GAC-6  | 无虚假承诺 | 每条"CI 强制/检查"声明能在 `.github/workflows/` 找到实现                     | 逐条核对       |
| GAC-7  | 阶段一致  | 全仓库阶段序列与 `WorkflowStage` 一致                                    | 机械校验       |
| GAC-8  | 法域一致  | 法域取值集合单点定义，`EP`/`JP` 行为确定                                      | 测试         |
| GAC-9  | 仓库干净  | `git status` 无意外残留；忽略项未被误提交                                    | 实跑         |
| GAC-10 | 提交规范  | 每个 PDCA 循环一个 Conventional Commit；作者为仓库级身份                      | `git log`  |

---

## 5. 修复原则与约束

| #   | 约束                                                    | 来源                                                                           |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| C-1 | **不得声称 CI 强制不存在的东西** —— 任何"CI 会检查 X"必须先有 X            | `CONSTITUTION.md` 原则 IV + 本仓库前科（`docs/specs/README.md` 与旧 `CONTRIBUTING.md`） |
| C-2 | **不为修缺陷而做重构** —— 除非缺陷本身要求（如 REQ-015/016 的提取公共模块）      | 本次范围纪律                                                                       |
| C-3 | **不破坏既有契约** —— agent/command/skill id 与数量、CLI 子命令签名不变 | 兼容性                                                                          |
| C-4 | **每步可回滚** —— 每个 PDCA 循环独立提交，失败可单独 revert              | 可追溯性                                                                         |
| C-5 | **不引入新运行时依赖**                                         | 攻击面控制（现仅 `ink` + `react`）                                                    |
| C-6 | **验证先于声明** —— 每个"已修复"必须附实测输出，不接受"应该好了"                | `CONSTITUTION.md` 原则 II                                                      |
| C-7 | **规格先于执行** —— 本文件确认后才动代码；执行中若发现新问题，先回填本文件（升版本号）再修     | spec coding 本文档 §7                                                           |

---

## 6. 执行框架：PDCA

### 6.1 循环划分

以 **REQ 分组**为单位划分 PDCA 循环（而非以单个 REQ），保证每个循环产出一个可独立验收、可独立回滚的提交：

| 循环         | 覆盖 REQ                                      | 主题                            |
| ---------- | ------------------------------------------- | ----------------------------- |
| **PDCA-0** | REQ-048（+ §0 治理依据补引原则 V） | 治理先行：宪章适用域与元数据再适配（**必须先于 PDCA-1** —— 本规格以宪章为治理依据，依据先改、实现后改） |
| **PDCA-1** | REQ-001、002、013、014                         | 产物治理：补输入源 + 处置产物（**顺序敏感，先行**） |
| **PDCA-2** | REQ-003、004、005、010、011、012                 | 阻断性缺陷：静默失败、ESM 崩溃、脚本失效、提示失实   |
| **PDCA-3** | REQ-006、007、008、009                         | 适配器与安全：路径不一致、目录覆盖、安装位置、密钥落盘   |
| **PDCA-4** | REQ-015、016、018、019、020、021、022、023、024、025 | 核心引擎：一致性、原子性、守卫、路径            |
| **PDCA-5** | REQ-026、027、028、029、030、031                 | 命令层/CLI/TUI/适配器文本             |
| **PDCA-6** | REQ-017、032、033、034、035                     | 法域 + 文档与提示对齐                  |
| **PDCA-7** | REQ-036~046                                 | 工程加固：包配置、测试自包含、CI             |
| **PDCA-8** | 全部 + REQ-047（含 PDCA-0 成果的复核） | 全量回归 + 经验沉淀 + 文档收口（含规格落位对齐） |

### 6.2 单个循环的记录格式（写入 `tasks.md`）

```
## PDCA-n · <主题>

### Plan（计划）
- 目标 REQ：
- 预期改动文件：
- 风险与前置依赖：

### Do（执行）
- 实际改动：
- 提交哈希：
- 与计划的偏差及原因：

### Check（检查）
- 验收命令与原始输出：
- 该循环 REQ 的验收标准逐条判定（通过 / 未通过 / 部分）：

### Act（调整）
- 未通过项的处理：
- 是否需要修订 spec（版本号变更）：
- 经验条目（供 §沉淀）：
```

### 6.3 追溯要求

- 每个循环对应**一个** Conventional Commit（`fix(...)` / `docs(...)` / `chore(...)`）。
- 每条 REQ 的最终状态（✅ 通过 / ⏭️ 延后 + 理由）记录在 `tasks.md` 的汇总表。
- `Check` 环节的原始命令输出必须**粘贴原文**，不接受"已验证"这类无证据陈述。

---

## 7. 风险与回滚

| #    | 风险                                | 概率 | 影响 | 缓解                                    | 回滚                         |
| ---- | --------------------------------- | -- | -- | ------------------------------------- | -------------------------- |
| RK-1 | 重跑生成器导致 MCP 被清空                   | 高  | 高  | **必须先完成 REQ-001/002 再动产物**；在临时目录验证    | `git checkout -- plugins/` |
| RK-2 | 移出 `plugins/`（DEC-1A）后失去"生成结果可见性" | 中  | 中  | 若需展示，另建 `examples/generated/` 由 CI 生成 | `git checkout` 恢复          |
| RK-3 | `tsconfig` 改 `NodeNext` 引入编译错误    | 中  | 中  | 先实测；失败则保留 `bundler` 并记录（REQ-038）      | 还原 `tsconfig.json`         |
| RK-4 | 删除安装脚本（REQ-010B）影响既有用户            | 低  | 低  | 脚本当前 100% 失败，无实际使用者                   | `git revert`               |
| RK-5 | 新增 PR 触发 CI（DEC-4）消耗 Actions 额度   | 中  | 低  | 限制为 `build`/`lint`/`test`，不跑发布        | 移除触发器                      |
| RK-6 | 修改提示文件影响 AI 行为                    | 中  | 中  | 只对齐**已存在**的事实，不新增指令；逐条 diff 复核        | `git revert`               |
| RK-7 | 文案统一后与外部引用不一致                     | 低  | 低  | 保留旧措辞的语义，不做概念性改写                      | `git revert`               |
| RK-8 | 宪章再适配（PDCA-0）改动被 5 处文档引用的版本号，遗漏即产生新的文档漂移 | 中  | 中  | 验收标准 4 用 grep 机械核对全部引用点 | `git revert` |

---

## 附录 A：原始问题 ID 全覆盖索引

| 来源 ID                | 本规格对应 REQ                              | 来源 ID      | 本规格对应 REQ                       |
| -------------------- | -------------------------------------- | ---------- | ------------------------------- |
| A1（`opencode.jsonc`） | REQ-001                                | R11        | REQ-024                         |
| A2                   | REQ-036                                | R12        | 排除（仅文档化，见 REQ-032）              |
| A3                   | REQ-037                                | R13        | REQ-020                         |
| A4                   | REQ-038                                | R14        | REQ-020                         |
| A5                   | REQ-010                                | R15        | REQ-020                         |
| A6                   | 排除（`.npmignore` 被 `files` 白名单覆盖，无实际影响） | R16        | REQ-021                         |
| A7                   | 排除（防御性规则，无害）                           | R17        | REQ-021                         |
| A8                   | REQ-031                                | R18        | REQ-041                         |
| A9                   | REQ-002                                | R19        | REQ-016                         |
| A10                  | REQ-031                                | R20        | REQ-016、REQ-032                 |
| A11                  | REQ-015                                | R21        | REQ-016                         |
| A12                  | REQ-021（同类守卫问题）                        | R22        | REQ-016                         |
| A13                  | REQ-031                                | R23        | REQ-017                         |
| A14                  | REQ-012                                | R24        | 排除（文档化，非缺陷）                     |
| A15                  | 排除（重构，非缺陷）                             | R25        | REQ-022                         |
| A16                  | REQ-030                                | R26        | REQ-039                         |
| A17                  | REQ-030                                | R27        | REQ-039（`toState` 无损往返）         |
| A18                  | REQ-012                                | R28        | REQ-039                         |
| A19                  | REQ-031                                | R29        | REQ-023                         |
| A20                  | REQ-031（Windows 分隔符）                   | R30        | 排除（接口设计，非缺陷）                    |
| A21                  | REQ-030                                | R31        | 排除（能力不对称属设计）                    |
| A22                  | 排除（两套参数解析，非缺陷）                         | R32        | 排除（提示与代码重复，见 O4）                |
| **C1**               | **REQ-010**                            | R33        | REQ-043                         |
| C2                   | REQ-010                                | **R34**    | **REQ-018**                     |
| C3                   | REQ-010（脚本删除时一并）                       | R35        | REQ-018（常量表）                    |
| C4                   | REQ-010                                | R36        | REQ-019                         |
| C5                   | REQ-010                                | R37        | REQ-019                         |
| C6                   | REQ-010                                | R38        | REQ-026                         |
| **R1**               | **REQ-004**                            | R39        | REQ-026                         |
| **R2**               | **REQ-003**                            | R40        | REQ-040                         |
| R3                   | REQ-042                                | R41        | 排除（O1 架构级）                      |
| R4                   | REQ-042                                | R42        | REQ-029                         |
| R5                   | REQ-042                                | R43        | REQ-029                         |
| R6                   | REQ-025                                | R44        | REQ-018                         |
| R7                   | REQ-025                                | **R45**    | **REQ-027**                     |
| R8                   | REQ-025                                | R46        | REQ-027                         |
| **R9**               | **REQ-005**                            | R47        | REQ-009                         |
| R10                  | REQ-005                                | R48        | 排除（功能增强）                        |
| R49                  | 排除（重构）                                 | D10        | REQ-014                         |
| R50                  | 排除（退出码改进）                              | D11        | REQ-035                         |
| **R51**              | **REQ-028**                            | D12        | REQ-034（语言统一）                   |
| R52                  | REQ-018                                | D13        | REQ-030                         |
| R53                  | REQ-028                                | D14        | REQ-035                         |
| R54                  | REQ-029                                | **D15**    | **REQ-034**                     |
| R55                  | 排除（交互语义，非缺陷）                           | D16        | 排除（见 §2.2）                      |
| R56                  | REQ-028                                | D17        | REQ-032                         |
| R57                  | 排除（重复入口，非缺陷）                           | D18        | REQ-032                         |
| **D1**               | **REQ-012**                            | D19        | REQ-032、REQ-016                 |
| **D2**               | **REQ-011**                            | D20        | REQ-034                         |
| D3                   | REQ-011                                | D21        | 非缺陷（已核实）                        |
| D4                   | REQ-035                                | D22        | 排除（见 §2.2）                      |
| D5                   | REQ-017                                | D23        | REQ-033                         |
| D6                   | REQ-035                                | T1         | REQ-030                         |
| D7                   | REQ-035                                | T2         | REQ-005                         |
| D8                   | REQ-035                                | T3         | REQ-003                         |
| D9                   | REQ-035                                | T4         | REQ-044                         |
| T5                   | REQ-044                                | **G6**     | **REQ-014**                     |
| T6                   | REQ-015                                | G7         | REQ-034（版本号见 DEC-6）             |
| T7                   | REQ-044                                | G8         | REQ-007                         |
| T8                   | 排除（覆盖率工具缺失，见 REQ-032 文档更正）             | N1         | REQ-007                         |
| T9                   | 排除（覆盖深度，非缺陷）                           | N2         | REQ-008                         |
| T10                  | REQ-003、REQ-020、REQ-027                | N3         | REQ-034                         |
| S1                   | REQ-009                                | N4         | REQ-045                         |
| S2                   | REQ-031（`execSync` 改 `execFileSync`）   | N5         | REQ-006、REQ-013                 |
| S3（JSONC）            | REQ-015                                | N6         | REQ-001、REQ-014（重复产物随 DEC-1 处理） |
| S3（CI/OIDC）          | REQ-045                                | P1 / P2    | REQ-013                         |
| S4~S8                | REQ-045                                | H2         | REQ-046                         |
| **G1**               | **REQ-013**                            | H3         | REQ-017                         |
| G2                   | REQ-013                                | H4         | REQ-013、REQ-010                 |
| G3                   | REQ-013                                | DEC-6 版本漂移 | REQ-034（`0.1.0` → `0.3.0`）      |
| G4                   | REQ-013（依 DEC-1）                       | O1~O8      | 排除（见 §1.5）                      |
| G5                   | REQ-034                                | —          | —                               |

> **K 系列（宪法自检，2026-09-15 新增，无外部报告来源）**：K1 宪章适用域错位（原则 I 第 1 句、原则 II 的 `references/`、整节 Delivery and Review Workflow 描述的是**产品运行时契约**，而本仓库根下无 `projects/`、无 `references/`）；K2 元数据版本与日期不符；K3「local paths」管辖范围在 `AGENTS.md:37` 与原则 IV 正文之间不一致；K4 本规格 §0 原只引原则 II/III/IV，漏引原则 V。→ **全部归入 REQ-048 / DEC-9 / PDCA-0**。

---

## 附录 B：判定"不成立"的项（防重复误报）

以下疑点在审查中曾被提出，经实测**不成立**，明确排除，避免本次重复判定：

| 疑点                                                                              | 核实结论                                                                 |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `adapt setup` 子命令不存在                                                            | **存在**（`cli.ts` 第 846 行附近）。早期报告误判，已更正                                |
| `package.json` 缺 `license` 字段                                                   | **存在**（`"license": "MIT"`）                                           |
| `ManifestEntry.source` 为空字符串                                                    | **有意设计**（manifest 不存源码，注释已说明），非缺陷                                    |
| `tsconfig` 的 `moduleResolution: bundler` 会导致编译失败                                | **未发生** —— `npx tsc` 实测 **0 错误**。仍列为 REQ-038 属"脆弱配置"改进，非缺陷修复         |
| "8 个 MCP server 全部硬编码"                                                          | 实际是 **8 个中的 5 个**；另 3 个用 `npx`，本身可移植                                 |
| "GitHub 描述为空"                                                                   | 在 2026-09-14 15:03（物料包生成时）确实为空，**15 分钟后被补齐**。当前非空                    |
| `npm test <path>` 写法、`test:watch`、内联 Code of Conduct、`style` 提交类型、`npm ci` 前置条件 | 经核实**均正确**（详见 CONTRIBUTING 审计报告 §五）                                  |
| `plugins/` 会随 npm 包分发                                                           | **不会** —— `files[]` 白名单排除，`npm pack --dry-run` 实测 69 文件不含 `plugins/` |

---

## 附录 C：验收基线（2026-09-15 实测）

修复前的当前状态，作为回归对照：

| 指标                                      | 当前值                             | 修复后目标                                          |
| --------------------------------------- | ------------------------------- | ---------------------------------------------- |
| `npx tsc`                               | 0 错误                            | 0 错误（不退化）                                      |
| `npm test`                              | 132 / 132 通过（23 文件，15.04s）；2026-09-15 起本机复跑出现超时失败 —— **归因已于 PDCA-1 修正**：不是「仓库树内删除慢」，而是①注入环境的批量删除守卫、②删除单文件均匀需 45–57 ms（见 §3.3 后注）      | 全绿，用例数 ≥ 132                                   |
| `npm pack --dry-run`                    | 69 文件（**该数字为未构建状态**：`64 src + plugin.jsonc + package.json + 2 README + LICENSE`；含 `dist/` 时为 179）      | 含 `opencode.jsonc.example`，不含 `opencode.jsonc` |
| 全新克隆 `adapt generate` 的 `settings.json` | `{"mcpServers": {}}`            | 8 个 server，路径为占位符                              |
| 产物中的本机路径                                | 3 文件 / 5 条                      | 0                                              |
| 产物 `plugin.json` 版本                     | `0.1.0`                         | 与 `package.json` 一致（`0.3.0`）                   |
| `plugins/` 被跟踪文件数                       | 80                              | 依 DEC-1 决定                                     |
| CI 触发器                                  | `release` + `workflow_dispatch` | 依 DEC-4，可能新增 `pull_request`                    |
| 运行时依赖                                   | `ink`、`react`（2 个）              | 不变                                             |
| `npm audit`                             | 7 项（全 dev 链）                    | 减少或记录 dev-only 结论                              |
| 测试徽章                                    | `123 passing`                   | `132 passing`                                  |
| `CONSTITUTION.md` 版本 / 日期 | `1.0.0` / `Ratified 2026-03-17`（与本仓库 2026-09-15 适配事实不符） | `Adopted: 2026-09-15`、`Last Amended: 2026-09-15`，按自身策略升 **MINOR → 1.1.0**（REQ-048；原则 IV 管辖集合扩张属「实质扩权」）；PDCA-8 就规格落位再升 **MINOR → 1.2.0**（REQ-047） |

---

## 变更记录

| 版本    | 日期         | 变更                                         | 状态     |
| ----- | ---------- | ------------------------------------------ | ------ |
| 1.0.0 | 2026-09-15 | 初版：46 条 REQ（14 P0 / 21 P1 / 11 P2）+ 7 项待决策 | 📝 待确认 |
| 1.0.1 | 2026-09-15 | 修订：①「目标仓库」改用 GitHub 规范标识；②正文本机路径脱敏为 `<upstream-workspace>` / `<user-home>` 占位（使 GAC-3 与 REQ-014 验收无例外通过）；③新增 **DEC-8** 与 **REQ-047**（规格落位与文档对齐）；④修正 REQ 计数与 PDCA 覆盖；⑤GAC-3 / REQ-014 验收口径由 `grep -rn .` 改为 `git grep`（仅统计受控文件），并登记唯一占位符例外；⑥REQ-014 影响范围补入源头 `src/agents/archimedes.md`（D10）；⑦**实测口径修正**：反斜杠允许 1~2 个（JSON 产物为双反斜杠转义，单反斜杠口径漏掉 3 个 JSON 产物，命中数 9 → 28），并在 REQ-014 补入逐文件实测清单 | 📝 待确认 |
| 1.0.2 | 2026-09-15 | 确认版：①新增 **REQ-048 / DEC-9 / PDCA-0**（宪章适用域与元数据再适配，**PDCA-0 先行**）；②§0 治理依据补引**原则 V**（`Deterministic Naming and Reproducibility`），并在 REQ-001/013/014 的关联 ID 中标注治理依据；③计数更新：REQ 47 → **48**（P2 12 → 13）、PDCA 循环 8 → **9**；④修复 §3.3 表格被空行打断的渲染缺陷（REQ-046/047 原会退化为普通文本行）；⑤状态由「待人工确认」置为 **已确认** | ✅ 已确认 |
| 1.0.3 | 2026-09-15 | PDCA-0 回填：①治理依据版本改为 **CONSTITUTION.md v1.1.0**；②DEC-9 / REQ-048 验收标准①的版本判定由 PATCH 修正为 **MINOR → 1.1.0**（往原则 IV 管辖集合加入本机路径属 Governance 定义的「实质扩权」）；③新增 **REQ-044 实测依据**（仓库树内 `rmSync` 5183 ms vs `os.tmpdir()` 8 ms，650×），并在 GAC-2 与附录 C 补记由此产生的环境敏感性；④实测确认 `AGENTS.md` / `README.md` / `CONTRIBUTING.md` / `docs/README.md` 四份引用文档**无需改动**（无版本硬编码，且 `AGENTS.md` 的「local paths」表述因原则 IV 扩权由不实变属实） | ✅ 已确认 |
| 1.0.4 | 2026-09-15 | PDCA-1 回填与**归因修正**：①**删除并替换 REQ-044 被推翻的实测依据** —— 「仓库树内 `rmSync` 5183 ms vs `os.tmpdir()` 8 ms（650×）」实为注入环境的批量删除守卫（临时目录豁免）所造成，与文件系统无关；清空注入后实测删除单文件均匀 **45–57 ms**，两处目录基本相同，故「改用 `os.tmpdir()`」不产生速度收益；②GAC-2 与附录 C 的归因同步改写，GAC-2 标记为「⚠️ 环境受限」（141 用例功能全通过、默认预算下不可判定）；③REQ-013 验收标准 1 由「与仓库逐字节一致」改写为可执行判据（DEC-1 后原比对对象已不存在）；④新增 REQ-013 验收 2 的 `npm test` 计数与超时预算待决项（**未改动任何 REQ 目标**） | ✅ 已确认 |
| 1.0.6 | 2026-09-15 | PDCA-3 回填：①**新增 REQ-050**（P0）—— opencode 适配器把产物写进 `loadAgents()` 的权威来源目录（`.opencode/agent/`），导致产物被回读为输入；生成器输出与解析器能力不构成不动点（29 个产物中 14 个字节漂移、`description` 每轮多加一层引号且无界增长、四项权限全丢、`adapt uninstall` 残留 14 个 agent 文件、并跨适配器污染 claude-code 25 个产物中的 15 个）；②**新增 REQ-051**（P1）—— 生成指纹只有 codex 真的写入，opencode 全部产物与 claude 的 command 文件均无指纹，`--prune` 对二者永远失效，而 REQ-013 的测试是自己往夹具里写指纹（测夹具而非测实现）；③计数同步：REQ 49 → **51**，P0 15 → **16**，P1 21 → **22**，范围记作 `REQ-001 ~ 014、049、050` / `REQ-015 ~ 035、051`；④§3.1 / §3.2 标题与 §2.1 表同步；⑤文件头 `当前 HEAD` 推进到 `021691e` | ✅ 已确认 |
| 1.0.5 | 2026-09-16 | PDCA-2 回填：①**新增 REQ-049**（P0）—— `type` / `source` 两个字段的正则与文档书写格式脱节（标签被 `**` 包裹导致永不匹配），`type` 静默落回 `'patent'`、`source` 静默落回空串；与 REQ-005 是**两个独立缺陷落在同一函数**，故单独编号（REQ 48 → **49**，P0 14 → **15**，范围记作 `REQ-001 ~ 014、049`）；②**REQ-014 验收标准 1 / 2 与 §4 GAC-3 改写** —— 原唯一登记的占位符例外（`install-post-commit.ps1` 的 `.EXAMPLE`）随 REQ-010 选择方案 B 删除 `scripts/` 而消失，GAC-3 由「仅剩 1 处」改为「**0 处、无例外**」；③REQ-010 修复目标标注「PDCA-2 选定并执行 B」；④§0 书写约定头与历史说明同步（`plugins/` 已移出版本控制 → 工作树中已无这些路径，但 git 历史仍在，二者不可混为一谈）；⑤计数与 §2.1 / §3.1 标题同步 | ✅ 已确认 |
| 1.0.7 | 2026-09-20 | PDCA-7 回填：①**新增 REQ-052**（P0）—— PlantUML `encode64()` 位序写反导致所有 PlantUML 图静默变成服务端占位图（REQ 51 → **52**，P0 16 → **17**，范围记作 `REQ-001 ~ 014、049、050、052`）；②**REQ-037 实现值修正**：`engines.node` 取 **`>=22`** 而非规格字面要求的 `>=18` —— 运行时依赖 `ink@^7`（`tui` 域）自身要求 `>=22`（2026-09-20 实测 npm registry：ink 7.x 全系 `>=22`、6.x 为 `>=20`），写 18 属"安装期静默通过、运行期才炸"，同步 `init-checker.ts` / `AGENTS.md` / `CONTRIBUTING.md` / `docs/RETRIEVAL_*.md` / CI 矩阵；③**REQ-045 的原结论被推翻并改写**：旧记「`npm audit` 7 项漏洞全在 devDependencies」实测为**假** —— `ink@7.0.2 → ws@8.20.0`，`ws` 在**运行时**依赖树内（`npm audit --omit=dev` 报 1 项 high）；已用 `npm audit fix` 将 `ws` 升至 8.21.3 并清掉 dev 链，**运行时树归零**后才把结论写入文档；④**REQ-044 的实测依据补全**：新增"本机删除成本 **46.9 ms/文件**（300 文件 = 14.06 s，与删除守卫无关）"与"缺失 vitest 配置导致默认预算下 **15 个用例超时**"两项证据，并记录两个可选方向同时执行 | ✅ 已确认 |

| 1.0.8 | 2026-09-20 | PDCA-8 回填（**收尾循环**）：①REQ-047 执行记录 —— 三处文档全部改指根级 `specs/`，`docs/specs/**` 五个文件逐个加历史快照标注；②治理依据版本随 `CONSTITUTION.md` 的规格落位修订升至 **v1.2.0**（按自身版本策略判为 MINOR：新增「规格 MUST 落在根级 `specs/`、判定 MUST 可由命令复现」两条规范约束，属实质扩权），并据此登记 **REQ-048 验收① 的 `Last Amended` 字面值变化**（判据本身仍全部成立）；③文件头 `当前 HEAD` 推进到 `4ddc279` | ✅ 已确认 |

---

*本规格遵循 [`CONSTITUTION.md`](../../CONSTITUTION.md) **v1.2.0**（PDCA-0 再适配版 v1.1.0 + PDCA-8 规格落位修订，见 REQ-048 / REQ-047）。**已确认**，执行完毕：PDCA-0 ✅ → PDCA-1 ✅ → PDCA-2 ✅ → PDCA-3 ✅ → PDCA-4 ✅ → PDCA-5 ✅ → PDCA-6 ✅ → PDCA-7 ✅ → PDCA-8 ✅（9 / 9 循环 · 52 / 52 REQ）。*
