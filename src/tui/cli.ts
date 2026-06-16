#!/usr/bin/env node
/**
 * Brainstorm Path TUI - CLI entry point
 *
 * Usage:
 *   npx oh-my-patent tui [project-path]
 *   node dist/tui/cli.js [project-path]
 *
 * If no project-path is given, uses current directory.
 */

import { resolve } from 'path';
import { startTUI } from './app.js';

const projectPath = resolve(process.argv[2] || '.');

startTUI(projectPath).catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
