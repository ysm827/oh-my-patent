import { describe, expect, test } from 'vitest';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CodexAdapter } from '../../src/adapters/codex/index';
import { loadPortableDef } from '../../src/adapters/loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pluginDir = join(__dirname, '../..');
const workspaceDir = join(pluginDir, '..');

describe('CodexAdapter', () => {
  test('generates Codex prompt catalog and manifest entries', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const adapter = new CodexAdapter();
    const result = await adapter.generate(def, { jurisdiction: 'CN', projectDir: './projects' });

    expect(result.files.has(join('.codex', 'agents', 'archimedes.md'))).toBe(true);
    expect(result.files.has(join('.codex', 'commands', 'patent-new.md'))).toBe(true);
    expect(result.files.has(join('.codex', 'skills', 'brainstorm-path', 'SKILL.md'))).toBe(true);
    expect(result.files.has(join('.agents', 'plugins', 'marketplace.json'))).toBe(true);
    expect(result.files.has(join('plugins', 'oh-my-patent', '.codex-plugin', 'plugin.json'))).toBe(true);
    expect(result.files.has(join('plugins', 'oh-my-patent', 'skills', 'patent-new', 'SKILL.md'))).toBe(true);
    expect(result.files.has(join('plugins', 'oh-my-patent', 'skills', 'archimedes', 'SKILL.md'))).toBe(true);
    expect(result.files.has(join('plugins', 'oh-my-patent', 'skills', 'archimedes-command', 'SKILL.md'))).toBe(true);
    expect(result.files.has('AGENTS.md')).toBe(true);
    expect(result.files.has('codex.json')).toBe(true);

    const manifest = JSON.parse(result.files.get('codex.json') ?? '{}');
    expect(manifest.adapter).toBe('codex');
    expect(manifest.instructionsFile).toBe('AGENTS.md');
    expect(manifest.promptCatalog.agentsDir).toBe('.codex/agents');
    expect(manifest.agents.archimedes.promptFile).toContain('archimedes.md');
    expect(manifest.commands['patent-new'].promptFile).toContain('patent-new.md');
    expect(manifest.skills['brainstorm-path'].promptFile).toContain('brainstorm-path');

    for (const skill of def.skills) {
      const skillContent = result.files.get(join('.codex', 'skills', skill.id, 'SKILL.md')) ?? '';
      expect(skillContent).toMatch(/^---\r?\nname: [a-z0-9-]+\r?\ndescription: .+\r?\n---\r?\n/);
      expect(result.files.get(join('plugins', 'oh-my-patent', 'skills', skill.id, 'SKILL.md'))).toBe(skillContent);
    }

    const plugin = JSON.parse(result.files.get(join('plugins', 'oh-my-patent', '.codex-plugin', 'plugin.json')) ?? '{}');
    expect(plugin.name).toBe('oh-my-patent');
    expect(plugin.skills).toBe('./skills/');

    const marketplace = JSON.parse(result.files.get(join('.agents', 'plugins', 'marketplace.json')) ?? '{}');
    expect(marketplace.plugins[0].name).toBe('oh-my-patent');
    expect(marketplace.plugins[0].source.path).toBe('./plugins/oh-my-patent');
  });

  test('AGENTS.md documents Codex version compatibility', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const adapter = new CodexAdapter();
    const result = await adapter.generate(def, { jurisdiction: 'CN', projectDir: './projects' });
    const agentsMd = result.files.get('AGENTS.md') ?? '';

    expect(agentsMd).toContain('Codex version compatibility rule');
    expect(agentsMd).toContain('.codex/agents/');
    expect(agentsMd).toContain('do not assume every Codex CLI version supports `codex --agent`');
  });

  // ==========================================================================
  // REQ-031: codex.json 安全默认值与可配置项
  // ==========================================================================

  test('codex.json uses conservative defaults: no sandbox:false, model/provider configurable (REQ-031)', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const adapter = new CodexAdapter();
    const result = await adapter.generate(def, {});

    const manifest = JSON.parse(result.files.get('codex.json') ?? '{}');
    // 旧默认 sandbox:false 是安全倒退；现在必须是保守沙箱模式
    expect(manifest.sandbox).not.toBe(false);
    expect(manifest.sandbox).toBe('workspace-write');
    // approvalMode 保持保守
    expect(manifest.approvalMode).toBe('suggest');
    // model/provider 是示例默认值，可经 config 覆盖
    expect(manifest.model).toBe('o4-mini');
    expect(manifest.provider).toBe('openai');
  });

  test('codex.json model/provider can be overridden through config (REQ-031)', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const adapter = new CodexAdapter();
    const result = await adapter.generate(def, { codexModel: 'gpt-5-codex', codexProvider: 'openai' });

    const manifest = JSON.parse(result.files.get('codex.json') ?? '{}');
    expect(manifest.model).toBe('gpt-5-codex');
    expect(manifest.provider).toBe('openai');
  });
});
