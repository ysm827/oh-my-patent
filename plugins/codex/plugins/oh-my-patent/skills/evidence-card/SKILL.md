---
name: evidence-card
description: Use when creating standardized evidence cards for patents, papers, standards, or other prior-art references.
---

# Evidence Card Skill

Generate standardized evidence cards for prior art references.

## Usage

Creates structured evidence cards in `references/` directory.

## Card Format

```markdown
# Evidence Card: {ID}

## Source
- Database: {source}
- ID: {identifier}
- URL: {url}

## Content
- Title: {title}
- Abstract: {abstract}
- Claims Summary: {claims_summary}

## Relevance
- Key Features: {key_features}
- Differences: {differences}
```

## Output

- `references/{source}_{id}.md`: Individual evidence card
