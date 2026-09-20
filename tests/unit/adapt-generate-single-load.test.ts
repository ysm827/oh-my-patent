/**
 * REQ-027: `adaptGenerate` must load the portable definition exactly ONCE,
 * no matter how many adapter targets run.
 *
 * The historical implementation called `loadPortableDef` inside the
 * per-target loop, re-reading plugin.jsonc / opencode.jsonc / every agent
 * .md once per target and widening the window for inconsistent definitions
 * across adapters.
 *
 * The loader is injected (`loadDef`) rather than module-mocked: src/cli.ts
 * executes main() at import time and cannot be imported, and a plain
 * injected vi.fn gives the spec's "spy/count assertion" without any mock
 * path-resolution coupling.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { runAdaptGenerate } from '../../src/adapters/run-generate.js';
import { ClaudeCodeAdapter } from '../../src/adapters/claude/index.js';
import { CodexAdapter } from '../../src/adapters/codex/index.js';
import { OpenCodeAdapter } from '../../src/adapters/opencode/index.js';

function makeStubDef() {
  return {
    name: 'oh-my-patent-test',
    version: '0.0.0',
    agents: [
      {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'stub agent for the single-load test',
        role: 'subagent' as const,
        permissions: { write: true, edit: false, bash: false, mcp: false },
        promptFile: 'src/agents/test-agent.md',
        promptContent: 'Stub prompt content.',
      },
    ],
    skills: [],
    commands: [],
    mcpServers: [],
    config: {},
  };
}

describe('runAdaptGenerate loads the definition once (REQ-027)', () => {
  let outputDir: string;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), 'omp-adapt-gen-'));
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    logSpy.mockRestore();
    await rm(outputDir, { recursive: true, force: true });
  });

  test('multi-target generation parses the definition exactly once', async () => {
    const loadDef = vi.fn(async () => makeStubDef());
    const adapters = [new ClaudeCodeAdapter(), new CodexAdapter(), new OpenCodeAdapter()];

    await runAdaptGenerate({
      pluginDir: '/does-not-matter',
      workspaceDir: outputDir,
      outputDir,
      adapters,
      loadDef,
    });

    expect(loadDef).toHaveBeenCalledTimes(1);

    // One success line per target, proving all three actually ran against
    // the single load.
    const lines = logSpy.mock.calls
      .map((args) => String(args[0]))
      .filter((line) => line.startsWith('{'));
    expect(lines).toHaveLength(3);
    for (const line of lines) {
      const parsed = JSON.parse(line) as { ok: boolean; files: number };
      expect(parsed.ok).toBe(true);
      expect(parsed.files).toBeGreaterThan(0);
    }
  });

  test('single-target generation also parses the definition exactly once', async () => {
    const loadDef = vi.fn(async () => makeStubDef());

    await runAdaptGenerate({
      pluginDir: '/does-not-matter',
      workspaceDir: outputDir,
      toolName: 'codex',
      outputDir,
      adapters: [new ClaudeCodeAdapter(), new CodexAdapter(), new OpenCodeAdapter()],
      loadDef,
    });

    expect(loadDef).toHaveBeenCalledTimes(1);
  });

  test('unknown adapter fails with the available list', async () => {
    const loadDef = vi.fn(async () => makeStubDef());

    await expect(runAdaptGenerate({
      pluginDir: '/does-not-matter',
      workspaceDir: outputDir,
      toolName: 'no-such-tool',
      outputDir,
      adapters: [new CodexAdapter()],
      loadDef,
    })).rejects.toThrow(/Unknown adapter: no-such-tool/);
  });
});
