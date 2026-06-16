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
