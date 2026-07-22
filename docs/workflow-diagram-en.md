# oh-my-patent Workflow Diagrams

This document provides visual workflow diagrams for oh-my-patent.

## End-to-End Workflow

```mermaid
graph TD
    Start([User proposes technical topic]) --> Init[INIT: Initialize project]
    Init --> InitFiles[Create .patent/state.json<br/>.brainstorm/path.json]
    
    InitFiles --> Research[RESEARCH: Patent search]
    Research --> Landscape[landscape-analyst<br/>→ references/landscape.md]
    
    Landscape --> BrainstormR1[BRAINSTORM R1: Round 1]
    BrainstormR1 --> Architect[innovation-architect<br/>Generate candidates]
    BrainstormR1 --> Adversarial[adversarial-examiner<br/>Attack vulnerabilities]
    Architect --> Score1[Scoring + snapshots]
    Adversarial --> Score1
    Score1 --> Node1[.brainstorm/nodes/round-1.json]
    
    Node1 --> BrainstormR2[BRAINSTORM R2: Round 2 Deep assessment]
    BrainstormR2 --> Security[security-engineer<br/>Security review]
    BrainstormR2 --> Compliance[compliance-analyst<br/>Compliance check]
    BrainstormR2 --> Evaluator[patentability-evaluator<br/>Patentability assessment]
    Security --> Score2[Combined scoring]
    Compliance --> Score2
    Evaluator --> Score2
    
    Score2 --> Threshold{Threshold check<br/>novelty ≥ 7<br/>creativity ≥ 7}
    Threshold -->|Failed| BrainstormR1
    Threshold -->|Passed| Draft[DRAFT: Write initial disclosure]
    
    Draft --> Writer[patent-disclosure-writer<br/>→ MAIN.md]
    
    Writer --> QALoop[QA_LOOP: Review-rebuttal cycle]
    QALoop --> Reviewer[patent-disclosure-reviewer<br/>Raise issues]
    Reviewer --> Issues{New issues?}
    Issues -->|Yes| Responder[patent-technical-responder<br/>Write revisions]
    Responder --> QACount{Round ≤ 6?}
    QACount -->|Yes| QALoop
    QACount -->|No| FinalReview
    Issues -->|No, 2 clean rounds| FinalReview[FINAL_REVIEW: Final pass]
    
    FinalReview --> FinalDecision{Pass?}
    FinalDecision -->|Loop back| QALoop
    FinalDecision -->|Pass| Diagram[DIAGRAM: Render figures]
    
    Diagram --> DiagramRenderer[diagram-renderer<br/>Mermaid/PlantUML → SVG+PNG]
    DiagramRenderer --> FiguresDir[figures/ + update MAIN.md]
    
    FiguresDir --> QualityGate[DONE: Quality gate]
    QualityGate --> Complete([✅ Complete])
    
    %% Branch operations
    Node1 -.->|path branch| Branch[Create branch to explore]
    Score2 -.->|path restore| Restore[Revive discarded innovation]
    
    %% Crash recovery
    Research -.->|Crash| Recovery[Recover from state.json]
    BrainstormR1 -.->|Crash| Recovery
    Draft -.->|Crash| Recovery
    QALoop -.->|Crash| Recovery
    Recovery -.-> Resume[Resume from exact breakpoint]
    
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

## System Architecture

```mermaid
graph TB
    subgraph User["User Interface Layer"]
        CLI[CLI Commands]
        TUI[TUI Interactive UI]
        Editor[Editor Plugins<br/>Claude Code / Codex]
    end
    
    subgraph Orchestration["Orchestration Layer"]
        Archimedes[Archimedes<br/>Primary Orchestrator]
        Agents[11 Specialist Agents]
        Skills[Reusable Skills]
        Commands[CLI Command Definitions]
    end
    
    subgraph Engine["Core Engine Layer"]
        PathEngine[Decision Path Engine<br/>brainstorm-path.ts]
        StateEngine[State Machine Engine<br/>state-manager.ts]
        DiagramEngine[Diagram Renderer<br/>diagram-renderer.ts]
        ThresholdEngine[Threshold Evaluator<br/>threshold-config.ts]
        WorkflowEngine[Workflow Orchestrator<br/>workflow.ts]
    end
    
    subgraph Adapters["Adapter Layer"]
        ClaudeAdapter[Claude Code Adapter]
        CodexAdapter[Codex Adapter]
        Loader[Config Loader]
    end
    
    subgraph Storage["Persistent Storage"]
        PathStorage[.brainstorm/<br/>Decision path data]
        StateStorage[.patent/<br/>Workflow state]
        References[references/<br/>Agent outputs]
        Figures[figures/<br/>Rendered diagrams]
        MainDoc[MAIN.md<br/>Disclosure document]
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

## Agent Collaboration

```mermaid
graph LR
    subgraph Input["Input Stage"]
        User[User] --> Topic[Technical Topic]
    end
    
    subgraph Search["Search Stage"]
        Topic --> Analyst[patent-landscape-analyst]
        Analyst --> Landscape[landscape.md]
    end
    
    subgraph Brainstorm["Brainstorm Stage"]
        Landscape --> Architect[patent-innovation-architect]
        Architect --> Innovations[Innovation Candidates]
        
        Innovations --> Adversarial[patent-adversarial-examiner]
        Innovations --> Security[patent-security-engineer]
        Innovations --> Compliance[patent-product-compliance-analyst]
        Innovations --> Evaluator[patentability-evaluator]
        
        Adversarial --> Scores[Combined Scores]
        Security --> Scores
        Compliance --> Scores
        Evaluator --> Scores
    end
    
    subgraph Draft["Draft Stage"]
        Scores --> Writer[patent-disclosure-writer]
        Writer --> MainMd[MAIN.md Draft]
    end
    
    subgraph QA["Review Stage"]
        MainMd --> Reviewer[patent-disclosure-reviewer]
        Reviewer --> Issues[Issue List]
        Issues --> Responder[patent-technical-responder]
        Responder --> Revision[Revised Version]
        Revision --> Reviewer
    end
    
    subgraph Finalize["Finalize Stage"]
        Revision --> Moderator[patent-brainstorm-moderator]
        Moderator --> Final[Final Version]
        Final --> Recorder[patent-path-recorder]
        Recorder --> Complete[✅ Complete]
    end
    
    style Input fill:#e1f5ff
    style Search fill:#fff9c4
    style Brainstorm fill:#ffccbc
    style Draft fill:#c8e6c9
    style QA fill:#f3e5f5
    style Finalize fill:#b2dfdb
```

## Decision Path Data Structure

```mermaid
graph TD
    Path[BrainstormPath] --> Metadata[Metadata<br/>projectId, topic, status]
    Path --> Nodes[Node List<br/>nodes: string[]]
    Path --> Edges[Edge List<br/>edges: Edge[]]
    Path --> Current[Current Node<br/>currentNodeId]
    Path --> Final[Final Decision<br/>finalDecision]
    
    Nodes --> Node1[Round 1 Node]
    Nodes --> Node2[Round 2 Node]
    Nodes --> NodeN[Round N Node]
    
    Node1 --> NodeData[Node Data]
    NodeData --> AgentOutputs[Agent Outputs]
    NodeData --> Innovations[Innovation List]
    NodeData --> Scores[Scoring Data]
    NodeData --> Decision[Decision Record]
    
    Edges --> Edge1[Edge 1]
    Edge1 --> Transform[Transformation Type<br/>refine/merge/split/pivot]
    Edge1 --> Changes[Change Description]
    
    style Path fill:#e3f2fd
    style Metadata fill:#fff9c4
    style NodeData fill:#c8e6c9
    style Transform fill:#f3e5f5
```

## File System Layout

```mermaid
graph TD
    Root[Project Root] --> Brainstorm[.brainstorm/<br/>Decision path]
    Root --> Patent[.patent/<br/>Workflow state]
    Root --> Refs[references/<br/>Agent outputs]
    Root --> Figs[figures/<br/>Rendered diagrams]
    Root --> Main[MAIN.md]
    Root --> Conv[conversation.md]
    
    Brainstorm --> PathJson[path.json<br/>Path metadata]
    Brainstorm --> NodesDir[nodes/<br/>Per-round data]
    Brainstorm --> SnapshotsDir[snapshots/<br/>Innovation snapshots]
    Brainstorm --> BranchesDir[branches/<br/>Branch copies]
    
    Patent --> StateJson[state.json<br/>Current stage]
    
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

## Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> INIT: User proposes topic
    INIT --> RESEARCH: Initialization complete
    RESEARCH --> BRAINSTORM_R1: Search complete
    BRAINSTORM_R1 --> BRAINSTORM_R2: Round 1 complete
    BRAINSTORM_R2 --> BRAINSTORM_R1: Threshold failed
    BRAINSTORM_R2 --> DRAFT: Threshold passed
    DRAFT --> QA_LOOP: Draft complete
    QA_LOOP --> QA_LOOP: New issues & round ≤ 6
    QA_LOOP --> FINAL_REVIEW: 2 clean rounds
    FINAL_REVIEW --> QA_LOOP: Loop back
    FINAL_REVIEW --> DIAGRAM: Review passed
    DIAGRAM --> DONE: Figures rendered
    DONE --> [*]: Quality gate passed
    
    note right of INIT
        Create directory structure
        Initialize state.json
        Initialize path.json
    end note
    
    note right of BRAINSTORM_R2
        Threshold checks:
        - novelty ≥ 7
        - creativity ≥ 7
        - composite ≥ 7
    end note
    
    note right of QA_LOOP
        Exit conditions:
        - 2 consecutive clean rounds
        - Or max rounds reached (6)
    end note
```

---

## Viewing Instructions

### On GitHub

GitHub natively supports Mermaid rendering. View this document in the repository to see the full visualizations.

### Local Rendering

Use a Markdown editor with Mermaid support:
- VS Code + Markdown Preview Mermaid Support extension
- Obsidian
- Typora
- GitHub Desktop

### Export as Images

Using Mermaid CLI:

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i docs/workflow-diagram-en.md -o docs/workflow-diagram-en.pdf
```

Or use online editors:
- https://mermaid.live/
- https://mermaid-js.github.io/mermaid-live-editor/
