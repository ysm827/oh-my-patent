---
name: patent-draft
description: Use when the user invokes /patent-draft or asks to 生成交底书.
---

# /patent-draft

Follow AGENTS.md and execute this oh-my-patent slash-command workflow in the current workspace.

# Command: /patent-draft

## Description
Generate or revise patent disclosure document.

## Usage
```
/patent-draft
```

## Behavior
1. Reads selected innovation from state
2. Uses Patent Writer agent to generate MAIN.md
3. Updates state to DRAFT stage

## Prerequisites
- Project must be in BRAINSTORM_R2 or later stage
- Innovation point must be selected

## Output
```
Disclosure generated: MAIN.md
Stage updated: DRAFT
```
