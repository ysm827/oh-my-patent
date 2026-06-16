export enum QualityLevel {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

export interface QualityIssue {
  field: string;
  level: QualityLevel;
  message: string;
  suggestion?: string;
}

interface CheckRule {
  field: string;
  pattern: RegExp;
  level: QualityLevel;
  message: string;
}

const CHECK_RULES: CheckRule[] = [
  { field: 'title', pattern: /^#\s+发明名称/m, level: QualityLevel.ERROR, message: '缺少发明名称' },
  { field: 'technical_field', pattern: /^##\s+技术领域/m, level: QualityLevel.ERROR, message: '缺少技术领域' },
  { field: 'background', pattern: /^##\s+背景技术/m, level: QualityLevel.ERROR, message: '缺少背景技术' },
  { field: 'summary', pattern: /^##\s+发明内容/m, level: QualityLevel.ERROR, message: '缺少发明内容' },
  { field: 'embodiments', pattern: /^##\s+具体实施方式/m, level: QualityLevel.ERROR, message: '缺少具体实施方式' },
  { field: 'claims', pattern: /^##\s+权利要求书[\s\S]*?\d+\./m, level: QualityLevel.ERROR, message: '权利要求书为空或格式错误' },
  { field: 'abstract', pattern: /^##\s+摘要/m, level: QualityLevel.WARNING, message: '缺少摘要' },
  { field: 'drawings', pattern: /附图说明/, level: QualityLevel.WARNING, message: '缺少附图说明' },
  { field: 'claim_count', pattern: /(\d+)\..*\n.*(\d+)\./m, level: QualityLevel.INFO, message: '建议权利要求不少于3项' }
];

export class QualityChecker {
  check(content: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    for (const rule of CHECK_RULES) {
      const found = rule.pattern.test(content);
      if (!found) {
        issues.push({
          field: rule.field,
          level: rule.level,
          message: rule.message
        });
      }
    }

    return issues;
  }

  getScore(content: string): number {
    const issues = this.check(content);
    const errors = issues.filter(i => i.level === QualityLevel.ERROR).length;
    const warnings = issues.filter(i => i.level === QualityLevel.WARNING).length;
    const infos = issues.filter(i => i.level === QualityLevel.INFO).length;

    const errorPenalty = errors * 20;
    const warningPenalty = warnings * 5;
    const infoPenalty = infos * 2;

    return Math.max(0, 100 - errorPenalty - warningPenalty - infoPenalty);
  }
}
