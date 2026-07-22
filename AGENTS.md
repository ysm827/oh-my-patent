# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript ESM CLI and multi-platform patent workflow plugin. Runtime code is under `src/`:

- `src/core/` contains workflow, state, validation, path persistence, and diagram logic.
- `src/commands/` contains exported command handlers; `src/agents/` and `src/skills/` contain agent and skill definitions.
- `src/adapters/` provides Claude Code/Codex integrations, while `src/tui/` contains the Ink/React terminal UI.
- `plugin.jsonc` describes packaged plugin metadata. Keep generated `dist/` output out of source edits.
- Tests mirror behavior in `tests/unit/`, `tests/integration/`, and `tests/e2e/`; design and workflow references live in `docs/`.

## Build, Test, and Development Commands

Run `npm install` with Node.js 18+ and npm 9+ to install dependencies. Use:

- `npm run build` to compile strict TypeScript into `dist/` with declarations and source maps.
- `npm test` to run the Vitest suite once; pass a path such as `npm test tests/unit/workflow.test.ts` to target a file.
- `npm run test:watch` for interactive test development.
- `npm run lint` to type-check with `tsc --noEmit`.
- `node dist/cli.js --help` after building to exercise the local CLI.

## Coding Style & Naming Conventions

Follow the strict settings in `tsconfig.json`. Use two-space indentation, `camelCase` for variables/functions, `PascalCase` for types/classes, and `UPPER_SNAKE_CASE` only for constants. Prefer `const`, explicit public return types, and `.js` extensions in ESM imports. Keep public APIs documented with concise JSDoc. No separate formatter is configured; keep formatting consistent with nearby files.

## Testing Guidelines

Write Vitest tests with descriptive behavior names (`should ...` or a specific outcome) and clear arrange/act/assert structure. Put isolated logic in `tests/unit/`, cross-module or filesystem behavior in `tests/integration/`, and complete CLI/plugin flows in `tests/e2e/`. New behavior should include tests; preserve the project targets of at least 80% core, 70% adapters, and 60% CLI coverage where practical.

## Commit & Pull Request Guidelines

Use Conventional Commits, for example `feat(jurisdiction): add JP rules` or `fix(state-manager): handle Windows rename`. Keep subjects imperative, under 72 characters, and without a trailing period. PRs should explain behavior and scope, link issues when applicable, list tests and manual checks, and update relevant README/docs or plugin metadata. Before requesting review, run `npm test`, `npm run build`, and `npm run lint`.

## Security & Configuration Tips

Do not commit credentials, generated reports, temporary workflow state, or local plugin caches. Review changes to adapter configuration and `plugin.jsonc` carefully because they affect generated integrations and published package contents.
