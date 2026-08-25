import { describe, expect, test } from 'vitest';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadPortableDef } from '../../src/adapters/loader';

const __filename = fileURLToPath(import.meta.url);
const pluginDir = join(dirname(__filename), '../..');

describe('skill definitions', () => {
  test('include OpenCode-compatible YAML frontmatter', async () => {
    const def = await loadPortableDef({ pluginDir });

    for (const skill of def.skills) {
      expect(skill.promptContent).toMatch(
        new RegExp(`^---\\r?\\nname: ${skill.id}\\r?\\ndescription: .+\\r?\\n---\\r?\\n`),
      );
    }
  });
});
