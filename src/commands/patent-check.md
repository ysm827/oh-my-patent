# /patent-check

Run environment readiness check before starting or resuming a patent project.

## Usage

```
/patent-check [project-path]
```

If no project path is given, checks the current workspace.

## What It Does

1. Detects which adapter (Claude Code / Codex / OpenCode) is active
2. Checks all configured MCP servers against required list:
   - google_scholar (required)
   - uspto_patent (recommended)
   - semantic_scholar (optional)
   - cnipa_patent (recommended for CN jurisdiction)
3. Checks external tools:
   - mmdc (Mermaid CLI) - blocking if missing
   - PlantUML server reachability
   - git
4. Checks runtime:
   - Node.js version >= 18
   - Workspace directory writable
5. Scans existing projects in projects/ directory:
   - Validates state.json for each project
   - Reports current stage

## Output

The check produces a structured report to the terminal and optionally writes it to `references/init-report.md` if a project path is provided.

## Behavior

- Does NOT modify any configuration files
- Does NOT install missing tools or MCP servers
- Provides setup guidance for missing items
- Only `mmdc` and `git` missing will block the workflow
- Missing MCP servers produce warnings, not blocks

## Integration

- Runs automatically at INIT stage via the `patent-init-sentinel` agent
- Can be run manually anytime via this command
- Report can be consumed by `archimedes` to decide whether to proceed to RESEARCH
