---
name: patent-status
description: Use when the user invokes /patent-status or asks to 查看项目状态.
---

# /patent-status

Follow AGENTS.md and execute this oh-my-patent slash-command workflow in the current workspace.

# Command: /patent-status

## Description
Show current project status and progress.

## Usage
```
/patent-status
```

## Behavior
1. Reads .patent/state.json
2. Displays current stage and completed stages
3. Shows available next actions

## Output
```
Project: projects/01-blockchain-crossborder-payment
Topic: 基于区块链的跨境支付隐私保护方法
Jurisdiction: CN

Current Stage: QA_LOOP
Completed: INIT, RESEARCH, BRAINSTORM_R1, BRAINSTORM_R2, DRAFT

Next Actions:
- Continue QA loop (2 rounds completed)
- Proceed to FINAL_REVIEW
```
