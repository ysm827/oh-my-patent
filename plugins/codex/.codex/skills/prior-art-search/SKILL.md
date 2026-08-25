---
name: prior-art-search
description: Use when searching patents and technical literature for prior art, novelty, or patentability assessment.
---

# Prior Art Search Skill

Search existing patents and technical literature.

## Usage

This skill integrates with MCP servers (Google Scholar, USPTO, Semantic Scholar) to search for prior art.

## Input

- Query keywords
- Search scope (default: last 5 years)
- Max results per source (default: 5)

## Output

- `references/landscape_{topic_slug}.md`: Aggregated search results
- `references/{source}_{id}.md`: Individual evidence cards

## MCP Dependencies

- `google_scholar`: Academic literature
- `uspto_patent`: US patent database
- `semantic_scholar`: Academic papers
