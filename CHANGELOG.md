# Changelog

All notable changes to this project are documented here.

## [0.2.0] - 2026-07-22

### Added

- Added structured schemas for landscape search results, feature matrices, and problem maps.
- Added initialization checks and a patent-init sentinel for resumable workflows.
- Added MCP configuration support for Claude Code, Codex, and OpenCode adapters.
- Added retrieval workflow commands and fallback routing behavior.
- Added unit and integration coverage for the new retrieval and initialization behavior.

### Changed

- Improved patent search query extraction and output validation.
- Updated the Archimedes workflow and retrieval-related agent and skill definitions.
- Removed tracked dependency artifacts from the repository; dependencies are installed from the lockfile.

### Verification

- 123 tests passing.
- `npm run build` passing.
- `npm run lint` passing.
