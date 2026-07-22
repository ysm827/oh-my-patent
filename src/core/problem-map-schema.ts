export interface ExistingSolution {
  refId: string;
  approach: string;
  limitation: string;
}

export interface TechProblem {
  id: string;
  problem: string;
  existingSolutions: ExistingSolution[];
  unresolvedGap: string;
}

export interface ProblemMap {
  topic: string;
  generatedDate: string;
  problems: TechProblem[];
}

export interface ProblemMapValidationResult {
  valid: boolean;
  errors: string[];
}

function isValidRefId(id: string): boolean {
  return /^R\d+$/.test(id);
}

export function parseProblemMap(markdown: string): ProblemMap {
  const topicMatch = markdown.match(/^#\s+技术问题映射[：:]\s*(.+)$/m);
  const dateMatch = markdown.match(/\*\*生成日期\*\*[：:]\s*(.+)$/m);

  const problems: TechProblem[] = [];
  const problemPattern = /^##\s+技术问题\s*\d+[：:]\s*(.+)$/gm;
  let probMatch: RegExpExecArray | null;

  while ((probMatch = problemPattern.exec(markdown)) !== null) {
    const problemText = probMatch[1].trim();
    const sectionStart = probMatch.index + probMatch[0].length;
    const nextProbMatch = markdown.slice(sectionStart).match(/^##\s+技术问题\s*\d+/m);
    const sectionEnd = nextProbMatch ? sectionStart + (nextProbMatch.index ?? 0) : markdown.length;
    const section = markdown.slice(sectionStart, sectionEnd);

    const solutions: ExistingSolution[] = [];
    const solPattern = /-\s*\[(R\d+)\]\s*(.+?)(?:\n|$)/g;
    let solMatch: RegExpExecArray | null;
    while ((solMatch = solPattern.exec(section)) !== null) {
      const refId = solMatch[1];
      const rest = solMatch[2].trim();
      const limitationMatch = rest.match(/(?:，|；|。|—|,|;)\s*(.+)/);
      solutions.push({
        refId,
        approach: limitationMatch ? rest.slice(0, limitationMatch.index).trim() : rest,
        limitation: limitationMatch ? limitationMatch[1].trim() : '',
      });
    }

    const gapMatch = section.match(/未解缺口[：:]\s*(.+)/);

    const idMatch = probMatch[0].match(/(\d+)/);
    problems.push({
      id: idMatch ? `P${idMatch[1]}` : `P${problems.length + 1}`,
      problem: problemText,
      existingSolutions: solutions,
      unresolvedGap: gapMatch ? gapMatch[1].trim() : '',
    });
  }

  return {
    topic: topicMatch ? topicMatch[1].trim() : '',
    generatedDate: dateMatch ? dateMatch[1].trim() : '',
    problems,
  };
}

export function validateProblemMap(parsed: ProblemMap): ProblemMapValidationResult {
  const errors: string[] = [];

  if (parsed.problems.length < 3) {
    errors.push(`insufficient problems (min 3, got ${parsed.problems.length})`);
  }
  for (const p of parsed.problems) {
    if (p.existingSolutions.length < 2) {
      errors.push(`problem ${p.id} needs min 2 solutions, got ${p.existingSolutions.length}`);
    }
    if (!p.unresolvedGap) {
      errors.push(`problem ${p.id} missing unresolved gap`);
    }
    for (const s of p.existingSolutions) {
      if (!isValidRefId(s.refId)) {
        errors.push(`problem ${p.id}: invalid reference format: ${s.refId}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
