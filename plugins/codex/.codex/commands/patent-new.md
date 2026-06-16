# /patent-new

<!-- Generated for Codex by oh-my-patent. -->
<!-- Command: patent-new -->

新建专利项目

## Usage In Codex

When the user writes `/patent-new`, follow this command prompt in the current workspace and obey AGENTS.md.

## Prompt

# Command: /patent-new

## Description
Create a new patent project.

## Usage
```
/patent-new <topic>
```

## Parameters
- `topic`: The patent topic/title (required)

## Behavior
1. Scans existing projects directory for next sequence number
2. Creates project directory: `projects/{NN}-{topic_slug}/`
3. Initializes `.patent/state.json` with stage INIT
4. Creates `references/` subdirectory
5. Returns project creation confirmation

## Example
```
/patent-new 基于区块链的跨境支付隐私保护方法
```

## Output
```
Project created: projects/01-blockchain-crossborder-payment
State initialized: INIT stage
```
