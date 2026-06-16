# Contributing to oh-my-patent

Thank you for considering contributing to oh-my-patent! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or personal attacks
- Publishing others' private information
- Trolling or insulting/derogatory comments
- Other conduct that could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- TypeScript knowledge
- Familiarity with patent drafting workflows (helpful but not required)

### First Contribution

Good first issues are tagged with `good-first-issue`. These are great for getting familiar with the codebase.

Areas where contributions are especially welcome:
- Additional jurisdiction rules (JP, EP, KR)
- Agent prompt improvements
- Test coverage expansion
- Documentation improvements
- Bug fixes

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/oh-my-patent.git
cd oh-my-patent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

### 4. Run Tests

```bash
npm test
```

### 5. Try CLI Locally

```bash
node dist/cli.js --help
```

---

## Project Structure

```
oh-my-patent/
├── src/
│   ├── agents/           # Agent prompt definitions (.md + .ts)
│   ├── commands/         # CLI command implementations
│   ├── core/             # Core engine (path, state, workflow, diagram)
│   ├── adapters/         # Tool adapters (Claude Code, Codex)
│   ├── skills/           # Reusable skills (jurisdiction, quality-gate)
│   └── tui/              # Terminal UI (Ink + React)
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── plugin.jsonc          # Plugin metadata (agents/commands/skills)
└── README.md
```

### Key Modules

- **core/brainstorm-path.ts**: Decision path tracking data structures
- **core/state-manager.ts**: Workflow state machine
- **core/diagram-renderer.ts**: Mermaid/PlantUML rendering
- **adapters/**: Cross-tool configuration generation
- **agents/archimedes.md**: Main orchestrator agent

---

## Making Changes

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `test/` - Test improvements
- `refactor/` - Code refactoring

Examples:
- `feature/add-jp-jurisdiction`
- `fix/windows-atomic-rename`
- `docs/improve-skill-examples`

### Code Style

We use TypeScript strict mode. Key conventions:

```typescript
// ✅ Good: Explicit types, clear naming
export function createInnovationScore(
  novelty: number,
  creativity: number
): InnovationScore {
  return { novelty, creativity, timestamp: Date.now() };
}

// ❌ Avoid: Implicit any, unclear naming
export function create(n, c) {
  return { n, c, t: Date.now() };
}
```

**Conventions**:
- Use camelCase for variables/functions
- Use PascalCase for types/interfaces
- Prefer `const` over `let`
- Always specify function return types
- Add JSDoc comments for public APIs

### Adding a New Agent

1. Create `src/agents/your-agent.md`:
```markdown
---
name: your-agent
description: Brief description
---

You are [Agent Name], responsible for...

## Responsibilities
- Task 1
- Task 2

## Constraints
- Must call real sub-agents
- Must persist results to references/

## Example
[Show usage example]
```

2. Register in `plugin.jsonc`:
```json
{
  "agents": [
    {
      "id": "your-agent",
      "name": "Your Agent",
      "description": "Brief description",
      "file": "src/agents/your-agent.md"
    }
  ]
}
```

3. Add tests in `tests/unit/your-agent.test.ts`

### Adding a New Skill

1. Create `src/skills/your-skill/SKILL.md` with:
   - Overview
   - Usage examples
   - Input/output format
   - Integration notes

2. Implement in `src/skills/your-skill.ts`:
```typescript
export interface YourSkillInput {
  // Define inputs
}

export interface YourSkillOutput {
  // Define outputs
}

export function yourSkill(input: YourSkillInput): YourSkillOutput {
  // Implementation
}
```

3. Register in `plugin.jsonc`

4. Add tests

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test tests/unit/workflow.test.ts

# Watch mode
npm run test:watch
```

### Test Categories

1. **Unit Tests** (`tests/unit/`)
   - Test individual functions/modules
   - Mock external dependencies
   - Fast execution (<100ms per test)

2. **Integration Tests** (`tests/integration/`)
   - Test module interactions
   - May use real file system
   - Moderate execution (100-500ms)

3. **E2E Tests** (`tests/e2e/`)
   - Test complete workflows
   - Real CLI execution
   - Slower (>1s)

### Writing Good Tests

```typescript
// ✅ Good: Descriptive name, clear arrange/act/assert
test('should merge innovation nodes with weighted average scores', () => {
  // Arrange
  const node1 = createNode({ novelty: 8, creativity: 7 });
  const node2 = createNode({ novelty: 6, creativity: 9 });
  
  // Act
  const merged = mergeNodes([node1, node2]);
  
  // Assert
  expect(merged.scores.novelty).toBe(7);
  expect(merged.scores.creativity).toBe(8);
});

// ❌ Avoid: Vague name, no clear structure
test('test merge', () => {
  const result = mergeNodes([n1, n2]);
  expect(result).toBeDefined();
});
```

### Test Coverage Goals

- Core modules: >80%
- Adapters: >70%
- CLI commands: >60%
- Overall: >70%

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Build, dependencies, tooling

### Examples

```bash
feat(jurisdiction): add Japan (JP) jurisdiction rules

- Add JP examination process and timeline
- Add Japanese claim format templates
- Update jurisdiction.test.ts with JP cases

Closes #42

---

fix(state-manager): prevent race condition on Windows

Windows file system requires delay between unlinkSync and renameSync.
Add 10ms delay when platform is win32.

Fixes #38

---

docs(skill): improve prior-art-search examples

Add 3 practical examples with real query patterns
```

### Commit Message Rules

- Subject line: ≤72 characters
- Use imperative mood ("add" not "added")
- No period at end of subject
- Body: wrap at 72 characters
- Reference issues with `Closes #123` or `Fixes #456`

---

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm test`)
2. ✅ TypeScript compiles (`npm run build`)
3. ✅ Linter passes (`npm run lint`)
4. ✅ Code formatted consistently
5. ✅ Documentation updated if needed
6. ✅ Added tests for new features

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. Automated checks run (tests, linting)
2. Maintainer reviews code
3. Address feedback with new commits
4. Maintainer approves and merges

**Review turnaround**: We aim to review within 48 hours

---

## Release Process

Releases follow [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### Release Checklist (Maintainers)

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run full test suite
4. Create git tag: `git tag -a v1.0.0 -m "Release 1.0.0"`
5. Push with tags: `git push origin main --tags`
6. Publish to npm: `npm publish`
7. Create GitHub Release with notes

---

## Questions?

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: (Add maintainer email if public)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to oh-my-patent! 🎉
