import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * @description 生成主角提示词
 */
export function buildMainCharacterPrompt({ stat }: { stat: Stat | null }): string | null {
  const funcName = 'buildMainCharacterPrompt';

  try {
    const user = stat?.user;
    if (!user) {
      logger.warn(funcName, '正在生成主角提示词。');
      return null;
    }

    const userJson = JSON.stringify({ user }, null, 2);
    const header = '主角状态提示：请根据以下JSON结构更新主角的叙述与状态。';
    const prompt = `${header}\n${userJson}\n`;
    logger.debug(funcName, '主角提示词生成完成。');
    return prompt;
  } catch (err: any) {
    logger.error(funcName, '生成主角提示词失败: ' + (err?.message || String(err)), err);
    return null;
  }
}
