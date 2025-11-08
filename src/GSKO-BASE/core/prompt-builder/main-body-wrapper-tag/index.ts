import type { Stat } from '../../../schema/stat';
import dedent from 'dedent';
import { Logger } from '../../../utils/log';

const logger = new Logger('main-body-wrapper-tag');

/**
 * @description 从 stat.config.mainBodyTags 生成提示，要求 AI 使用指定的 XML 标签包裹故事正文。
 * @param stat Stat 对象。
 * @returns 如果设置了 mainBodyTags，则返回生成的提示字符串，否则返回 null。
 */
export function buildMainBodyWrapperTagPrompt({ stat }: { stat: Stat | null }): string | null {
  const funcName = 'buildMainBodyWrapperTagPrompt';

  try {
    if (!stat) {
      logger.debug(funcName, 'Stat 对象为空，跳过。');
      return null;
    }

    const tags = stat.config?.mainBodyTags;

    if (!tags || tags.length === 0) {
      logger.debug(funcName, 'config.mainBodyTags 未设置或为空，跳过。');
      return null;
    }

    const tagExamples = tags
      .map((tag: string) => {
        const L = '<';
        const R = '>';
        const SL = '/';
        return `${L}${tag}${R}...${L}${SL}${tag}${R}`;
      })
      .join(' 或 ');

    const prompt = dedent`
      请在你的回复中，将故事正文用 ${tagExamples} 标签包裹起来。
    `;

    logger.debug(funcName, '生成正文包裹标签提示成功。', { prompt });
    return prompt;
  } catch (err: any) {
    logger.error(funcName, '生成正文包裹标签提示失败: ' + (err?.message || String(err)), err);
    return null;
  }
}
