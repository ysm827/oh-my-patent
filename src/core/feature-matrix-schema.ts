export interface TechFeature {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface FeatureCell {
  featureId: string;
  refId: string;
  status: 'present' | 'absent' | 'partial';
  note: string;
}

export interface FeatureMatrix {
  topic: string;
  generatedDate: string;
  features: TechFeature[];
  references: string[];
  cells: FeatureCell[];
  differentiators: string[];
}

export interface FeatureValidationResult {
  valid: boolean;
  errors: string[];
}

export function parseFeatureMatrix(markdown: string): FeatureMatrix {
  const topicMatch = markdown.match(/^#\s+技术特征对比矩阵[：:]\s*(.+)$/m);
  const dateMatch = markdown.match(/\*\*生成日期\*\*[：:]\s*(.+)$/m);

  const features: TechFeature[] = [];
  const featPattern = /^\|\s*(F\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/gm;
  let featMatch: RegExpExecArray | null;
  while ((featMatch = featPattern.exec(markdown)) !== null) {
    if (featMatch[1] === 'ID') continue;
    features.push({
      id: featMatch[1],
      name: featMatch[2].trim(),
      category: featMatch[3].trim(),
      description: featMatch[4].trim(),
    });
  }

  const matrixSection = markdown.match(/##\s+对比矩阵[\s\S]*?(?=##\s|$)/);
  const references: string[] = [];
  if (matrixSection) {
    const headerMatch = matrixSection[0].match(/^\|(.+)$/m);
    if (headerMatch) {
      const cols = headerMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      for (const col of cols) {
        if (col === '特征') continue;
        const refM = col.match(/(R\d+)/);
        if (refM) references.push(refM[1]);
        else if (col.includes('本发明') || col.includes('INVENTION')) references.push('INVENTION');
      }
    }
  }

  const cells: FeatureCell[] = [];
  if (matrixSection) {
    const rowPattern = /^\|(.+?)\|/gm;
    let rowMatch: RegExpExecArray | null;
    const headerRowSkipped = { done: false };
    while ((rowMatch = rowPattern.exec(matrixSection[0])) !== null) {
      if (!headerRowSkipped.done) { headerRowSkipped.done = true; continue; }
      const cols = rowMatch[1].split('|').map(s => s.trim());
      const featIdCol = cols[0];
      const featIdM = featIdCol.match(/(F\d+)/);
      if (!featIdM) continue;
      const featId = featIdM[1];
      for (let i = 1; i < cols.length && i - 1 < references.length; i++) {
        const cellText = cols[i].trim();
        const status: FeatureCell['status'] =
          cellText.startsWith('有') ? 'present' :
          cellText.startsWith('部分') ? 'partial' : 'absent';
        cells.push({ featureId: featId, refId: references[i - 1], status, note: cellText });
      }
    }
  }

  const diffSection = markdown.match(/##\s+差异点汇总[\s\S]*$/);
  const differentiators: string[] = [];
  if (diffSection) {
    const diffPattern = /^(F\d+)/gm;
    let diffMatch: RegExpExecArray | null;
    while ((diffMatch = diffPattern.exec(diffSection[0])) !== null) {
      differentiators.push(diffMatch[1]);
    }
  }

  return {
    topic: topicMatch ? topicMatch[1].trim() : '',
    generatedDate: dateMatch ? dateMatch[1].trim() : '',
    features,
    references,
    cells,
    differentiators,
  };
}

export function validateFeatureMatrix(parsed: FeatureMatrix): FeatureValidationResult {
  const errors: string[] = [];

  if (parsed.features.length < 5) {
    errors.push(`insufficient features (min 5, got ${parsed.features.length})`);
  }
  if (!parsed.references.includes('INVENTION')) {
    errors.push('missing INVENTION column');
  }
  if (parsed.references.filter(r => r !== 'INVENTION').length < 3) {
    errors.push(`insufficient references (min 3 plus INVENTION, got ${parsed.references.length})`);
  }
  const expectedCells = parsed.features.length * parsed.references.length;
  if (expectedCells > 0 && parsed.cells.length !== expectedCells) {
    errors.push(`incomplete matrix: expected ${expectedCells} cells, got ${parsed.cells.length}`);
  }
  if (parsed.differentiators.length === 0) {
    errors.push('no differentiators found');
  }
  for (const f of parsed.features) {
    if (!f.description) {
      errors.push(`feature ${f.id} missing description`);
    }
  }
  const validRefIds = new Set(parsed.references);
  for (const c of parsed.cells) {
    if (!validRefIds.has(c.refId)) {
      errors.push(`cell references unknown refId: ${c.refId}`);
    }
  }
  const validFeatIds = new Set(parsed.features.map(f => f.id));
  for (const c of parsed.cells) {
    if (!validFeatIds.has(c.featureId)) {
      errors.push(`cell references unknown featureId: ${c.featureId}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
