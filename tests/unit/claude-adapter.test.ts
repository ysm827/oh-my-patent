import { describe, expect, test } from 'vitest';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { ClaudeCodeAdapter } from '../../src/adapters/claude/index';
import { loadPortableDef } from '../../src/adapters/loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pluginDir = join(__dirname, '../..');
const workspaceDir = join(pluginDir, '..');

describe('ClaudeCodeAdapter', () => {
  test('generates valid frontmatter for every agent and command', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const result = await new ClaudeCodeAdapter().generate(def, { jurisdiction: 'CN', projectDir: './projects' });

    for (const agent of def.agents) {
      const content = result.files.get(join('.claude', 'agents', `${agent.id}.md`)) ?? '';
      expect(content).toMatch(/^---\n/);
      expect(content).toContain(`name: ${JSON.stringify(agent.id)}\n`);
      expect(content).toContain(`description: ${JSON.stringify(agent.description)}\n`);
      expect(content).toMatch(/^---\n[\s\S]*?\n---\n/);
      if (!agent.permissions.bash && !agent.permissions.mcp) {
        expect(content).toContain('tools: "Read, Glob, Grep');
      }
    }

    expect(def.agents.find(agent => agent.id === 'patent-landscape-analyst')?.permissions.mcp).toBe(true);
    expect(def.agents.find(agent => agent.id === 'patent-disclosure-writer')?.permissions.edit).toBe(true);

    for (const command of def.commands) {
      const content = result.files.get(join('.claude', 'commands', `${command.id}.md`)) ?? '';
      expect(content).toMatch(/^---\ndescription: ".+"\n---\n/);
    }
  });

  // ==========================================================================
  // REQ-030: tools 与 permissions 的确定映射，禁止权限放大
  // ==========================================================================

  test('never emits the "*" tools wildcard (REQ-030)', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const result = await new ClaudeCodeAdapter().generate(def, {});

    for (const agent of def.agents) {
      const content = result.files.get(join('.claude', 'agents', `${agent.id}.md`)) ?? '';
      expect(content).not.toContain('tools: "*"');
      expect(content).toMatch(/^tools: "/m); // tools 仍精确列举
    }
  });

  test('maps bash permission to the Bash tool and mcp permission to mcp__<server> entries (REQ-030)', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const result = await new ClaudeCodeAdapter().generate(def, {});

    // archimedes 声明 write/edit/bash/mcp（HTML 注释 frontmatter）
    const archimedes = def.agents.find(a => a.id === 'archimedes');
    expect(archimedes?.permissions.bash).toBe(true);
    const archimedesContent = result.files.get(join('.claude', 'agents', 'archimedes.md')) ?? '';
    expect(archimedesContent).toContain('Write');
    expect(archimedesContent).toContain('Edit');
    expect(archimedesContent).toContain('Bash');
    // MCP 权限 → 每个 enabled server 一个官方通配条目
    expect(archimedesContent).toMatch(/mcp__[\w-]+/);

    // 纯只读 agent 不应获得 Bash
    const readOnly = def.agents.find(a => !a.permissions.bash && !a.permissions.write && !a.permissions.edit && !a.permissions.mcp);
    if (readOnly) {
      const readOnlyContent = result.files.get(join('.claude', 'agents', `${readOnly.id}.md`)) ?? '';
      expect(readOnlyContent).toContain('tools: "Read, Glob, Grep"');
      expect(readOnlyContent).not.toContain('Bash');
    }
  });
});
