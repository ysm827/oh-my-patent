---
name: oh-my-patent
description: Use for patent disclosure drafting workflows, including /patent-new, /patent-search, brainstorming, drafting, review, and patent diagrams.
---

# oh-my-patent

Use this skill when the user wants to run the patent disclosure drafting workflow in Codex.

## Commands

- `/patent-new`: 新建专利项目
- `/patent-search`: 专利检索
- `/patent-draft`: 生成交底书
- `/patent-review`: 审核交底书
- `/patent-status`: 查看项目状态
- `/brainstorm-resume`: 查看头脑风暴路径、从节点恢复、分支探索、恢复已放弃创新点
- `/patent-diagram`: 生成、重渲染或查看专利附图

## Specialist Roles

- `archimedes`: Archimedes - 专利交底书主流程编排
- `patent-adversarial-examiner`: 对抗式审查员（专盯新颖性/创造性漏洞与最强反对意见）
- `patent-brainstorm-moderator`: 头脑风暴主持人
- `patent-disclosure-reviewer`: 交底书审核代理
- `patent-disclosure-writer`: 交底书撰写代理
- `patent-innovation-architect`: 创意激发代理
- `patent-landscape-analyst`: 专利检索代理（MCP 聚合）
- `patent-path-recorder`: 头脑风暴路径记录器
- `patent-product-compliance-analyst`: 密码机产品与合规场景专家（性能指标、运维审计、合规边界）
- `patent-security-engineer`: 密码工程与安全边界审阅（聚焦缓存/侧信道/密封/失效擦除）
- `patent-technical-responder`: 技术人员答复代理
- `patentability-evaluator`: 可专利性评估代理
- `patent-diagram-generator`: 读取交底书内容，生成 Mermaid/PlantUML 专利附图并渲染输出

## Runtime Rules

- Read `AGENTS.md` first and follow the project workflow state machine.
- Store project deliverables under `projects/{NN}-{topic_slug}/`, not in the core repository root.
- Persist specialist outputs in `references/` with standardized filenames.
- Do not simulate unavailable specialists; when native agent delegation is unavailable, explicitly execute the matching specialist skill context and persist the result.
