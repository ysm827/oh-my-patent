import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiagramRenderer } from '../../src/core/diagram-renderer';
import { insertFigureReferences } from '../../src/core/diagram-inserter';
import { FigureSpec, ManifestEntry } from '../../src/core/diagram-types';
import { readFileSync, existsSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';

// ============================================================================
// Mocks
// ============================================================================

const mockExecFile = vi.fn();
vi.mock('child_process', () => ({
  execFile: (...args: any[]) => mockExecFile(...args),
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// ============================================================================
// 测试数据
// ============================================================================

const MAIN_MD = `# 专利交底书

## 技术领域

本发明涉及量子安全支付系统。

## 附图说明

（待补充）

## 具体实施方式

本发明的具体实施方式如下...
`;

const SPECS: FigureSpec[] = [
  {
    figureId: 'fig1_system_architecture',
    figureNumber: 1,
    title: '系统整体架构图',
    description: '展示系统各模块及其交互关系',
    diagramType: 'architecture',
    engine: 'mermaid',
    source: 'graph TB\n  A[Issuer] --> B[Payer]\n  B --> C[POS]',
    phase: 'draft',
  },
  {
    figureId: 'fig2_payment_flow',
    figureNumber: 2,
    title: '离线支付流程图',
    description: '展示离线支付的完整流程',
    diagramType: 'flowchart',
    engine: 'mermaid',
    source: 'flowchart TB\n  Start --> Challenge --> Response --> Verify',
    phase: 'draft',
  },
  {
    figureId: 'fig3_sequence',
    figureNumber: 3,
    title: '交互时序图',
    description: '展示各方的交互时序',
    diagramType: 'sequence',
    engine: 'plantuml',
    source: '@startuml\nAlice -> Bob: Hello\n@enduml',
    phase: 'draft',
  },
];

// ============================================================================
// 测试
// ============================================================================

describe('Diagram Pipeline Integration', () => {
  let tmpDir: string;
  let figuresDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'diagram-pipeline-'));
    figuresDir = join(tmpDir, 'figures');

    mockExecFile.mockImplementation((cmd: string, args: string[], opts: any, cb: any) => {
      if (typeof opts === 'function') { cb = opts; }
      cb(null, { stdout: '', stderr: '' });
    });

    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('/png/')) {
        return { ok: true, status: 200, arrayBuffer: async () => Buffer.from('png-data') };
      }
      if (url.includes('/svg/')) {
        return { ok: true, status: 200, text: async () => '<svg>test</svg>' };
      }
      return { ok: false, status: 404, statusText: 'Not Found' };
    });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should complete the full pipeline: render → insert → manifest', async () => {
    const renderer = new DiagramRenderer();

    // Step 1: Render all specs
    const results = await renderer.renderAll(SPECS, figuresDir);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);

    // Step 2: Verify output files exist
    expect(existsSync(join(figuresDir, 'fig1_system_architecture.mmd'))).toBe(true);
    expect(existsSync(join(figuresDir, 'fig2_payment_flow.mmd'))).toBe(true);
    expect(existsSync(join(figuresDir, 'fig3_sequence.puml'))).toBe(true);
    expect(existsSync(join(figuresDir, 'figures-manifest.json'))).toBe(true);

    // Step 3: Verify manifest content
    const manifest: ManifestEntry[] = JSON.parse(
      readFileSync(join(figuresDir, 'figures-manifest.json'), 'utf-8')
    );
    expect(manifest).toHaveLength(3);
    expect(manifest[0].engine).toBe('mermaid');
    expect(manifest[0].files.source).toBe('fig1_system_architecture.mmd');
    expect(manifest[2].engine).toBe('plantuml');
    expect(manifest[2].files.source).toBe('fig3_sequence.puml');

    // Step 4: Insert figure references into MAIN.md
    const updatedMain = insertFigureReferences(MAIN_MD, SPECS, results);

    expect(updatedMain).toContain('![图1 系统整体架构图](./figures/fig1_system_architecture.png)');
    expect(updatedMain).toContain('![图2 离线支付流程图](./figures/fig2_payment_flow.png)');
    expect(updatedMain).toContain('![图3 交互时序图](./figures/fig3_sequence.png)');
    expect(updatedMain).not.toContain('（待补充）');
    expect(updatedMain).toContain('## 具体实施方式');

    // Step 5: Write updated MAIN.md
    writeFileSync(join(tmpDir, 'MAIN.md'), updatedMain, 'utf-8');
    const writtenContent = readFileSync(join(tmpDir, 'MAIN.md'), 'utf-8');
    expect(writtenContent).toContain('![图1 系统整体架构图]');
  });

  it('should handle partial render failures gracefully', async () => {
    // Make fig2 fail
    mockExecFile.mockImplementation((cmd: string, args: string[], opts: any, cb: any) => {
      if (typeof opts === 'function') { cb = opts; }
      if (args.some((a: string) => a.includes('fig2_payment_flow'))) {
        cb(new Error('mmdc render error'));
      } else {
        cb(null, { stdout: '', stderr: '' });
      }
    });

    const renderer = new DiagramRenderer();
    const results = await renderer.renderAll(SPECS, figuresDir);

    // fig1 and fig3 should succeed, fig2 should fail
    expect(results.filter(r => r.success)).toHaveLength(2);
    expect(results.find(r => r.figureId === 'fig2_payment_flow')?.success).toBe(false);

    // Insert should only include successful renders
    const updatedMain = insertFigureReferences(MAIN_MD, SPECS, results);
    expect(updatedMain).toContain('![图1 系统整体架构图]');
    expect(updatedMain).not.toContain('![图2 离线支付流程图]');
    expect(updatedMain).toContain('![图3 交互时序图]');
  });

  it('should support re-rendering a single figure', async () => {
    const renderer = new DiagramRenderer();

    // Initial render
    await renderer.renderAll(SPECS, figuresDir);

    // Re-render fig1 with new source
    const newSource = 'graph TB\n  A[Issuer] --> B[Payer]\n  B --> C[POS]\n  C --> D[Bank]';
    const result = await renderer.rerender('fig1_system_architecture', newSource, figuresDir, 'mermaid');

    expect(result.success).toBe(true);

    // Verify source file was updated
    const sourceContent = readFileSync(join(figuresDir, 'fig1_system_architecture.mmd'), 'utf-8');
    expect(sourceContent).toContain('Bank');
  });
});
