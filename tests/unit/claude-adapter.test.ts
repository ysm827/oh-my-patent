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
});
