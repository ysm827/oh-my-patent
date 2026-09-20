/**
 * Brainstorm path layout constants (REQ-040).
 *
 * Single definition point for the `.brainstorm/` on-disk layout. Before this
 * module, `src/commands/path-branch.ts` and `src/core/path-persistence.ts`
 * each declared their own copies (`BRANCHES_DIR` / `INDEX_FILE` vs
 * `BRAINSTORM_DIR` / `NODES_DIR` / `SNAPSHOTS_DIR`), so a layout change had to
 * touch several modules and could silently drift (same defect class as
 * REQ-017's four jurisdiction lists).
 *
 * Layout (mirrors the generated `projects/{NN}-{slug}/.brainstorm/`):
 *
 * ```text
 * <projectPath>/.brainstorm/
 * ├── path.json
 * ├── nodes/round-{n}.json
 * ├── snapshots/round-{n}-innovations.json
 * └── branches/
 *     ├── index.json
 *     ├── {branchId}.json
 *     └── {branchId}/.brainstorm/{nodes,snapshots}/   (self-contained, REQ-026)
 * ```
 */

/** Project-level brainstorm directory name. */
export const BRAINSTORM_DIR = '.brainstorm';

/** Path metadata file name, inside {@link BRAINSTORM_DIR}. */
export const PATH_FILE = 'path.json';

/** Per-round node directory name, inside {@link BRAINSTORM_DIR}. */
export const NODES_DIR = 'nodes';

/** Innovation snapshot directory name, inside {@link BRAINSTORM_DIR}. */
export const SNAPSHOTS_DIR = 'snapshots';

/** Branch directory name, inside {@link BRAINSTORM_DIR}. */
export const BRANCHES_DIR = 'branches';

/** Branch index file name, inside {@link BRANCHES_DIR}. */
export const BRANCH_INDEX_FILE = 'index.json';
