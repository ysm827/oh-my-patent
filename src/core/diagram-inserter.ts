/**
 * Diagram Inserter - MAIN.md 图引用插入器
 *
 * 在专利交底书的"附图说明"章节插入或更新图片引用。
 * 支持：
 * - 首次插入图引用（draft 阶段）
 * - 更新已有图引用（final 阶段）
 */

import { FigureSpec, RenderResult, ManifestEntry } from './diagram-types.js';

// ============================================================================
// 章节定位
// ============================================================================

/**
 * 在 MAIN.md 中查找"附图说明"章节的位置
 *
 * @returns { startIndex, endIndex, existingContent } 或 null
 */
function findFigureSection(content: string): {
  headerStart: number;
  sectionEnd: number;
  existingContent: string;
} | null {
  // 匹配 "## 附图说明" 或 "##（八）附图说明" 等变体
  const sectionRegex = /^##\s*.*附图说明.*$/m;
  const match = sectionRegex.exec(content);

  if (!match) {
    return null;
  }

  const headerStart = match.index;
  const headerEnd = headerStart + match[0].length;

  // 找到下一个 ## 级别标题的位置作为章节结束
  const nextSectionRegex = /^##\s/m;
  const afterHeader = content.slice(headerEnd);
  const nextMatch = nextSectionRegex.exec(afterHeader);

  const sectionEnd = nextMatch
    ? headerEnd + nextMatch.index
    : content.length;

  return {
    headerStart,
    sectionEnd,
    existingContent: content.slice(headerStart, sectionEnd),
  };
}

// ============================================================================
// 图引用格式化
// ============================================================================

/**
 * 生成单张图的 Markdown 引用块
 */
function formatFigureReference(spec: FigureSpec): string {
  const sourceExt = spec.engine === 'mermaid' ? 'mmd' : 'puml';
  return [
    '',
    `![图${spec.figureNumber} ${spec.title}](./figures/${spec.figureId}.png)`,
    '',
    `图${spec.figureNumber} ${spec.title}`,
    '',
  ].join('\n');
}

/**
 * 生成全部图的 Markdown 引用内容
 */
function formatAllFigureReferences(specs: FigureSpec[]): string {
  return specs
    .sort((a, b) => a.figureNumber - b.figureNumber)
    .map(spec => formatFigureReference(spec))
    .join('\n');
}

// ============================================================================
// 公开 API
// ============================================================================

/**
 * 在 MAIN.md 中插入图引用
 *
 * 如果"附图说明"章节存在，替换其内容；
 * 如果不存在，在"具体实施方式"章节之前插入新章节。
 *
 * @param mainMdContent - MAIN.md 的原始内容
 * @param specs - 图规格数组
 * @param results - 渲染结果数组（用于确认哪些图成功渲染）
 * @returns 更新后的 MAIN.md 内容
 */
export function insertFigureReferences(
  mainMdContent: string,
  specs: FigureSpec[],
  results: RenderResult[]
): string {
  // 只插入成功渲染的图
  const successIds = new Set(results.filter(r => r.success).map(r => r.figureId));
  const validSpecs = specs.filter(s => successIds.has(s.figureId));

  if (validSpecs.length === 0) {
    return mainMdContent;
  }

  const section = findFigureSection(mainMdContent);

  if (section) {
    // 替换已有章节内容
    const newContent = `${section.existingContent.split('\n')[0]}\n${formatAllFigureReferences(validSpecs)}`;
    return mainMdContent.slice(0, section.headerStart) + newContent + mainMdContent.slice(section.sectionEnd);
  }

  // 章节不存在，在"具体实施方式"之前插入
  const implSectionRegex = /^##\s*.*具体实施方式.*$/m;
  const implMatch = implSectionRegex.exec(mainMdContent);

  const newSection = `## 附图说明\n${formatAllFigureReferences(validSpecs)}`;

  if (implMatch) {
    return mainMdContent.slice(0, implMatch.index) + newSection + '\n' + mainMdContent.slice(implMatch.index);
  }

  // 都找不到，追加到文件末尾
  return mainMdContent + '\n' + newSection;
}

/**
 * 更新 MAIN.md 中的图引用（终版替换初版）
 *
 * 与 insertFigureReferences 逻辑相同，但语义上表示更新操作。
 * 终版图会完全替换"附图说明"章节的内容。
 *
 * @param mainMdContent - MAIN.md 的原始内容
 * @param specs - 终版图规格数组
 * @param results - 终版渲染结果数组
 * @returns 更新后的 MAIN.md 内容
 */
export function updateFigureReferences(
  mainMdContent: string,
  specs: FigureSpec[],
  results: RenderResult[]
): string {
  // 更新操作等价于重新插入（覆盖已有内容）
  return insertFigureReferences(mainMdContent, specs, results);
}
