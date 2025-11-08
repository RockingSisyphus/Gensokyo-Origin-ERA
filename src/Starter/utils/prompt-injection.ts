import { Logger } from './log';

const logger = new Logger();

export const PROMPT_INJECTION_ID = 'gsk_base_prompt_injection';

export function refreshInjectedPrompt(prompt: string): void {
  if (!prompt.trim()) {
    logger.warn('refreshInjectedPrompt', 'prompt 为空，跳过注入。');
    return;
  }

  try {
    if (typeof uninjectPrompts === 'function') {
      uninjectPrompts([PROMPT_INJECTION_ID]);
    }

    if (typeof injectPrompts === 'function') {
      injectPrompts([
        {
          id: PROMPT_INJECTION_ID,
          position: 'in_chat',
          depth: 0,
          role: 'user',
          content: prompt,
          should_scan: false,
        },
      ]);
    } else {
      logger.warn('refreshInjectedPrompt', 'injectPrompts 不可用，跳过提示词注入。');
    }
  } catch (err: any) {
    logger.error('refreshInjectedPrompt', '注入提示词失败: ' + (err?.message || String(err)), err);
  }
}
