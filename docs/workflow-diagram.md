# oh-my-patent 工作流图示

本文档提供 oh-my-patent 的可视化工作流程图。

## 端到端工作流

```mermaid
graph TD
    Start([用户提出技术主题]) --> Init[INIT: 初始化项目]
    Init --> InitFiles[创建 .patent/state.json<br/>.brainstorm/path.json]
    
    InitFiles --> Research[RESEARCH: 专利检索]
    Research --> Landscape[landscape-analyst<br/>→ references/landscape.md]
    
    Landscape --> BrainstormR1[BRAINSTORM R1: 第1轮头脑风暴]
    BrainstormR1 --> Architect[innovation-architect<br/>生成创新候选]
    BrainstormR1 --> Adversarial[adversarial-examiner<br/>攻击漏洞]
    Architect --> Score1[评分 + 创新点快照]
    Adversarial --> Score1
    Score1 --> Node1[.brainstorm/nodes/round-1.json]
    
    Node1 --> BrainstormR2[BRAINSTORM R2: 第2轮深度评估]
    BrainstormR2 --> Security[security-engineer<br/>安全审查]
    BrainstormR2 --> Compliance[compliance-analyst<br/>合规检查]
    BrainstormR2 --> Evaluator[patentability-evaluator<br/>可专利性评估]
    Security --> Score2[综合评分]
    Compliance --> Score2
    Evaluator --> Score2
    
    Score2 --> Threshold{阈值评估<br/>novelty ≥ 7<br/>creativity ≥ 7}
    Threshold -->|未通过| BrainstormR1
    Threshold -->|通过| Draft[DRAFT: 撰写初稿]
    
    Draft --> Writer[patent-disclosure-writer<br/>→ MAIN.md]
    
    Writer --> QALoop[QA_LOOP: 审查-答辩循环]
    QALoop --> Reviewer[patent-disclosure-reviewer<br/>提出问题]
    Reviewer --> Issues{有新问题?}
    Issues -->|是| Responder[patent-technical-responder<br/>修订答辩]
    Responder --> QACount{轮次 ≤ 6?}
    QACount -->|是| QALoop
    QACount -->|否| FinalReview
    Issues -->|否,连续2轮| FinalReview[FINAL_REVIEW: 最终审查]
    
    FinalReview --> FinalDecision{通过?}
    FinalDecision -->|退回| QALoop
    FinalDecision -->|通过| Diagram[DIAGRAM: 渲染附图]
    
    Diagram --> DiagramRenderer[diagram-renderer<br/>Mermaid/PlantUML → SVG+PNG]
    DiagramRenderer --> FiguresDir[figures/ + 更新 MAIN.md]
    
    FiguresDir --> QualityGate[DONE: 质量闸门]
    QualityGate --> Complete([✅ 完成])
    
    %% 分支操作
    Node1 -.->|path branch| Branch[创建分支探索]
    Score2 -.->|path restore| Restore[复活已放弃创新点]
    
    %% 崩溃恢复
    Research -.->|崩溃| Recovery[从 state.json 恢复]
    BrainstormR1 -.->|崩溃| Recovery
    Draft -.->|崩溃| Recovery
    QALoop -.->|崩溃| Recovery
    Recovery -.-> Resume[精确断点续传]
    
    style Start fill:#e1f5ff
    style Complete fill:#c8e6c9
    style Threshold fill:#fff9c4
    style FinalDecision fill:#fff9c4
    style Issues fill:#fff9c4
    style QACount fill:#fff9c4
    style Recovery fill:#ffccbc
    style Branch fill:#f3e5f5
    style Restore fill:#f3e5f5
```

## 系统架构图

```mermaid
graph TB
    subgraph User["用户交互层"]
        CLI[CLI 命令]
        TUI[TUI 交互界面]
        Editor[编辑器插件<br/>Claude Code / Codex]
    end
    
    subgraph Orchestration["编排层"]
        Archimedes[Archimedes<br/>主编排器]
        Agents[11个专业智能体]
        Skills[可复用技能]
        Commands[CLI命令定义]
    end
    
    subgraph Engine["核心引擎层"]
        PathEngine[决策路径引擎<br/>brainstorm-path.ts]
        StateEngine[状态机引擎<br/>state-manager.ts]
        DiagramEngine[图表渲染引擎<br/>diagram-renderer.ts]
        ThresholdEngine[阈值评估引擎<br/>threshold-config.ts]
        WorkflowEngine[工作流编排<br/>workflow.ts]
    end
    
    subgraph Adapters["适配器层"]
        ClaudeAdapter[Claude Code Adapter]
        CodexAdapter[Codex Adapter]
        Loader[配置加载器]
    end
    
    subgraph Storage["持久化存储"]
        PathStorage[.brainstorm/<br/>决策路径数据]
        StateStorage[.patent/<br/>工作流状态]
        References[references/<br/>智能体产出]
        Figures[figures/<br/>渲染附图]
        MainDoc[MAIN.md<br/>交底书]
    end
    
    CLI --> Archimedes
    TUI --> PathEngine
    Editor --> Archimedes
    
    Archimedes --> Agents
    Agents --> Skills
    Commands --> Engine
    
    PathEngine --> PathStorage
    StateEngine --> StateStorage
    DiagramEngine --> Figures
    WorkflowEngine --> StateStorage
    
    Agents --> References
    Agents --> MainDoc
    
    ClaudeAdapter --> Editor
    CodexAdapter --> Editor
    Loader -.-> Adapters
    
    style User fill:#e3f2fd
    style Orchestration fill:#fff3e0
    style Engine fill:#f3e5f5
    style Adapters fill:#e8f5e9
    style Storage fill:#fce4ec
```

## 智能体协作图

```mermaid
graph LR
    subgraph Input["输入阶段"]
        User[用户] --> Topic[技术主题]
    end
    
    subgraph Search["检索阶段"]
        Topic --> Analyst[patent-landscape-analyst]
        Analyst --> Landscape[landscape.md]
    end
    
    subgraph Brainstorm["头脑风暴阶段"]
        Landscape --> Architect[patent-innovation-architect]
        Architect --> Innovations[创新候选]
        
        Innovations --> Adversarial[patent-adversarial-examiner]
        Innovations --> Security[patent-security-engineer]
        Innovations --> Compliance[patent-product-compliance-analyst]
        Innovations --> Evaluator[patentability-evaluator]
        
        Adversarial --> Scores[综合评分]
        Security --> Scores
        Compliance --> Scores
        Evaluator --> Scores
    end
    
    subgraph Draft["撰写阶段"]
        Scores --> Writer[patent-disclosure-writer]
        Writer --> MainMd[MAIN.md 初稿]
    end
    
    subgraph QA["审查阶段"]
        MainMd --> Reviewer[patent-disclosure-reviewer]
        Reviewer --> Issues[问题清单]
        Issues --> Responder[patent-technical-responder]
        Responder --> Revision[修订版本]
        Revision --> Reviewer
    end
    
    subgraph Finalize["完成阶段"]
        Revision --> Moderator[patent-brainstorm-moderator]
        Moderator --> Final[最终版本]
        Final --> Recorder[patent-path-recorder]
        Recorder --> Complete[✅ 完成]
    end
    
    style Input fill:#e1f5ff
    style Search fill:#fff9c4
    style Brainstorm fill:#ffccbc
    style Draft fill:#c8e6c9
    style QA fill:#f3e5f5
    style Finalize fill:#b2dfdb
```

## 决策路径数据结构

```mermaid
graph TD
    Path[BrainstormPath] --> Metadata[元数据<br/>projectId, topic, status]
    Path --> Nodes[节点列表<br/>nodes: string[]]
    Path --> Edges[边列表<br/>edges: Edge[]]
    Path --> Current[当前节点<br/>currentNodeId]
    Path --> Final[最终决策<br/>finalDecision]
    
    Nodes --> Node1[Round 1 Node]
    Nodes --> Node2[Round 2 Node]
    Nodes --> NodeN[Round N Node]
    
    Node1 --> NodeData[节点数据]
    NodeData --> AgentOutputs[智能体产出]
    NodeData --> Innovations[创新点列表]
    NodeData --> Scores[评分数据]
    NodeData --> Decision[决策记录]
    
    Edges --> Edge1[Edge 1]
    Edge1 --> Transform[转换类型<br/>refine/merge/split/pivot]
    Edge1 --> Changes[变更描述]
    
    style Path fill:#e3f2fd
    style Metadata fill:#fff9c4
    style NodeData fill:#c8e6c9
    style Transform fill:#f3e5f5
```

## 文件系统布局

```mermaid
graph TD
    Root[项目根目录] --> Brainstorm[.brainstorm/<br/>决策路径]
    Root --> Patent[.patent/<br/>工作流状态]
    Root --> Refs[references/<br/>智能体产出]
    Root --> Figs[figures/<br/>渲染附图]
    Root --> Main[MAIN.md]
    Root --> Conv[conversation.md]
    
    Brainstorm --> PathJson[path.json<br/>路径元数据]
    Brainstorm --> NodesDir[nodes/<br/>每轮数据]
    Brainstorm --> SnapshotsDir[snapshots/<br/>创新点快照]
    Brainstorm --> BranchesDir[branches/<br/>分支副本]
    
    Patent --> StateJson[state.json<br/>当前阶段]
    
    Refs --> Landscape[landscape.md]
    Refs --> Brainstorm1[brainstorm_round1_archimedes.md]
    Refs --> Review[review_r1_patent-disclosure-reviewer.md]
    
    Figs --> SVG[*.svg]
    Figs --> PNG[*.png]
    Figs --> Manifest[figures-manifest.json]
    
    style Root fill:#e3f2fd
    style Brainstorm fill:#fff9c4
    style Patent fill:#ffccbc
    style Refs fill:#c8e6c9
    style Figs fill:#f3e5f5
```

## 工作流状态机

```mermaid
stateDiagram-v2
    [*] --> INIT: 用户提出主题
    INIT --> RESEARCH: 初始化完成
    RESEARCH --> BRAINSTORM_R1: 检索完成
    BRAINSTORM_R1 --> BRAINSTORM_R2: 第1轮完成
    BRAINSTORM_R2 --> BRAINSTORM_R1: 阈值未通过
    BRAINSTORM_R2 --> DRAFT: 阈值通过
    DRAFT --> QA_LOOP: 初稿完成
    QA_LOOP --> QA_LOOP: 有新问题 且 轮次≤6
    QA_LOOP --> FINAL_REVIEW: 连续2轮无问题
    FINAL_REVIEW --> QA_LOOP: 退回修订
    FINAL_REVIEW --> DIAGRAM: 审查通过
    DIAGRAM --> DONE: 附图渲染完成
    DONE --> [*]: 质量闸门通过
    
    note right of INIT
        创建目录结构
        初始化 state.json
        初始化 path.json
    end note
    
    note right of BRAINSTORM_R2
        阈值检查：
        - novelty ≥ 7
        - creativity ≥ 7
        - composite ≥ 7
    end note
    
    note right of QA_LOOP
        退出条件：
        - 连续2轮无新问题
        - 或达到最大轮次(6)
    end note
```

---

## 使用说明

### 在 GitHub 上查看

GitHub 原生支持 Mermaid 渲染。直接在仓库中查看本文档即可看到完整的可视化图表。

### 本地渲染

使用支持 Mermaid 的 Markdown 编辑器：
- VS Code + Markdown Preview Mermaid Support 插件
- Obsidian
- Typora
- GitHub Desktop

### 导出为图片

使用 Mermaid CLI：

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i docs/workflow-diagram.md -o docs/workflow-diagram.pdf
```

或使用在线编辑器：
- https://mermaid.live/
- https://mermaid-js.github.io/mermaid-live-editor/
