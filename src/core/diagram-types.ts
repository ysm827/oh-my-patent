/**
 * Diagram Types - 专利图类型定义
 *
 * 定义专利交底书附图的规格、渲染结果和清单条目类型。
 */

// ============================================================================
// 图类型和引擎
// ============================================================================

/**
 * 图类型
 */
export type DiagramType = 'architecture' | 'flowchart' | 'sequence' | 'state' | 'component';

/**
 * 渲染引擎
 */
export type Engine = 'mermaid' | 'plantuml';

/**
 * 渲染阶段
 */
export type RenderPhase = 'draft' | 'final';

// ============================================================================
// 图规格
// ============================================================================

/**
 * 图规格 — 描述一张待渲染的专利附图
 */
export interface FigureSpec {
  /** 图ID，如 "fig1_system_architecture" */
  figureId: string;
  /** 图序号，1, 2, 3... */
  figureNumber: number;
  /** 图标题，如 "系统整体架构图" */
  title: string;
  /** 图的文字描述 */
  description: string;
  /** 图类型 */
  diagramType: DiagramType;
  /** 渲染引擎 */
  engine: Engine;
  /** Mermaid 或 PlantUML 源代码 */
  source: string;
  /** 渲染阶段 */
  phase: RenderPhase;
}

// ============================================================================
// 渲染结果
// ============================================================================

/**
 * 单张图的渲染结果
 */
export interface RenderResult {
  /** 图ID */
  figureId: string;
  /** SVG 文件路径 */
  svgPath: string;
  /** PNG 文件路径 */
  pngPath: string;
  /** 源文件路径（.mmd 或 .puml） */
  sourcePath: string;
  /** 是否渲染成功 */
  success: boolean;
  /** 错误信息（失败时） */
  error?: string;
}

// ============================================================================
// 清单条目
// ============================================================================

/**
 * figures-manifest.json 中的单条记录
 */
export interface ManifestEntry {
  /** 图ID */
  figureId: string;
  /** 图序号 */
  figureNumber: number;
  /** 图标题 */
  title: string;
  /** 图类型 */
  diagramType: DiagramType;
  /** 渲染引擎 */
  engine: Engine;
  /** 渲染阶段 */
  phase: RenderPhase;
  /** 输出文件路径（相对于 figures/ 目录） */
  files: {
    source: string;
    svg: string;
    png: string;
  };
}

// ============================================================================
// 渲染器配置
// ============================================================================

/**
 * 渲染器配置
 */
export interface RendererConfig {
  /** PlantUML server URL，默认 https://www.plantuml.com/plantuml */
  plantumlServerUrl: string;
  /** 默认引擎 */
  defaultEngine: Engine;
  /** mmdc 可执行文件路径，默认 "mmdc" */
  mmdcPath: string;
  /** 渲染超时（毫秒），默认 30000 */
  timeout: number;
}

/**
 * 默认渲染器配置
 */
export const DEFAULT_RENDERER_CONFIG: RendererConfig = {
  plantumlServerUrl: 'https://www.plantuml.com/plantuml',
  defaultEngine: 'mermaid',
  mmdcPath: 'mmdc',
  timeout: 30000,
};

/**
 * 图类型到 Mermaid 图类型关键词的映射
 */
export const MERMAID_DIAGRAM_KEYWORDS: Record<DiagramType, string> = {
  architecture: 'graph',
  flowchart: 'flowchart',
  sequence: 'sequenceDiagram',
  state: 'stateDiagram-v2',
  component: 'graph',
};

/**
 * 图类型到 PlantUML 关键词的映射
 */
export const PLANTUML_DIAGRAM_KEYWORDS: Record<DiagramType, string> = {
  architecture: 'package',
  flowchart: 'start',
  sequence: '->',
  state: '[*] -->',
  component: 'component',
};
