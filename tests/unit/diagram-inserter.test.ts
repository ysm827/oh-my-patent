import { describe, it, expect } from 'vitest';
import { insertFigureReferences, updateFigureReferences } from '../../src/core/diagram-inserter';
import { FigureSpec, RenderResult } from '../../src/core/diagram-types';

// ============================================================================
// 测试数据
// ============================================================================

const makeSpec = (overrides: Partial<FigureSpec> = {}): FigureSpec => ({
  figureId: 'fig1_system_architecture',
  figureNumber: 1,
  title: '系统整体架构图',
  description: '展示系统各模块及其交互关系',
  diagramType: 'architecture',
  engine: 'mermaid',
  source: 'graph TB\n  A --> B',
  phase: 'draft',
  ...overrides,
});

const makeResult = (overrides: Partial<RenderResult> = {}): RenderResult => ({
  figureId: 'fig1_system_architecture',
  svgPath: '/tmp/fig1.svg',
  pngPath: '/tmp/fig1.png',
  sourcePath: '/tmp/fig1.mmd',
  success: true,
  ...overrides,
});

const MAIN_MD_WITH_SECTION = `# 专利交底书

## 技术领域

本发明涉及...

## 附图说明

（待补充）

## 具体实施方式

以下是具体实施方式...
`;

const MAIN_MD_WITHOUT_SECTION = `# 专利交底书

## 技术领域

本发明涉及...

## 具体实施方式

以下是具体实施方式...
`;

const MAIN_MD_NO_IMPL_SECTION = `# 专利交底书

## 技术领域

本发明涉及...
`;

// ============================================================================
// 测试
// ============================================================================

describe('insertFigureReferences', () => {
  it('should insert figure references into existing 附图说明 section', () => {
    const spec = makeSpec();
    const result = makeResult();
    const updated = insertFigureReferences(MAIN_MD_WITH_SECTION, [spec], [result]);

    expect(updated).toContain('![图1 系统整体架构图](./figures/fig1_system_architecture.png)');
    expect(updated).toContain('图1 系统整体架构图');
    expect(updated).not.toContain('（待补充）');
    expect(updated).toContain('## 具体实施方式');
  });

  it('should insert new 附图说明 section before 具体实施方式 if missing', () => {
    const spec = makeSpec();
    const result = makeResult();
    const updated = insertFigureReferences(MAIN_MD_WITHOUT_SECTION, [spec], [result]);

    expect(updated).toContain('## 附图说明');
    expect(updated).toContain('![图1 系统整体架构图](./figures/fig1_system_architecture.png)');
    // 附图说明 should come before 具体实施方式
    const diagramIdx = updated.indexOf('## 附图说明');
    const implIdx = updated.indexOf('## 具体实施方式');
    expect(diagramIdx).toBeLessThan(implIdx);
  });

  it('should append section at end if no 具体实施方式 found', () => {
    const spec = makeSpec();
    const result = makeResult();
    const updated = insertFigureReferences(MAIN_MD_NO_IMPL_SECTION, [spec], [result]);

    expect(updated).toContain('## 附图说明');
    expect(updated).toContain('![图1 系统整体架构图]');
  });

  it('should skip failed renders', () => {
    const spec = makeSpec();
    const failedResult = makeResult({ success: false, error: 'render failed' });
    const updated = insertFigureReferences(MAIN_MD_WITH_SECTION, [spec], [failedResult]);

    expect(updated).not.toContain('![图1');
    // Should not modify content if all renders failed
    expect(updated).toContain('（待补充）');
  });

  it('should insert multiple figures in order', () => {
    const specs = [
      makeSpec({ figureId: 'fig2_flow', figureNumber: 2, title: '流程图', engine: 'mermaid' }),
      makeSpec({ figureId: 'fig1_arch', figureNumber: 1, title: '架构图', engine: 'mermaid' }),
    ];
    const results = [
      makeResult({ figureId: 'fig2_flow' }),
      makeResult({ figureId: 'fig1_arch' }),
    ];

    const updated = insertFigureReferences(MAIN_MD_WITH_SECTION, specs, results);

    const fig1Idx = updated.indexOf('![图1 架构图]');
    const fig2Idx = updated.indexOf('![图2 流程图]');
    expect(fig1Idx).toBeLessThan(fig2Idx);
  });

  it('should use .puml extension for PlantUML engine', () => {
    const spec = makeSpec({ engine: 'plantuml' });
    const result = makeResult();
    // The reference always points to PNG regardless of engine
    const updated = insertFigureReferences(MAIN_MD_WITH_SECTION, [spec], [result]);
    expect(updated).toContain('./figures/fig1_system_architecture.png');
  });

  it('should not modify content when specs array is empty', () => {
    const updated = insertFigureReferences(MAIN_MD_WITH_SECTION, [], []);
    expect(updated).toBe(MAIN_MD_WITH_SECTION);
  });
});

describe('updateFigureReferences', () => {
  it('should replace existing figure references with updated ones', () => {
    const spec = makeSpec({ phase: 'final', title: '系统整体架构图（终版）' });
    const result = makeResult();
    const updated = updateFigureReferences(MAIN_MD_WITH_SECTION, [spec], [result]);

    expect(updated).toContain('图1 系统整体架构图（终版）');
  });
});
