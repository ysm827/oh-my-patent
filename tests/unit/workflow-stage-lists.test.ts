import { describe, expect, test } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { ClaudeCodeAdapter } from '../../src/adapters/claude/index';
import { CodexAdapter } from '../../src/adapters/codex/index';
import { loadPortableDef } from '../../src/adapters/loader';
import { WorkflowStage, WORKFLOW_STAGE_ORDER } from '../../src/core/workflow';

/**
 * REQ-012: prompt text must not drift from the workflow state machine.
 *
 * The generated prompts used to carry their own 8-item literal
 * (`... → QA_LOOP → FINAL_REVIEW → DIAGRAM → DONE`) while the machine had 10
 * stages; `DIAGRAM_DRAFT` and `DIAGRAM_FINAL` were missing and a stage named
 * `DIAGRAM` that never existed was shown instead. These tests compare the
 * generated text against the enum rather than against another literal.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginDir = join(__dirname, '../..');
const workspaceDir = join(pluginDir, '..');

/** The exact line the adapters must emit. */
const EXPECTED_SEQUENCE = WORKFLOW_STAGE_ORDER.join(' → ');

/**
 * Pull the arrow sequence out of a document: a line made only of stage names.
 *
 * The character class must allow digits — `BRAINSTORM_R1` / `BRAINSTORM_R2`
 * contain them. Omitting `0-9` made this helper return `null` even though the
 * emitted line was already correct, i.e. it failed as a false negative.
 */
function extractStageSequence(markdown: string): string[] | null {
  const match = markdown.match(/^([A-Z][A-Z0-9_]* → [A-Z0-9_ →]+)$/m);
  return match ? match[1].split(' → ') : null;
}

describe('workflow stage lists in prompts (REQ-012)', () => {
  test('the canonical order matches the WorkflowStage enum exactly', () => {
    expect(WORKFLOW_STAGE_ORDER).toEqual([
      'INIT',
      'RESEARCH',
      'BRAINSTORM_R1',
      'BRAINSTORM_R2',
      'DRAFT',
      'DIAGRAM_DRAFT',
      'QA_LOOP',
      'FINAL_REVIEW',
      'DIAGRAM_FINAL',
      'DONE',
    ]);
    // No stage of the enum may be missing from the canonical order, and none
    // may be invented.
    expect([...WORKFLOW_STAGE_ORDER].sort()).toEqual(
      (Object.values(WorkflowStage) as string[]).sort(),
    );
  });

  test('CLAUDE.md carries all 10 stages', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const result = await new ClaudeCodeAdapter().generate(def, {});

    const claudeMd = result.files.get('CLAUDE.md') ?? '';
    expect(claudeMd).toContain(EXPECTED_SEQUENCE);
    expect(extractStageSequence(claudeMd)).toEqual([...WORKFLOW_STAGE_ORDER]);
    expect(claudeMd).not.toContain('DIAGRAM → DONE');
  });

  test('AGENTS.md carries all 10 stages', async () => {
    const def = await loadPortableDef({ pluginDir, workspaceDir });
    const result = await new CodexAdapter().generate(def, {});

    const agentsMd = result.files.get('AGENTS.md') ?? '';
    expect(agentsMd).toContain(EXPECTED_SEQUENCE);
    expect(extractStageSequence(agentsMd)).toEqual([...WORKFLOW_STAGE_ORDER]);
    expect(agentsMd).not.toContain('DIAGRAM → DONE');
  });

  test('the /archimedes command prompt names every stage', () => {
    const md = readFileSync(join(pluginDir, 'src/commands/archimedes.md'), 'utf-8');
    for (const stage of WORKFLOW_STAGE_ORDER) {
      expect(md).toContain(`\`${stage}\``);
    }
  });
});
