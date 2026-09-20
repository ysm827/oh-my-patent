# 技术方案 · 规格 001 修复实施计划

| 字段          | 值                                                                    |
| ----------- | -------------------------------------------------------------------- |
| **对应规格**    | [`spec.md`](./spec.md) v1.0.8（✅ 已确认 2026-09-15）                        |
| **方案版本**    | 1.0.0                                                                |
| **编制日期**    | 2026-09-15                                                           |
| **执行状态**    | ✅ **全部 9 个循环已执行完毕**（2026-09-20；逐循环记录见 [`tasks.md`](./tasks.md) §1 / §5，横向复盘见 [`retrospective.md`](./retrospective.md)） |
| **执行框架**    | PDCA · **9 个循环**（PDCA-0 ~ PDCA-8）                                     |
| **任务清单**    | [`tasks.md`](./tasks.md)（含逐循环 Plan/Do/Check/Act 记录位）                   |
| **提交策略**    | 每循环 **1 个** Conventional Commit，本地累积；**推送 GitHub 前逐次申请人工批准**（用户硬规则，不可默认执行） |

---

## 0. 实施总则

### 0.1 硬约束（继承规格 §5 C-1 ~ C-7）

| #   | 落地要求                                                            |
| --- | --------------------------------------------------------------- |
| C-1 | 任何"CI 会检查 X"表述前，先在 `.github/workflows/` 找到 X；找不到就不写              |
| C-2 | 不为修缺陷而重构；提取公共模块仅在缺陷本身要求时做（REQ-015/016）                          |
| C-3 | agent / command / skill 的 **id 与数量不变**，CLI 子命令签名不变（`plugin.jsonc` 为基准） |
| C-4 | 每循环独立提交，可单独 `git revert`                                        |
| C-5 | 不新增运行时依赖（现仅 `ink` + `react`）                                     |
| C-6 | **验证先于声明** —— Check 环节必须粘贴原始命令输出，禁止"已验证"式陈述                     |
| C-7 | 执行中发现新问题 → 先回填 `spec.md` 升版本号，再动手修                               |

### 0.2 操作纪律（本机环境特有）

1. **同文件编辑严格串行**：一条改完落盘、`grep` 复核，再发下一条。同消息并发编辑会静默互相覆盖，且每条都返回"成功"。
2. **批量机械替换**（>5 处）用**单个 Python 脚本**一次做完，脚本内对每处替换做**唯一性断言**，匹配数不为预期即整体拒绝写盘。
3. **落盘后必须复核**：用 `grep -c` / `sed -n` 读回真实内容，不采信工具返回值。
4. 每循环开始前 `git status` 必须干净；结束前 `git status` 不得出现意外残留（GAC-9）。
5. `dist/` 是构建产物，不入库；`plugins/` 的处置按 DEC-1 执行。

### 0.3 每循环的固定收尾检查（Do 之后、Check 之前）

```bash
npx tsc --noEmit          # GAC-1 必须 0 错误
npm test                  # GAC-2 必须全绿且用例数 >= 132
git status --short        # GAC-9 不得有意外残留
```

---

## 1. 循环依赖关系

```
PDCA-0（治理先行 · 宪章再适配）
   └─> PDCA-1（产物治理 · 顺序敏感）
          ├─ 先 REQ-001/002：补齐输入源（opencode.jsonc.example、代理定义输入源）
          └─ 后 REQ-013/014：才能处置产物（--prune、清路径、DEC-1 移出版本控制）
                 └─> PDCA-2 ~ PDCA-7（相互独立，可任意顺序）
                        └─> PDCA-8（全量回归 + 沉淀 + 文档收口）
```

**两条不可颠倒的次序**（违反即产生破坏性后果）：

1. **PDCA-0 先于一切** —— 本规格以 `CONSTITUTION.md` 为治理依据；依据先改、实现后改，否则成为"依据在被引用之后才变"。
2. **PDCA-1 内部：补输入源 → 再动产物** —— 全新克隆上重跑生成器会把 MCP 从 8 个清成 0 个（已实测）。先补输入源，产物才可能变好。

---

## 2. 逐循环技术方案

### PDCA-0 · 治理先行：宪章适用域与元数据再适配

| 项       | 内容                                                          |
| ------- | ----------------------------------------------------------- |
| **目标 REQ** | REQ-048（+ 规格 §0 治理依据补引原则 V）                                 |
| **前置**    | 无                                                           |
| **提交类型**  | `docs(constitution): ...`                                   |

**改动文件**：`CONSTITUTION.md`、`AGENTS.md`（第 37 行）、`README.md`（§Ⅸ）、`docs/README.md`、`CONTRIBUTING.md`（Before Submitting 交叉引用）、`specs/001-review-remediation/spec.md`（§0/尾注版本号）。

**方案要点**：

1. **引入适用域标注**：为每个 Principle 与 Operational Constraint 标注 `Applies to`，取值 `repository-internal`（本仓库自身布局）/ `product-runtime`（输出给用户的运行时契约）/ `both`。当前**实测**：本仓库根下无 `projects/`、无 `references/`（`ls -d projects references` 均不存在），故原则 I 第 1 句、原则 II 的 `references/`、整节 Delivery and Review Workflow 均属 `product-runtime`。
2. **原则 I 第 1 句改写**：本仓库的编排资产在 `src/agents/`、`src/commands/`、`src/adapters/`、`plugin.jsonc`，不在仓库根；根下的是**生成产物** `plugins/`。
3. **原则 IV 正文补入本机路径约束**：使与 `AGENTS.md:37` 的 "secrets **and local paths**" 一致（二选一已定：扩原则正文，不缩引用方）。
4. **元数据修正**：尾行改为 `Version: 1.0.1 | Adopted: 2026-09-15 | Last Amended: 2026-09-15`，并在 Governance 区说明本次适配的 6 项内容（保留原有那句"无自动门禁、勿假设 CI 会校验"——它是全文最有价值的一笔）。
5. **交叉引用同步**：全仓库 5 处引用点的版本号一次性对齐（机械 grep 核对）。

**Check**：

```bash
tail -3 CONSTITUTION.md
git grep -n 'CONSTITUTION.md' -- '*.md' | grep -v '^CONSTITUTION.md'
ls -d projects references 2>/dev/null || echo "(both absent - as documented)"
git grep -n 'local paths' -- CONSTITUTION.md AGENTS.md
```

**回滚**：`git revert <hash>`（纯文档，无副作用）。

---

### PDCA-1 · 产物治理：补输入源 + 处置产物（顺序敏感）

| 项       | 内容                                     |
| ------- | -------------------------------------- |
| **目标 REQ** | REQ-001、REQ-002、REQ-013、REQ-014        |
| **前置**    | PDCA-0                                 |
| **提交类型**  | `fix(adapters): ...` / `chore(plugins): ...`（可拆两个提交，仍属同一循环） |

**方案要点（严格分两段）**：

**第一段 · 补输入源（必须先做）**

- REQ-001：新增 `opencode.jsonc.example`（8 个 server 条目，**零盘符字面量**）；`src/adapters/loader.ts` 的 `loadMCPServers()` 在 `opencode.jsonc` 缺失时回退读 `.example`，并加测试；`package.json` 的 `files[]` 同步（保留 `opencode.jsonc` 名但不发布真实文件）。
- REQ-002：补齐代理定义输入源，使全新克隆能重跑出完整产物。

**第二段 · 处置产物（顺序不可反）**

- REQ-013：三个适配器的 `generate()` 返回完整产物清单；`src/cli.ts` 的 `adaptInstall` 增 `--prune`（按"当前定义应产出集合"删除多余文件）。**验证必须用 5 个历史遗留 agent**：执行后目录内 agent 数 = 14。
- REQ-014：**先改源头** `src/agents/archimedes.md`（P1 提示正文写死了上游工作区路径，`adapt generate` 会复制进 3 份生成副本），再清产物。**注意：`plugins/` 在仓库根的产物清单不要求在本次"预先"修好——它们最终由 DEC-1 处置。**
- DEC-1：`git rm -r --cached plugins/` + `.gitignore` 加入 `plugins/`。产物退出受控范围后，GAC-3 的 28 处命中随之归零（仅剩 1 处登记例外）。

**Check**：

```bash
# 1) 隔离目录重跑，产物可复现
rm -rf /tmp/gen-probe && mkdir -p /tmp/gen-probe
git archive HEAD | tar -x -C /tmp/gen-probe     # 干净树
cd /tmp/gen-probe && npm ci && npm run build
node dist/cli.js adapt generate --output /tmp/gen-probe/out
python -c "import json;d=json.load(open('/tmp/gen-probe/out/.claude/settings.json'));print('mcpServers =',len(d.get('mcpServers',{})))"
# 期望：8（当前基线为 0）

# 2) 路径清零
cd <repo> && git grep -oE '[A-Za-z]:\\{1,2}[\\/]?(patents|Users)' | wc -l
# 期望：1（唯一登记例外）

# 3) 遗留清理
node dist/cli.js adapt install --output <dir> --prune && ls <dir>/.claude/agents | wc -l
# 期望：14
```

**回滚**：`git checkout -- plugins/`（若已 `rm --cached`，用 `git revert` 恢复跟踪）。

**风险**：RK-1（重跑清空 MCP）、RK-2（移出后失去生成结果可见性）。缓解见规格 §7。

---

### PDCA-2 · 阻断性缺陷：静默失败 / ESM 崩溃 / 脚本失效 / 提示失实

| 项       | 内容                                                        |
| ------- | --------------------------------------------------------- |
| **目标 REQ** | REQ-003、REQ-004、REQ-005、REQ-010、REQ-011、REQ-012            |
| **前置**    | PDCA-1（无强依赖，但按序执行便于归因）                                      |
| **提交类型**  | `fix(core): ...` / `fix(scripts): ...` / `docs(skills): ...` |

**方案要点**：

- REQ-003：`rerender()` 的 `? true : true` 恒真判定改真值比较；失败信息不得吞掉（当前把错误路径和成功路径写成同一结果）。
- REQ-004：ESM 模块中的 `require('zlib')` 改 `import`（ESM 下会直接抛错）。
- REQ-005：`landscape-schema` 的静默空值改为显式失败或默认值 + 警告（禁止静默吞掉）。
- REQ-010：`scripts/hooks/install-post-commit.{sh,ps1}` 引用了**不存在**的 `post-commit.js`（100% 失败）。**推荐删除这两个脚本及文档引用**——该 hook 的自动提交/同步语义与原则 III「Human-Gated」冲突，且无用户需求证据。（删除后 `install-post-commit.ps1:26` 的占位符例外自然消失，GAC-3 归零。）
- REQ-011：`jurisdiction` 的 `SKILL.md` 示例已与实现脱节，按真实 API 重写。
- REQ-012：提示文件中的工作流阶段列表对齐 `WorkflowStage`。

**Check**：

```bash
npx tsc --noEmit && npm test
git grep -n "require(" -- 'src/**/*.ts' | grep -v 'createRequire' || echo "(no bare require left)"
bash scripts/hooks/install-post-commit.sh ; echo "exit=$?"   # 或确认文件已删除
```

**回滚**：逐文件 `git revert`；REQ-010 若选删除则 `git revert` 即恢复。

---

### PDCA-3 · 适配器与安全：路径不一致 / 目录覆盖 / 安装位置 / 密钥落盘

| 项       | 内容                                      |
| ------- | --------------------------------------- |
| **目标 REQ** | REQ-006、REQ-007、REQ-008、REQ-009          |
| **前置**    | PDCA-1（适配器改动与其同源）                       |
| **提交类型**  | `fix(adapters): ...` / `fix(security): ...` |

**方案要点**：

- REQ-006：Codex 适配器的路径计算与 Claude 侧不一致（`-command` 指向错误的相对路径），导致卸载残留。
- REQ-007：`--output` 场景下多适配器互相覆盖（同一输出目录被后写者清空重写）。
- REQ-008：`adapt install` 默认安装位置不当，改为更安全/更符合直觉的位置并在帮助文本与文档同步。
- REQ-009：MCP API Key 明文落盘 → 改为不落盘（或写入时 `0600` + 明确警告 + 文档声明）。**这是安全项，Check 必须实测文件权限与内容**。

**Check**：

```bash
npm test
node dist/cli.js adapt install --help
# 密钥：安装后检查生成文件权限与是否含明文
ls -l <dir>/.claude/settings.json
git grep -nE '(sk-|api[_-]?key"\s*:\s*"[^"]+)' -- plugins/ src/ || echo "(no plaintext key)"
```

**回滚**：`git revert`。

---

### PDCA-4 · 核心引擎：一致性 / 原子性 / 守卫 / 路径

| 项       | 内容                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| **目标 REQ** | REQ-015、REQ-016、REQ-018、REQ-019、REQ-020、REQ-021、REQ-022、REQ-023、REQ-024、REQ-025                              |
| **前置**    | 无（独立于产物治理）                                                                                                    |
| **提交类型**  | `fix(core): ...`                                                                                              |

**方案要点**（按缺陷性质分组）：

| 组    | REQ                | 要点                                                             |
| ---- | ------------------ | -------------------------------------------------------------- |
| 一致性  | REQ-015、REQ-016     | 统一 JSONC 解析实现（当前三处各自实现）；统一原子写入策略（写临时文件 + rename）           |
| 时间/计数 | REQ-018、REQ-019     | `formatDate` 时区错误（本地时区 vs UTC 混用）；`path-overview` 轮数计算口径不一    |
| 数据完整性 | REQ-020、REQ-021、REQ-022 | `path-graph` 序列化丢失与平行边被覆盖；`brainstorm-path` 类型守卫缺失；`validateState` 关键字段未校验 |
| 路径    | REQ-023            | `validator` 的路径拼接（跨平台分隔符）                                       |
| 配置    | REQ-024、REQ-025     | `threshold-config` 硬编码权重改为可配置；`diagram-inserter` 别名与副作用问题         |

**Check**：`npm test` 全绿且**用例数增加**（每组补测试）；针对 REQ-018/019 用固定时区跑单测（`TZ=Asia/Shanghai` 与 `TZ=UTC` 结果一致）。

**回滚**：`git revert`。

---

### PDCA-5 · 命令层 / CLI / TUI / 适配器文本

| 项       | 内容                                                       |
| ------- | -------------------------------------------------------- |
| **目标 REQ** | REQ-026、REQ-027、REQ-028、REQ-029、REQ-030、REQ-031            |
| **前置**    | PDCA-3、PDCA-4                                            |
| **提交类型**  | `fix(cli): ...` / `fix(tui): ...` / `docs(agents): ...`     |

**方案要点**：

- REQ-026：`path-branch` 快照缺失 + `path-restore` 丢失原因信息。
- REQ-027：`adaptGenerate` 重复加载定义；`diagramRerender` 误用渲染引擎。
- REQ-028：TUI 异步错误未处理（Ink 组件内 promise rejection 会静默丢失）。
- REQ-029：渲染层重复与边界（合并项）。
- REQ-030：代理提示 frontmatter 风格统一 + **修正权限放大**（`allowed-tools` 类字段过于宽泛）。
- REQ-031：适配器生成文本与配置的失实项。

**Check**：`npm test`；TUI 用手工路径验证 1 次错误注入（Check 环节需粘贴实际输出）。

**回滚**：`git revert`。风险 RK-6（改提示影响 AI 行为）——只对齐已存在事实，不新增指令。

---

### PDCA-6 · 法域 + 文档与提示对齐

| 项       | 内容                                             |
| ------- | ---------------------------------------------- |
| **目标 REQ** | REQ-017、REQ-032、REQ-033、REQ-034、REQ-035         |
| **前置**    | PDCA-2（REQ-011/012 同属提示一致性，避免重复改同一批文件）         |
| **提交类型**  | `fix(jurisdiction): ...` / `docs: ...`          |

**方案要点**：

- REQ-017 / DEC-3：`router.ts` 会返回 `EP`/`JP`，而 `VALID_JURISDICTIONS = ['CN','US','PCT']` 会拒绝它们。**推荐收敛**：只返回受支持集合，EP/JP 明确降级为 `PCT` 或返回"暂不支持"提示。四处清单（`router` / `state` / `plugin.jsonc` / 文档）随之一致。
- REQ-032：文档失实声明逐条改为与实现一致；**无法验证的数字直接删除，不保留**（原则 II）。
- REQ-033：`docs/specs/**` 顶部加"v0.1.0 历史快照、不参与构建"声明。
- REQ-034：对外文案与数量口径统一（含徽章 `123 passing` → `132 passing`、`README.md:377`、`README.zh-CN.md:7`）。
- REQ-035 / DEC-5：项目特定代理提示加"适用范围与泛化指引"章节（不重写）。

**Check**：

```bash
npm test
git grep -nE 'EP|JP' -- src/core/state.ts src/core/router.ts plugin.jsonc | head
git grep -n '123' -- README.md README.zh-CN.md        # 期望无命中（徽章已改）
grep -n '历史快照' docs/specs/README.md
```

**回滚**：`git revert`。

---

### PDCA-7 · 工程加固：包配置 / 测试自包含 / CI

| 项       | 内容                                            |
| ------- | --------------------------------------------- |
| **目标 REQ** | REQ-036 ~ REQ-046                              |
| **前置**    | PDCA-1（产物策略确定后 CI 才好写漂移门禁）                     |
| **提交类型**  | `chore: ...` / `ci: ...`                        |

**方案要点**：

| REQ      | 要点                                                                         |
| -------- | -------------------------------------------------------------------------- |
| REQ-036  | `package.json` 加 `prepublishOnly`（build + lint + test），防止发出不可运行的包（`bin` 指向被忽略的 `dist/`） |
| REQ-037  | 加 `"engines": { "node": ">=18" }`                                            |
| REQ-038 / DEC-2 | `tsconfig.json` 的 `moduleResolution` 改 `NodeNext`，**先实测**：引入错误则保留 `bundler` 并记录原因 |
| REQ-039  | `validateState` / `VALID_STAGES` / `WorkflowStage` 双重事实来源 → 从单一常量派生             |
| REQ-040  | `path-branch.ts` 与 `path-persistence.ts` 的路径常量集中到单一模块                          |
| REQ-041  | `createInitialPath()` 的 `path-${Date.now()}` 同毫秒 ID 冲突 → 加随机后缀 / `randomUUID()`    |
| REQ-042  | `renderAll()` / `renderMermaid()` 串行改并发；`renderPlantUML()` 校验响应体（HTTP 200 也可能是错误图） |
| REQ-043  | `DEFAULT_RENDERER_CONFIG` 硬编码公共 `plantuml.com` → 支持环境变量覆盖 + README 私有部署提示（**专利内容敏感**） |
| REQ-044  | 测试自包含：`pretest` 串 build；临时目录改 `os.tmpdir()`；测试目录移出源码树                                  |
| REQ-045  | CI 加固：补 `permissions:`、Actions 固定 SHA、消除重复 `npm ci`+`build`、声明 `npm audit` 的 dev-only 结论 |
| REQ-046 / DEC-4 | 新增 `on: pull_request`（build / lint / test），让 `CONTRIBUTING.md` 的"PR 会跑检查"从虚假变真实    |

**Check**：

```bash
rm -rf /tmp/fresh && git clone <repo> /tmp/fresh && cd /tmp/fresh && npm ci && npm test   # 干净克隆可直接通过
npm pack --dry-run                     # 含 opencode.jsonc.example，不含 opencode.jsonc
npx tsc --noEmit
# CI：PR 触发后 gh run list --limit 3 观察运行记录
```

**回滚**：`git revert`；REQ-038 回退即还原 `tsconfig.json`。风险 RK-5（Actions 额度）。

---

### PDCA-8 · 全量回归 + 经验沉淀 + 文档收口

| 项       | 内容                                              |
| ------- | ----------------------------------------------- |
| **目标**    | 全部 REQ 的全局验收 + REQ-047（规格落位与文档对齐）+ 沉淀          |
| **前置**    | PDCA-0 ~ PDCA-7 全部完成                            |
| **提交类型**  | `docs: ...`                                      |

**方案要点**：

1. **全量回归**：逐条执行规格 §4 的 GAC-1 ~ GAC-10，**粘贴原始输出**。
2. **REQ-047 / DEC-8 收口**：`CONTRIBUTING.md` 结构树与贡献流程指向根级 `specs/`；`docs/README.md` 索引新增 `specs/` 条目；`CONSTITUTION.md` 写入规格落位约定；`docs/specs/**` 标注历史快照。
3. **经验沉淀**：把本次 9 个循环的可复用教训写入 `docs/`（如 `docs/spec-driven-remediation.md`）：spec 先行、PDCA 分组、证据纪律、本机路径门禁口径（`git grep` + 反斜杠 `\\{1,2}`）、同文件串行编辑。
4. **规格终态**：`spec.md` 的每条 REQ 状态回填（✅ / ⏭️ + 理由），版本升至 1.0.x 终版。

**Check**：

```bash
npx tsc --noEmit
npm test
git grep -oE '[A-Za-z]:\\{1,2}[\\/]?(patents|Users)' | wc -l    # 期望 0
git status --short
git log --oneline -12        # 9 个循环 = 9 个可辨识提交
```

---

## 3. 决策落点速查

| DEC      | 落在哪个循环   | 说明                                       |
| -------- | -------- | ---------------------------------------- |
| DEC-1    | PDCA-1   | `plugins/` 移出版本控制                       |
| DEC-2    | PDCA-7   | `moduleResolution: NodeNext`（先实测）        |
| DEC-3    | PDCA-6   | 法域收敛（EP/JP → `PCT` 或明确不支持）              |
| DEC-4    | PDCA-7   | CI 新增 `pull_request`                     |
| DEC-5    | PDCA-6   | 项目特定提示加泛化章节                              |
| DEC-6    | PDCA-7   | 版本号单点化到 `package.json`                   |
| DEC-7    | 已完成      | 规格入库（`176d422`）                          |
| DEC-8    | PDCA-8   | 规格落位与文档对齐（REQ-047）                        |
| DEC-9    | PDCA-0   | 宪章适用域与元数据再适配（REQ-048）                     |

---

## 4. 变更记录

| 版本    | 日期         | 变更                    |
| ----- | ---------- | --------------------- |
| 1.0.0 | 2026-09-15 | 初版：9 个循环技术方案 + 决策落点速查 |
