# Command: /patent-review

## Description
Review patent disclosure for quality and compliance.

## Usage
```
/patent-review
```

## Behavior
1. Reads MAIN.md from project directory
2. Uses Patent Reviewer agent to analyze
3. Generates review feedback
4. Updates state if issues found

## Prerequisites
- MAIN.md must exist
- Project must be in DRAFT or QA_LOOP stage

## Output
```
Review completed: 3 issues found
- ERROR: Missing independent claim
- WARNING: Abstract length exceeds 300 characters
- INFO: Consider adding more embodiments
```
