import { classifyIntent, IntentType } from '../core/router.js';
import { validateConsistency } from '../core/validator.js';
import { PatentState } from '../core/state.js';

interface ProcessContext {
  existingState?: PatentState;
  fileExists: (path: string) => boolean;
}

interface ProcessResult {
  action: string;
  extractedData?: Record<string, string>;
  message?: string;
}

export class ArchimedesOrchestrator {
  async processInput(input: string, context: ProcessContext): Promise<ProcessResult> {
    const intent = classifyIntent(input);

    if (context.existingState) {
      const consistency = validateConsistency(
        context.existingState as unknown as Record<string, unknown>,
        context.fileExists
      );

      if (!consistency.consistent) {
        return {
          action: 'PROMPT_USER',
          message: `状态不一致: ${consistency.errors.concat(consistency.missing).join(', ')}`
        };
      }
    }

    switch (intent.type) {
      case IntentType.NEW_PROJECT:
        return {
          action: 'CREATE_PROJECT',
          extractedData: intent.extracted
        };

      case IntentType.CONTINUE_WORKFLOW:
        if (context.existingState) {
          const stage = context.existingState.current_stage;
          return {
            action: `CONTINUE_${stage}`
          };
        }
        return { action: 'NO_PROJECT', message: '请先创建项目' };

      case IntentType.SEARCH:
        if (context.existingState?.current_stage === 'BRAINSTORM_R1') {
          return {
            action: 'RE_SEARCH',
            extractedData: intent.extracted as Record<string, string> | undefined,
            message: '检测到补检请求，回退到 RESEARCH 阶段'
          };
        }
        return {
          action: 'EXECUTE_SEARCH',
          extractedData: intent.extracted as Record<string, string> | undefined
        };

      case IntentType.BRAINSTORM:
        return { action: 'START_BRAINSTORM' };

      case IntentType.DIAGRAM:
        return { action: 'START_DIAGRAM' };

      case IntentType.STATUS:
        return { action: 'SHOW_STATUS' };

      case IntentType.DRAFT:
        return { action: 'START_DRAFT' };

      case IntentType.REVIEW:
        return { action: 'START_REVIEW' };

      default:
        return { action: 'UNKNOWN', message: '无法理解您的意图' };
    }
  }
}
