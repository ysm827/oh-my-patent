import { describe, expect, test } from 'vitest';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { CodexAdapter } from '../../src/adapters/codex/index';
import { loadPortableDef } from '../../src/adapters/loader';
import type { PortableDef } from '../../src/adapters/types';

/**
 * REQ-006: `generate()` and `getGeneratedFilePaths()` must agree.
 *
 * They used to compute the command-skill directory name independently. `generate()`
 * appended `-command` when a command id collided with an agent id, the listing did
 * not, so the real file was written to `skills/archimedes-command/SKILL.md` while
 * the listing named `skills/archimedes/SKILL.md` -- twice. Uninstall therefore left
 * `archimedes-command/SKILL.md` behind forever.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginDir = join(__dirname, '../..');
const workspaceDir = join(pluginDir, '..');

describe('CodexAdapter generated-path consistency (REQ-006)', () => {
  test('the repository definition: both listings are the same set', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const adapter = new CodexAdapter();

    const result = await adapter.generate(def, {});
    const generated = [...result.files.keys()].sort();
    const listed = [...adapter.getGeneratedFilePaths(def)].sort();

    // Set equality, deliberately not "listed contains generated": a duplicate in
    // the listing used to hide the missing path from a containment check.
    expect(listed).toEqual(generated);
  });

  test('archimedes collides in the real definition and is listed as -command', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const adapter = new CodexAdapter();
    const result = await adapter.generate(def, {});

    const agentIds = new Set(def.agents.map((agent) => agent.id));
    const colliding = def.commands.filter((command) => agentIds.has(command.id));
    expect(colliding.map((command) => command.id)).toContain('archimedes');

    const collidedSkill = join('plugins', 'oh-my-patent', 'skills', 'archimedes-command', 'SKILL.md');
    expect(result.files.has(collidedSkill)).toBe(true);
    expect(adapter.getGeneratedFilePaths(def)).toContain(collidedSkill);
  });

  test('a synthetic collision is handled the same way by both methods', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const adapter = new CodexAdapter();

    // Pick an agent id that is not already a command id, then give a command that
    // same id -- so this tests the rule, not the one hard-coded archimedes case.
    const commandIds = new Set(def.commands.map((command) => command.id));
    const freeAgent = def.agents.find((agent) => !commandIds.has(agent.id));
    expect(freeAgent, 'no free agent id available to build the fixture').toBeDefined();

    const mutated: PortableDef = structuredClone(def);
    const targetId = (freeAgent as { id: string }).id;
    mutated.commands[0].id = targetId;

    const result = await adapter.generate(mutated, {});
    const generated = [...result.files.keys()].sort();
    const listed = [...adapter.getGeneratedFilePaths(mutated)].sort();

    expect(listed).toEqual(generated);
    expect(generated).toContain(join('plugins', 'oh-my-patent', 'skills', `${targetId}-command`, 'SKILL.md'));
    // The agent keeps the unsuffixed directory.
    expect(generated).toContain(join('plugins', 'oh-my-patent', 'skills', targetId, 'SKILL.md'));
  });

  test('without a collision the suffix is not added', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const adapter = new CodexAdapter();
    const result = await adapter.generate(def, {});

    const agentIds = new Set(def.agents.map((agent) => agent.id));
    const nonColliding = def.commands.filter((command) => !agentIds.has(command.id));
    expect(nonColliding.length).toBeGreaterThan(0);

    for (const command of nonColliding) {
      const plain = join('plugins', 'oh-my-patent', 'skills', command.id, 'SKILL.md');
      expect(result.files.has(plain)).toBe(true);
      expect(result.files.has(join('plugins', 'oh-my-patent', 'skills', `${command.id}-command`, 'SKILL.md'))).toBe(false);
    }
  });
});
