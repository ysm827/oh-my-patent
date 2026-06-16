export enum IntentType {
  NEW_PROJECT = 'NEW_PROJECT',
  SEARCH = 'SEARCH',
  BRAINSTORM = 'BRAINSTORM',
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  DIAGRAM = 'DIAGRAM',
  STATUS = 'STATUS',
  CONTINUE_WORKFLOW = 'CONTINUE_WORKFLOW',
  UNKNOWN = 'UNKNOWN'
}

export interface IntentResult {
  type: IntentType;
  confidence: number;
  extracted?: {
    topic?: string;
    query?: string;
  };
}

interface IntentPattern {
  pattern: RegExp;
  confidence: number;
}

const INTENT_PATTERNS: Record<IntentType, IntentPattern[]> = {
  [IntentType.NEW_PROJECT]: [
    { pattern: /(我有.{0,5}(想法|方案|发明|创新))/, confidence: 0.8 },
    { pattern: /(想申请.{0,10}专利)/, confidence: 0.9 },
    { pattern: /(基于.{1,30}的.{1,30}(方法|系统|装置|方案))/, confidence: 0.95 }
  ],
  [IntentType.SEARCH]: [
    { pattern: /(检索|搜索|查找).{0,10}(现有技术|专利|文献)/, confidence: 0.9 },
    { pattern: /(查一下).{0,10}(相关|类似).{0,20}(专利|技术)/, confidence: 0.85 }
  ],
  [IntentType.BRAINSTORM]: [
    { pattern: /(头脑风暴|创新点|创意)/, confidence: 0.9 },
    { pattern: /(生成.{0,5}创新点)/, confidence: 0.85 }
  ],
  [IntentType.DRAFT]: [
    { pattern: /(写|撰写|生成).{0,10}(交底书|说明书)/, confidence: 0.9 },
    { pattern: /(帮我写).{0,10}(交底书|专利)/, confidence: 0.85 }
  ],
  [IntentType.REVIEW]: [
    { pattern: /(审核|检查|审查).{0,10}(交底书|专利)/, confidence: 0.9 },
    { pattern: /(写得怎么样)/, confidence: 0.8 }
  ],
  [IntentType.DIAGRAM]: [
    { pattern: /(生成|画|绘制).{0,10}(图|附图|架构图|流程图)/, confidence: 0.9 },
    { pattern: /(专利图|交底书图|技术图)/, confidence: 0.85 },
    { pattern: /(重新生成|重画|修改).{0,10}(图|附图)/, confidence: 0.85 }
  ],
  [IntentType.STATUS]: [
    { pattern: /(状态|进度)/, confidence: 0.8 },
    { pattern: /(到哪里了)/, confidence: 0.7 }
  ],
  [IntentType.CONTINUE_WORKFLOW]: [
    { pattern: /^(继续|下一步|continue)$/i, confidence: 0.9 }
  ],
  [IntentType.UNKNOWN]: []
};

export function classifyIntent(input: string): IntentResult {
  const normalizedInput = input.trim();
  let bestMatch: { type: IntentType; confidence: number } | null = null;

  for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (intentType === IntentType.UNKNOWN) continue;

    for (const { pattern, confidence } of patterns) {
      if (pattern.test(normalizedInput)) {
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { type: intentType as IntentType, confidence };
        }
      }
    }
  }

  if (bestMatch) {
    const result: IntentResult = {
      type: bestMatch.type,
      confidence: bestMatch.confidence
    };

    if (bestMatch.type === IntentType.NEW_PROJECT) {
      const topicMatch = normalizedInput.match(/基于(.{1,50})的/) ||
        normalizedInput.match(/(.{2,50})(方法|系统|装置|方案)$/);
      if (topicMatch) {
        result.extracted = { topic: topicMatch[1] };
      }
    }

    return result;
  }

  return { type: IntentType.UNKNOWN, confidence: 0.3 };
}
