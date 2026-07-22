export interface LandscapeEntry {
  id: string;
  type: 'patent' | 'paper' | 'standard';
  title: string;
  source: string;
  year: number;
  relevance: number;
  authors?: string;
  applicant?: string;
  ipcCodes?: string[];
  citationCount?: number;
}

export interface LandscapeMeta {
  topic: string;
  searchDate: string;
  keywords: string[];
  timeRange: string;
  sources: string[];
}

export interface LandscapeStatistics {
  patentCount: number;
  paperCount: number;
  standardCount: number;
  totalCitations: number;
  averageYear: number;
}

export interface ParsedLandscape {
  meta: LandscapeMeta;
  entries: LandscapeEntry[];
  statistics: LandscapeStatistics;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function parseRefId(id: string): number | null {
  const m = id.match(/^R(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

export function parseLandscape(markdown: string): ParsedLandscape {
  const topicMatch = markdown.match(/^#\s+技术全景[：:]\s*(.+)$/m);
  const dateMatch = markdown.match(/\*\*检索日期\*\*[：:]\s*(.+)$/m);
  const keywordsMatch = markdown.match(/\*\*关键词\*\*[：:]\s*(.+)$/m);
  const timeRangeMatch = markdown.match(/\*\*时间范围\*\*[：:]\s*(.+)$/m);
  const sourcesMatch = markdown.match(/\*\*数据源\*\*[：:]\s*(.+)$/m);

  const meta: LandscapeMeta = {
    topic: topicMatch ? topicMatch[1].trim() : '',
    searchDate: dateMatch ? dateMatch[1].trim() : '',
    keywords: keywordsMatch ? keywordsMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [],
    timeRange: timeRangeMatch ? timeRangeMatch[1].trim() : '',
    sources: sourcesMatch ? sourcesMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [],
  };

  const entries: LandscapeEntry[] = [];
  const refPattern = /^###\s+\[(R\d+)\]\s+(.+)$/gm;
  let refMatch: RegExpExecArray | null;
  while ((refMatch = refPattern.exec(markdown)) !== null) {
    const id = refMatch[1];
    const title = refMatch[2].trim();
    const sectionStart = refMatch.index + refMatch[0].length;
    const nextSectionMatch = markdown.slice(sectionStart).match(/^##\s/m);
    const sectionEnd = nextSectionMatch ? sectionStart + (nextSectionMatch.index ?? 0) : markdown.length;
    const section = markdown.slice(sectionStart, sectionEnd);

    const typeMatch = section.match(/类型[：:]\s*(专利|论文|标准)/);
    const sourceMatch2 = section.match(/来源[：:]\s*(.+)/);
    const yearMatch = section.match(/(\d{4})/);
    const relevanceMatch = section.match(/相关度\**[：:]\s*\**\s*[^⭐]*(⭐+)/);

    const typeMap: Record<string, 'patent' | 'paper' | 'standard'> = {
      '专利': 'patent', '论文': 'paper', '标准': 'standard'
    };

    entries.push({
      id,
      type: typeMatch ? typeMap[typeMatch[1]] ?? 'patent' : 'patent',
      title,
      source: sourceMatch2 ? sourceMatch2[1].trim() : '',
      year: yearMatch ? parseInt(yearMatch[1], 10) : 0,
      relevance: relevanceMatch ? relevanceMatch[1].length : 0,
    });
  }

  const patentCount = entries.filter(e => e.type === 'patent').length;
  const paperCount = entries.filter(e => e.type === 'paper').length;
  const standardCount = entries.filter(e => e.type === 'standard').length;
  const totalCitations = entries.reduce((sum, e) => sum + (e.citationCount ?? 0), 0);
  const years = entries.map(e => e.year).filter(y => y > 0);
  const averageYear = years.length > 0 ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : 0;

  return {
    meta,
    entries,
    statistics: { patentCount, paperCount, standardCount, totalCitations, averageYear },
  };
}

export function validateLandscape(parsed: ParsedLandscape): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!parsed.meta.topic) errors.push('missing topic');
  if (!parsed.meta.searchDate) errors.push('missing searchDate');
  if (parsed.meta.keywords.length === 0) errors.push('missing keywords');
  if (parsed.meta.sources.length === 0) errors.push('missing sources');

  if (parsed.entries.length === 0) {
    errors.push('no entries found');
  } else {
    const refNumbers = parsed.entries
      .map(e => parseRefId(e.id))
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);

    if (refNumbers.length === 0) {
      errors.push('no valid [R#] reference IDs found');
    } else {
      for (let i = 0; i < refNumbers.length; i++) {
        const expected = i + 1;
        if (refNumbers[i] !== expected) {
          errors.push(`non-sequential reference numbers: expected R${expected}, got R${refNumbers[i]}`);
          break;
        }
      }
    }

    for (const entry of parsed.entries) {
      if (entry.relevance < 0 || entry.relevance > 5) {
        errors.push(`relevance out of range for ${entry.id}: ${entry.relevance}`);
      }
      if (entry.year < 1900 || entry.year > new Date().getFullYear() + 1) {
        errors.push(`invalid year for ${entry.id}: ${entry.year}`);
      }
      if (!entry.title) {
        errors.push(`missing title for ${entry.id}`);
      }
    }

    const actualPatent = parsed.entries.filter(e => e.type === 'patent').length;
    const actualPaper = parsed.entries.filter(e => e.type === 'paper').length;
    const actualStandard = parsed.entries.filter(e => e.type === 'standard').length;
    if (actualPatent !== parsed.statistics.patentCount) {
      errors.push(`statistics mismatch: patentCount=${parsed.statistics.patentCount} but actual=${actualPatent}`);
    }
    if (actualPaper !== parsed.statistics.paperCount) {
      errors.push(`statistics mismatch: paperCount=${parsed.statistics.paperCount} but actual=${actualPaper}`);
    }
    if (actualStandard !== parsed.statistics.standardCount) {
      errors.push(`statistics mismatch: standardCount=${parsed.statistics.standardCount} but actual=${actualStandard}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
